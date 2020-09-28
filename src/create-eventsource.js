const createEventSource = async ({ url, listener }) => {
  while (true) {
    await new Promise((resolve) => {
      const eventSourceInstance = new EventSource(url);

      eventSourceInstance.addEventListener('put', listener);

      eventSourceInstance.addEventListener('error', () => {
        eventSourceInstance.close();
        setTimeout(() => resolve(), 10000);
      })
    })
  }
}

export default createEventSource;