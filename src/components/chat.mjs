import { useState, useEffect } from 'preact/hooks';
import fuzzysearch from 'fuzzysearch';
import snarkdown from 'snarkdown';

import { fetchDatabaseEventBus } from '../helpers/api.mjs'
import { createEventSource } from '../helpers/create-eventsource.mjs';

import {
  div,
  span,
  ol,
  li,
  img,
  form,
  label,
  input,
  p,
} from '../create-element.mjs';

const formatChatMessageData = ([
  id,
  { username, timestamp, msg, date = new Date(timestamp * 1000) },
]) => ({
  id,
  sender: username,
  time: `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`,
  body: snarkdown(msg.replace('==markdown==', '')),
});

export default function chat({ authenticationData }) {
  const [newMessage, setNewMessage] = useState('');
  const [newMessageTypeahead, setNewMessageTypeahead] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    createEventSource({
      url: 'https://treesradio-live.firebaseio.com/chat.json',
      listener: ({ data, parsedEvent = JSON.parse(data) }) => {
        if (parsedEvent.path === '/') {
          setChatMessages(
            Object.entries(parsedEvent.data)
              .map(formatChatMessageData)
              .reverse()
              .slice(0, 50)
          );
        } else {
          setChatMessages(chatMessages => [
            formatChatMessageData([parsedEvent.path, parsedEvent.data]),
            ...chatMessages,
          ]);
        }
      },
    });
  }, []);

  useEffect(() => {
    setNewMessageTypeahead(
      newMessage.startsWith('/') && newMessage.length > 1
        ? [
            '/toke [minutes] [times]',
            '/gif [keywords]',
            '/hype',
            '/join [times]',
            '/approve',
            '/bang',
            '/duckhunt',
            '/friend',
            '/spirittoke',
            '/me [message]',
            '/roll [sides] [times]',
            '/save',
            '/timelimit [minutes]',
          ].find((suggestion) => fuzzysearch(newMessage, suggestion))
        : ''
    );
  }, [newMessage]);

  const handleMessageSubmit = (event) => {
    event.preventDefault();

    fetchDatabaseEventBus(
      `/${authenticationData.localId}.json?auth=${authenticationData.idToken}`,
      {
        [authenticationData.localId]: {
          type: 'chat',
          uid: authenticationData.localId,
          data: { msg: newMessage },
        },
      }
    )
      .then(() => { setNewMessage(''); });
  };

  return [
    ol(
      {
        class: 'overflow-y-scroll flex flex-col-reverse space-y-4 p-2 lg:p-4 bg-gray-100 dark:bg-gray-900 border-t-2 border-purple-500',
        'role': 'log',
        'aria-relevant': 'text',
      },
      chatMessages.map((message) =>
        li(
          {
            key: message.id,
            class: 'flex max-w-prose',
            style: 'overflow-wrap: anywhere;',
          },
          [
            img({
              class: 'w-10 h-10 rounded mr-3',
              src: `https://avatar.tobi.sh/${message.sender}.svg?size=40`,
              alt: '',
            }),
            div({}, [
              div({}, [
                span({ class: 'font-bold' }, message.sender),
                span({ class: 'text-grey text-xs ml-1' }, message.time),
              ]),
              p({ dangerouslySetInnerHTML: { __html: message.body } }),
            ]),
          ]
        )
      )
    ),
    form({ class: 'sticky bottom-0 w-full lg:static', onSubmit: handleMessageSubmit }, [
      label({}, [
        span({ class: 'sr-only' }, 'Send a message'),
        input({
          class: `
            w-full
            p-3
            shadow-2xl
            dark:bg-gray-800
            dark:text-white
          `,
          type: 'text',
          required: true,
          enterkeyhint: 'send',
          value: newMessage,
          placeholder: 'Send a message',
          onInput: (event) => setNewMessage(event.target.value),
        }),
        span(
          { class: 'absolute right-0 mt-3 mr-2 text-gray-500' },
          newMessageTypeahead
        ),
      ]),
    ]),
  ];
}
