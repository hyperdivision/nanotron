const electron = require('electron')
const fs = require('fs')
const path = require('path')

const { BrowserWindow, Menu, app } = electron
let win

app.setName('Nanotron')

app.on('ready', function () {
  win = new BrowserWindow()
  win.loadURL('file://' + require.resolve('./index.html'))
  win.webContents.on('did-finish-load', () => win.webContents.openDevTools({ mode: 'detach' }))
})

if (fs.existsSync('electron.js')) {
  require(path.resolve('electron.js'))
}
