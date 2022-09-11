import { createUseLocalStorage } from 'haken';
import { useState } from 'preact/hooks';

const [bleh, setBleh] = useState()

const useLocalStorageJson = createUseLocalStorage({ useState })

const [hi, setHi] = useLocalStorageJson('hi', undefined)

setHi(undefined)
