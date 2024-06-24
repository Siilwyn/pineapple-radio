import { useState } from 'preact/hooks';
import bent from 'bent';

import { div, form, label, input } from '../create-element.mjs';
import grandButton from './grand-button.mjs';

const fetchAuthenticationData = bent(
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
  'POST',
  'json'
);

export default function loginForm({ authenticationData, setAuthenticationData }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (event) => {
    event.preventDefault();

    fetchAuthenticationData(`?key=${import.meta.env.VITE_API_KEY}`, {
      email,
      password,
      returnSecureToken: true,
    })
      .then(setAuthenticationData);
  };

  return authenticationData
    ? null
    : (
      form({ class: 'flex items-end flex-wrap lg:col-span-3 gap-4 px-2', onSubmit: handleLoginSubmit }, [
        label({ class: 'grow basis-40' }, [
          div({ class: 'mb-1'}, 'Email'),
          input({
            type: 'email',
            required: true,
            value: email,
            onInput: (event) => setEmail(event.target.value),
            class: 'block w-full p-2 rounded dark:bg-gray-900',
          }),
        ]),
        label({ class: 'grow-[3] basis-52' }, [
          div({ class: 'mb-1' }, 'Password'),
          input({
            type: 'password',
            required: true,
            autocomplete: 'current-password',
            value: password,
            onInput: (event) => setPassword(event.target.value),
            class: 'block w-full p-2 rounded dark:bg-gray-900',
          }),
        ]),
        grandButton({ class: 'grow basis-20'}, 'Login'),
      ])
    )
}
