#!/usr/bin/env node

process.title = 'nanotron'

const { spawn } = require('child_process')
const browserify = require('browserify')
const envify = require('envify/custom')
const watchify = require('watchify')
const path = require('path')
const fs = require('fs')
const pump = require('pump')

let electron
let pkg

try {
  electron = require(path.resolve('node_modules/electron'))
} catch (_) {
  electron = require('electron')
}
try {
  pkg = require(path.resolve('package.json'))
} catch (_) {
  pkg = {}
}

const file = process.argv[2] || 'index.js'

const opts = {
  node: true,
  fullPaths: true,
  basedir: path.dirname(file),
  cache: {},
  packageCache: {},
  plugin:[ watchify ],
  debug: true
}

const b = browserify(file, opts)

b.exclude('electron')
b.transform(envify({ NODE_ENV: process.env.NODE_ENV }))
b.transform(require('sheetify/transform'), pkg.sheetify || {})
b.transform(require('nanohtml'))

b.on('error', err => console.error(err.message))
b.on('update', () => bundle())

bundle(() => spawn(electron, [ path.join(__dirname, 'electron.js') ], { stdio: 'inherit' }))

function bundle (cb) {
  pump(b.bundle(), fs.createWriteStream('bundle.js.tmp'), function (err) {
    if (err) console.error(err.message)
    else fs.renameSync('bundle.js.tmp', 'bundle.js')
    if (cb) cb()
  })
}
