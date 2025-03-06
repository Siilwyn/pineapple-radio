import './app.css';

import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { useSignal } from '@preact/signals';

import {
  fetchDatabase,
  fetchDatabaseEventBus,
  fetchSession,
} from './helpers/api.mjs';
import { createEventSource } from './helpers/create-eventsource.mjs';
import { div, h1, h2, header, iframe } from './create-element.mjs';
import { useLocalStorage } from './hooks.mjs';

import { Chat } from './components/chat.mjs';
import { GrandButton } from './components/grand-button.mjs';
import { LoginForm } from './components/login-form.mjs';
import { LikeButton } from './components/like-button.mjs';

const createEmbedLink = ({ url, time = false }) => (
  `https://www.youtube-nocookie.com/embed/${url.split('=')[1]}?${
    time ? `start=${time}&` : ''
  }autoplay=1&enablejsapi=1&modestbranding=1`
);

export function App() {
  const initialTrack = useSignal(false);
  const currentTrack = useSignal(false);
  const waitlist = useSignal([]);
  const likeVariant = useSignal(LikeButton.likeVariants.none);

  const [authenticationData, setAuthenticationData] = useLocalStorage(
    'authenticationData',
  );

  useEffect(() => {
    createEventSource({
      url: 'https://treesradio-live.firebaseio.com/waitlist.json',
      listener: ({ data, parsedEvent = JSON.parse(data) }) => {
        if (!parsedEvent.data) return;

        waitlist.value = parsedEvent.data;
      },
    });
  }, []);

  useEffect(() => {
    fetchDatabase('/playing.json').then((newInitialTrack) => {
      initialTrack.value = newInitialTrack;

      createEventSource({
        url: 'https://treesradio-live.firebaseio.com/playing/info.json',
        listener: ({ data }) => {
          const trackData = JSON.parse(data).data;

          if (trackData.uid !== newInitialTrack.info.uid) {
            initialTrack.value = false;
          }

          likeVariant.value = LikeButton.likeVariants.none;
          currentTrack.value = trackData;
        },
      });
    });
  }, []);

  useEffect(() => {
    const setNewSession = () =>
      fetchSession(`?key=${import.meta.env.VITE_API_KEY}`, {
        grant_type: 'refresh_token',
        refresh_token: authenticationData.refreshToken,
      }).then(({ refresh_token, id_token }) => {
        setAuthenticationData({
          ...authenticationData,
          refreshToken: refresh_token,
          idToken: id_token,
        });
      });

    authenticationData && setNewSession();

    const authInterval = setInterval(() => {
      authenticationData && setNewSession();
    }, 1000 * 60 * 60);

    return () => clearInterval(authInterval);
  }, []);

  const handleWaitlistSubmit = () => {
    fetchDatabaseEventBus(
      `/${authenticationData.localId}.json?auth=${authenticationData.idToken}`,
      {
        [authenticationData.localId]: {
          type:
            waitlist.value.some(({ uid }) => uid === authenticationData.localId)
              ? 'leave_waitlist'
              : 'join_waitlist',
          uid: authenticationData.localId,
        },
      },
    );
  };

  return div(
    {
      class: `
        app-body
        grid
        gap-2
        pt-1
        lg:grid-cols-5
        lg:h-screen
        bg-gray-200
        dark:bg-gray-800
        dark:text-white
        transition-colors
        duration-500
        ease-out
      `,
    },
    [
      header(
        {
          class: `
            lg:flex
            lg:col-span-5
            justify-between
            items-center
            px-2
            lg:px-6
            lg:border-b
            lg:border-green-500
          `,
        },
        h1(
          { class: 'pb-1 border-b border-green-500 lg:border-none' },
          '🍍📻 - a tiny tr frontend',
        ),
      ),
      h(LoginForm, { authenticationData, setAuthenticationData }),
      div({ class: 'lg:col-span-3' }, [
        iframe({
          class: 'w-full h-full aspect-video',
          width: 420,
          height: 315,
          frameborder: 0,
          src: initialTrack.value
            ? createEmbedLink({
              url: initialTrack.value.info.url,
              time: initialTrack.value.time,
            })
            : currentTrack.value
            ? createEmbedLink({ url: currentTrack.value.url })
            : '',
        }),
      ]),
      div(
        { class: 'flex flex-col lg:col-span-2 min-h-0 max-h-screen' },
        [
          h2(
            { class: 'px-2 lg:px-4 mb-2' },
            `DJ: ${currentTrack.value.user || '...'}`,
          ),
          div({ class: 'flex gap-2 px-2 lg:px-4 mb-3' }, [
            h(LikeButton, { authenticationData, likeVariant }),
            h(
              GrandButton,
              { onClick: handleWaitlistSubmit },
              waitlist.value.some(({ uid }) =>
                  uid === authenticationData?.localId
                )
                ? 'Leave Waitlist'
                : 'Join Waitlist',
            ),
          ]),
          h(Chat, { authenticationData }),
        ],
      ),
    ],
  );
}
