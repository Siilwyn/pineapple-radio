import './app.css';

import { useEffect, useState } from 'preact/hooks';

import { createEventSource } from './helpers/create-eventsource';
import { fetchDatabase, fetchSession, fetchDatabaseEventBus } from './helpers/api';
import { div, span, header, iframe, h1, h2 } from './create-element';
import useLocalStorage from './hooks/use-local-storage';

import chat from './components/chat';
import grandButton from './components/grand-button';
import loginForm from './components/login-form';
import likeButton from './components/like-button';

const createEmbedLink = ({ url, time = false }) => (
  `https://www.youtube-nocookie.com/embed/${url.split('=')[1]}?${
    time ? `start=${time}&` : ''
  }autoplay=1&enablejsapi=1&modestbranding=1`
);

export default function app() {
  const [initialTrack, setInitialTrack] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(false);
  const [waitlist, setWaitlist] = useState([]);
  const [likeVariant, setLikeVariant] = useState(likeButton.likeVariants.none)

  const [authenticationData, setAuthenticationData] = useLocalStorage(
    'authenticationData',
    null
  );

  useEffect(() => {
    createEventSource({
      url: 'https://treesradio-live.firebaseio.com/waitlist.json',
      listener: ({ data, parsedEvent = JSON.parse(data) }) => {
        if (!parsedEvent.data) return;

        setWaitlist(parsedEvent.data);
      },
    });
  }, []);

  useEffect(() => {
    fetchDatabase('/playing.json').then((initialTrack) => {
      setInitialTrack(initialTrack);

      createEventSource({
        url: 'https://treesradio-live.firebaseio.com/playing/info.json',
        listener: ({ data }) => {
          const trackData = JSON.parse(data).data;

          if (trackData.uid !== initialTrack.info.uid) setInitialTrack(false);

          setLikeVariant(likeButton.likeVariants.none);
          setCurrentTrack(trackData);
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
          type: waitlist.some(({ uid }) => uid === authenticationData.localId)
            ? 'leave_waitlist'
            : 'join_waitlist',
          uid: authenticationData.localId,
        },
      }
    );
  };

  return div(
    {
      class: `
        app-body
        grid
        lg:grid-cols-5
        lg:h-screen
        bg-gray-200
        dark:bg-gray-800
        dark:text-green-100
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
            p-2
            lg:px-6
            lg:border-b
            lg:border-green-500
            mb-2
          `
        },
        [
          h1({ class: 'border-b border-green-500 lg:border-none mb-1' }, [
            span({ class: 'text-xl' }, '🍍📻'),
            span({ class: 'font-semibold' }, ' - a tiny TR frontend'),
          ]),
          loginForm({ authenticationData, setAuthenticationData }),
        ]),
        div({ class: 'lg:col-span-3' }, [
          div({ style: '--aspect-ratio:16/9' }, [
            iframe({
              width: 480,
              height: 360,
              frameborder: 0,
              src: initialTrack
                ? createEmbedLink({
                    url: initialTrack.info.url,
                    time: initialTrack.time,
                  })
                : currentTrack
                ? createEmbedLink({ url: currentTrack.url })
                : '',
            }),
          ]),
        ]),
        div(
          { class: 'flex lg:grid lg:col-span-2 flex-col max-w-lg max-h-screen px-2 lg:px-4 mx-auto' },
          [
            div({ class: 'row-start-1' }, [
              h2({ class: 'mb-2' }, `DJ: ${currentTrack?.user || '...'}`),
              div({ class: 'flex items-start mb-4' }, [
                likeButton({ class: 'mr-4', authenticationData, likeVariant, setLikeVariant }),
                grandButton(
                  {
                    class: 'mr-4',
                    onClick: handleWaitlistSubmit,
                  },
                  waitlist.some(({ uid }) => uid === authenticationData?.localId)
                    ? 'Leave Waitlist'
                    : 'Join Waitlist'
                ),
              ]),
            ]),
            chat({ authenticationData }),
          ]
        ),
    ]
  );
};
