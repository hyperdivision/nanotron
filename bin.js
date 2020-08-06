#!/usr/bin/env node

process.title = 'nanotron'

const { spawn } = require('child_process')
const browserify = require('browserify')
const envify = require('envify/custom')
const watchify = require('watchify')
const minimist = require('minimist')
const path = require('path')
const os = require('os')
const fs = require('fs')
const pump = require('pump')

const argv = minimist(process.argv.slice(2), {
  alias: {
    e: 'exclude',
    h: 'help'
  }
})

if (argv.help) {
  console.error('nanotron [options]\n  -e, --exclude [module-name]')
  process.exit(0)
}

const electron = localRequire('electron') || require('electron')
const file = path.resolve(argv._[0] || 'index.js')
const fileDir = path.dirname(file)

if (!process.argv[2] && !fs.existsSync(file)) fs.writeFileSync(file, '')
const fileBundle = path.join(os.tmpdir(), path.basename(file, '.js') + '.bundle.js')
process.env.BUNDLE_PATH = fileBundle

const opts = {
  node: true,
  fullPaths: true,
  basedir: fileDir,
  cache: {},
  packageCache: {},
  plugin: [watchify],
  debug: true
}

const b = browserify(file, opts)

b.exclude('electron')
for (const e of [].concat(argv.exclude || [])) b.exclude(e)

b.transform(envify({ NODE_ENV: process.env.NODE_ENV }))

bundle(() => {
  const proc = spawn(electron, [path.join(__dirname, 'electron.js')], { stdio: 'inherit' })
  proc.on('close', (code) => process.exit(code))

  b.on('error', err => {
    console.error(err.stack)
    fs.writeFileSync(fileBundle, `document.body.innerHTML = \`<pre style="whitespace: pre;color: red;">${err.stack.toString()}</pre>\``)
    proc.kill('SIGHUP')
  })
  b.on('update', () => bundle(() => {
    proc.kill('SIGHUP')
  }))
})

function bundle (cb) {
  pump(b.bundle(), fs.createWriteStream(fileBundle), function (err) {
    if (err) {
      console.error(err.stack)
      fs.writeFileSync(fileBundle, `document.body.innerHTML = \`<pre style="whitespace: pre;color: red;">${err.stack.toString()}</pre>\``)
    }

    if (cb) cb()
  })
}

function localRequire (name) {
  const localPaths = [path.join(process.cwd(), 'node_modules')]
  while (true) {
    const top = localPaths[localPaths.length - 1]
    const next = path.resolve(top, '../..', 'node_modules')
    if (next === top) break
    localPaths.push(next)
  }

  try {
    const p = require.resolve(name, {
      paths: localPaths
    })

    return require(p)
  } catch (_) {
    return null
  }
}
