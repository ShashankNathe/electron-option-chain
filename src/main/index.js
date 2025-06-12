import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { rtConnect, rtFeed, rtDisconnect } from 'truedata-nodejs'

let mainWindow
let intervalId = null
let isWebSocketConnected = false

function randomSigned(min, max) {
  const value = Math.random() * (max - min) + min
  return Math.random() > 0.5 ? value : -value
}

function computeResult(call_iv, put_iv, call_ltp, put_ltp) {
  const allPos = call_iv > 0 && put_iv > 0 && call_ltp > 0 && put_ltp > 0
  const allNeg = call_iv < 0 && put_iv < 0 && call_ltp < 0 && put_ltp < 0

  if (allPos || allNeg) {
    return 'SR'
  }

  const ivPos = call_iv > 0 && put_iv > 0
  const ivNeg = call_iv < 0 && put_iv < 0
  const ltpPos = call_ltp > 0 && put_ltp > 0
  const ltpNeg = call_ltp < 0 && put_ltp < 0

  if ((ivNeg && ltpPos) || (ivPos && ltpNeg)) {
    return 'DR'
  }

  return 'NA'
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  ipcMain.on('start-websocket', () => {
    console.log('Connect WebSocket')
    if (isWebSocketConnected) return
    isWebSocketConnected = true

    // rtConnect('tdwsp612', 'sagar@612', ['NIFTY-I'], 8084, 1, 1, 0, 'push')

    intervalId = setInterval(() => {
      const call_iv = randomSigned(2, 20)
      const put_iv = randomSigned(2, 20)
      const call_ltp = randomSigned(10, 100)
      const put_ltp = randomSigned(10, 100)
      const call_oi_change = randomSigned(100, 500)
      const put_oi_change = randomSigned(100, 500)

      const result = computeResult(call_iv, put_iv, call_ltp, put_ltp)

      const data = {
        time: new Date().toLocaleTimeString(),
        call_iv,
        put_iv,
        call_ltp,
        put_ltp,
        call_oi_change,
        put_oi_change,
        result
      }

      mainWindow.webContents.send('live-data', data)
    }, 1000)
  })

  ipcMain.on('disconnect-websocket', () => {
    console.log('Disconnect WebSocket')
    if (!isWebSocketConnected) return
    isWebSocketConnected = false

    // rtDisconnect()

    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
