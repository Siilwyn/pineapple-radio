import { useState } from 'preact/hooks';
import bent from 'bent';

import { span, form, label, input } from '../create-element';
import grandButton from './grand-button';

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

    fetchAuthenticationData(`?key=${import.meta.env.SNOWPACK_PUBLIC_API_KEY}`, {
      email,
      password,
      returnSecureToken: true,
    })
      .then(setAuthenticationData);
  };

  return authenticationData
    ? span({}, `Hi, ${authenticationData.email.split('@')[0]}!`)
    : (
      form({ onSubmit: handleLoginSubmit }, [
        label({ class: 'flex flex-col mb-2' }, [
          span({ class: 'block mb-1' }, 'Email'),
          input({
            type: 'email',
            required: true,
            value: email,
            onChange: (event) => setEmail(event.target.value),
            class: 'p-2 rounded dark:text-green-100 dark:bg-gray-900',
          }),
        ]),
        label({ class: 'flex flex-col mb-3' }, [
          span({ class: 'block mb-1' }, 'Password'),
          input({
            type: 'password',
            required: true,
            autocomplete: 'current-password',
            value: password,
            onChange: (event) => setPassword(event.target.value),
            class: 'p-2 rounded dark:text-green-100 dark:bg-gray-900',
          }),
        ]),
        grandButton({}, 'Login'),
      ])
    )
};
