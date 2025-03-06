import { h } from 'preact';
import { useSignal } from '@preact/signals';
import bent from 'bent';

import { div, form, input, label } from '../create-element.mjs';
import { GrandButton } from './grand-button.mjs';

const fetchAuthenticationData = bent(
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
  'POST',
  'json',
);

export function LoginForm({ authenticationData, setAuthenticationData }) {
  const email = useSignal('');
  const password = useSignal('');

  const handleLoginSubmit = (event) => {
    event.preventDefault();

    fetchAuthenticationData(`?key=${import.meta.env.VITE_API_KEY}`, {
      email: email.value,
      password: password.value,
      returnSecureToken: true,
    })
      .then(setAuthenticationData);
  };

  return authenticationData ? null : (
    form({
      class: 'flex items-end flex-wrap lg:col-span-3 gap-4 px-2',
      onSubmit: handleLoginSubmit,
    }, [
      label({ class: 'grow basis-40' }, [
        div({ class: 'mb-1' }, 'Email'),
        input({
          type: 'email',
          required: true,
          value: email.value,
          onInput: (event) => {
            email.value = event.target.value;
          },
          class: 'block w-full p-2 rounded dark:bg-gray-900',
        }),
      ]),
      label({ class: 'grow-[3] basis-52' }, [
        div({ class: 'mb-1' }, 'Password'),
        input({
          type: 'password',
          required: true,
          autocomplete: 'current-password',
          value: password.value,
          onInput: (event) => {
            password.value = event.target.value;
          },
          class: 'block w-full p-2 rounded dark:bg-gray-900',
        }),
      ]),
      h(GrandButton, { class: 'grow basis-20' }, 'Login'),
    ])
  );
}
