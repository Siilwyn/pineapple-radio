import { createElement } from 'preact';

const h = (type) => (props, children) => createElement(type, props, children);

export const header = h('header');
export const iframe = h('iframe');

export const div = h('div');
export const span = h('span');

export const ol = h('ol');
export const li = h('li');

export const img = h('img');

export const form = h('form');
export const label = h('label');
export const input = h('input');
export const button = h('button');

export const h1 = h('h1');
export const h2 = h('h2');
export const p = h('p');
