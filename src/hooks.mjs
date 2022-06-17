import { useState } from 'preact/hooks';
import { createUseLocalStorage } from 'haken';

const useLocalStorage = createUseLocalStorage({ useState });

export {
  useLocalStorage,
};
