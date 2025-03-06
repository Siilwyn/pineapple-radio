import { button, span } from '../create-element.mjs';

export function GrandButton({ children, ...rest }) {
  return button({ ...rest, class: `grand-button ${rest.class || ''}` }, [
    span({ class: 'grand-button__shadow' }),
    span({ class: 'grand-button__edge' }),
    span({ class: 'grand-button__front' }, children),
  ]);
}
