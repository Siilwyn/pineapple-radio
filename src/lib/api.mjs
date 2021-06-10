import bent from 'bent';

export const fetchDatabase = bent(
  'https://treesradio-live.firebaseio.com',
  'GET',
  'json'
);

export const fetchSession = bent(
  `https://securetoken.googleapis.com/v1/token`,
  'POST',
  'json'
);

export const fetchDatabaseEventBus = bent(
  'https://treesradio-live.firebaseio.com/event_bus',
  'PUT',
  'json'
);
