import { useEffect } from 'preact/hooks';
import { useComputed, useSignal } from '@preact/signals';
import fuzzysearch from 'fuzzysearch';
import snarkdown from 'snarkdown';

import { fetchDatabaseEventBus } from '../helpers/api.mjs';
import { createEventSource } from '../helpers/create-eventsource.mjs';

import {
  div,
  form,
  img,
  input,
  label,
  li,
  ol,
  p,
  span,
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

export function Chat({ authenticationData }) {
  const newMessage = useSignal('');
  const chatMessages = useSignal([]);

  const newMessageTypeahead = useComputed(() => (
    newMessage.value.startsWith('/') && newMessage.value.length > 1
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
      ].find((suggestion) => fuzzysearch(newMessage.value, suggestion))
      : ''
  ));

  useEffect(() => {
    createEventSource({
      url: 'https://treesradio-live.firebaseio.com/chat.json',
      listener: ({ data, parsedEvent = JSON.parse(data) }) => {
        if (parsedEvent.path === '/') {
          chatMessages.value = Object.entries(parsedEvent.data)
            .map(formatChatMessageData)
            .reverse()
            .slice(0, 50);
        } else {
          chatMessages.value = [
            formatChatMessageData([parsedEvent.path, parsedEvent.data]),
            ...chatMessages.value,
          ];
        }
      },
    });
  }, []);

  const handleMessageSubmit = (event) => {
    event.preventDefault();

    fetchDatabaseEventBus(
      `/${authenticationData.localId}.json?auth=${authenticationData.idToken}`,
      {
        [authenticationData.localId]: {
          type: 'chat',
          uid: authenticationData.localId,
          data: { msg: newMessage.value },
        },
      },
    )
      .then(() => {
        newMessage.value = '';
      });
  };

  return [
    ol(
      {
        class:
          'overflow-y-scroll flex flex-col-reverse gap-y-4 p-2 lg:p-4 bg-gray-100 dark:bg-gray-900 border-t-2 border-purple-500',
        'role': 'log',
        'aria-relevant': 'text',
      },
      chatMessages.value.map((message) =>
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
          ],
        )
      ),
    ),
    form({
      class: 'sticky bottom-0 w-full lg:static',
      onSubmit: handleMessageSubmit,
    }, [
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
          onInput: (event) => {
            newMessage.value = event.target.value;
          },
        }),
        span(
          { class: 'absolute right-0 mt-3 mr-2 text-gray-500' },
          newMessageTypeahead,
        ),
      ]),
    ]),
  ];
}
