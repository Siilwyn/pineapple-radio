import { button, span } from '../create-element.mjs';

export default function grandButton({ ...rest }, children) {
  return button({ ...rest, class: `grand-button ${rest.class || ''}` }, [
    span({ class: 'grand-button__shadow' }),
    span({ class: 'grand-button__edge' }),
    span({ class: 'grand-button__front' }, children),
  ]);
}
