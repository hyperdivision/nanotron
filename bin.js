#!/usr/bin/env node

process.title = 'nanotron'

const { spawn } = require('child_process')
const browserify = require('browserify')
const envify = require('envify/custom')
const watchify = require('watchify')
const path = require('path')
const fs = require('fs')
const pump = require('pump')

let pkg

try {
  pkg = require(path.resolve('package.json'))
} catch (_) {
  pkg = {}
}

const electron = localRequire('electron') || require('electron')
const file = process.argv[2] || 'index.js'

const opts = {
  node: true,
  fullPaths: true,
  basedir: process.cwd(),
  cache: {},
  packageCache: {},
  plugin: [ watchify ],
  debug: true
}

const b = browserify(file, opts)

const sheetify = localRequire('sheetify/transform')
const nanohtml = localRequire('nanohtml')

b.exclude('electron')
b.transform(envify({ NODE_ENV: process.env.NODE_ENV }))
if (sheetify) b.transform(sheetify, pkg.sheetify || {})
if (nanohtml) b.transform(nanohtml)

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

function localRequire (name) {
  let cwd = path.resolve('.')

  while (true) {
    const nm = path.join(cwd, 'node_modules')

    try {
      return require(path.join(nm, name))
    } catch (_) {
    }

    const next = path.join(cwd, '..')
    if (next === cwd) return null
    cwd = next
  }
}
