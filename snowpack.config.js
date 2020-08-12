const dotenv = require('dotenv-safe');

dotenv.config();

module.exports = {
  'scripts': {
    'build:css': 'postcss',
    'mount:src': 'mount ./src --to /',
    'mount:public': 'mount ./public --to /public',
  }
};
