'use strict'

const menubar = require('menubar')
const electron = require('electron')
const AutoLaunch = require('auto-launch')
const ipcMain = require('electron').ipcMain
const fs = require('fs')
let localData = require('./localData.json')

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
  console.log('server -- launching...')
  mb.tray.on('right-click', () => {
    mb.tray.popUpContextMenu(contextMenu)
  })
})

mb.on('after-create-window', () => {
  mb.window.loadURL('file://' + __dirname + '/index.html#' + localData.schoolUrl)
  // mb.window.openDevTools()
})

mb.on('show', () => {
  mb.window.send('loadPage', localData.schoolUrl)
  console.log('server -- sending page info...')
})

ipcMain.on('schoolUrl', (e, data) => {
  console.log('server -- saving url...', data)
  localData.schoolUrl = data
  fs.writeFileSync('./localData.json', JSON.stringify(localData))
})

ipcMain.on('log', (e, data) => {
  console.log(data)
})
