module.exports = {
  purge: [
    './src/**/*.mjs',
  ],
  theme: {
    extend: {
      screens: {
        'dark': {'raw': '(prefers-color-scheme: dark)'},
      }
    }
  }
}
