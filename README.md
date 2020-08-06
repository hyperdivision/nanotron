# nanotron

Small opinionated dev program for developing Electron apps

```
npm install -g nanotron
```

## Usage

```
# Browserifies ./index.js and wraps it in a Electron shell
nanotron
```

* Uses the locally installed `electron`, otherwise the one bundled with this module.
* If `electron.js` exists, this file will be required as part of the electron process
* If `index.html` exists this file will be used as the html wrapper.

## License

[ISC](LICENSE)
