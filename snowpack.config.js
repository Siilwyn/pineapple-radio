const dotenv = require('dotenv-safe');

dotenv.config();

module.exports = {
  'mount': {
    'src': '/',
    'public': '/public',
  },
  'plugins': [
    [
      '@snowpack/plugin-build-script',
      {'cmd': 'postcss', 'input': ['.css'], 'output': ['.css']},
    ],
  ],
  'optimize': {
    'bundle': true,
    'minify': true,
    'target': 'es2020',
  },
};
