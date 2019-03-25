# nanotron

Small opionated dev program for developing Electron apps using the nano* stack (the modules backing Choo.js)

```
npm install -g nanotron
```

## Usage

```
# Browserifies ./index.js and wraps it in a Electron shell while applying the below transforms.
# To reload, press CMD-R.
nanotron
```

Comes with transforms enabled for envify, sheetify, and nanohtml.

* Uses the locally installed `electron`, otherwise the one bundled with this module.
* If `electron.js` exists, this file will be required as part of the electron process
* If `index.html` exists this file will be used as the html wrapper.
* The compiled js is available as `bundle.js` in the index.html page.
* Loads your sheetify settings from your package.json.

## License

[ISC](LICENSE)
