'use strict'

const menubar = require('menubar')
const electron = require('electron')
const AutoLaunch = require('auto-launch')
const ipcMain = require('electron').ipcMain
const storage = require('electron-json-storage')

const Menu = electron.Menu
const BrowserWindow = electron.BrowserWindow
const mb = menubar({icon: '' + __dirname + '/IconTemplate.png'})

mb.setOption('preload-window', true)
mb.setOption('height', 600)
mb.setOption('width', 400)

let aboutWindow

let appLauncher = new AutoLaunch({
  name: 'canvasbar'
})

const contextMenu = Menu.buildFromTemplate([
  {
    label: 'About Canvasbar',
    click: () => {
      openAbout()
    }
  },
  {
    label: 'Launch on Login',
    type: 'checkbox',
    checked: false,
    click: (item) => {
      appLauncher.isEnabled().then((enabled) => {
        if (enabled) {
          return appLauncher.disable().then(() => {
            item.checked = false
          })
        } else {
          return appLauncher.enable().then(() => {
            item.checked = true
          })
        }
      })
    }
  },
  {
    label: 'Show devtools',
    click: () => {
      mb.window.openDevTools()
    }
  },
  {
    label: 'Quit Canvasbar',
    click: () => {
      mb.app.quit()
    }
  }
])

appLauncher.isEnabled().then((enabled) => {
  contextMenu.items[1].checked = enabled
})

const openAbout = () => {
  aboutWindow = new BrowserWindow({width: 400, height: 320})
  aboutWindow.loadURL('file://' + __dirname + '/about.html')
  aboutWindow.on('closed', () => {
    aboutWindow = null
  })
}

mb.on('ready', () => {
  mb.tray.on('right-click', () => {
    mb.tray.popUpContextMenu(contextMenu)
  })
})

mb.on('after-create-window', () => {
  storage.has('schoolUrl', (error, hasKey) => {
    if (hasKey) {
      storage.get('schoolUrl', (error, data) => {
        mb.window.loadURL('file://' + __dirname + '/index.html#' + data)
      })
    } else {
      mb.window.loadURL('file://' + __dirname + '/index.html#')
    }
  })
  // mb.window.openDevTools()
})

mb.on('show', () => {
  storage.has('schoolUrl', (error, hasKey) => {
    if (hasKey) {
      storage.get('schoolUrl', (error, data) => {
        mb.window.loadURL('file://' + __dirname + '/index.html#' + data)
      })
    } else {
      mb.window.loadURL('file://' + __dirname + '/index.html#')
    }
  })
})

ipcMain.on('schoolUrl', (e, data) => {
  storage.set('schoolUrl', data)
})

ipcMain.on('log', (e, data) => {
  // console.log(data)
})
