import { button, span } from '../create-element.mjs';

export default function grandButton({ ...rest }, children) {
  return button({ ...rest, class: `pushable ${rest.class}` }, [
    span({ class: 'shadow' }),
    span({ class: 'edge' }),
    span({ class: 'front' }, children),
  ]);
}
