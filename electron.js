const electron = require('electron')
const fs = require('fs')
const path = require('path')

const { BrowserWindow, app } = electron
let win

app.setName('Nanotron')

app.on('ready', function () {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadURL('file://' + require.resolve('./index.html'))
  win.webContents.on('did-finish-load', () => win.webContents.openDevTools({ mode: 'detach' }))
  win.webContents.on('context-menu', onContextMenu)
})

if (fs.existsSync('electron.js')) {
  require(path.resolve('electron.js'))
}

function onContextMenu (event, params) {
  const { editFlags } = params
  const hasText = params.selectionText.trim().length > 0
  const can = type => editFlags[`can${type}`] && hasText

  const menuTpl = [{
    type: 'separator'
  }, {
    id: 'cut',
    label: 'Cut',
    // Needed because of macOS limitation:
    // https://github.com/electron/electron/issues/5860
    role: can('Cut') ? 'cut' : '',
    enabled: can('Cut'),
    visible: params.isEditable
  }, {
    id: 'copy',
    label: 'Copy',
    role: can('Copy') ? 'copy' : '',
    enabled: can('Copy'),
    visible: params.isEditable || hasText
  }, {
    id: 'paste',
    label: 'Paste',
    role: editFlags.canPaste ? 'paste' : '',
    enabled: editFlags.canPaste,
    visible: params.isEditable
  }, {
    type: 'separator'
  }, {
    id: 'inspect',
    label: 'Inspect Element',
    click () {
      win.inspectElement(params.x, params.y)

      if (win.webContents.isDevToolsOpened()) {
        win.webContents.devToolsWebContents.focus()
      }
    }
  }, {
    type: 'separator'
  }]

  const menu = electron.Menu.buildFromTemplate(menuTpl)
  menu.popup(win)
}
