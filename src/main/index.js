import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// import icon from '../../resources/icon.png?asset'
import icon from '../../resources/icon.png'
import { rtConnect, rtFeed, rtDisconnect } from 'truedata-nodejs'
import axios from 'axios'

let mainWindow
let intervalId = null
let isWebSocketConnected = false
const username = ''
const password = ''
let currentPrice = 25000
let prev_data = new Map()
let latest_data = new Map()

function parseSymbol(symbol) {
  let prefix = 'NIFTY'

  const pattern = new RegExp(`^${prefix}${curStrike}(\\d+)(CE|PE)$`)
  const match = symbol.match(pattern)

  if (match) {
    return {
      strikePrice: match[1],
      optionType: match[2]
    }
  }
  return null
}

async function getCookiesForNSE() {
  const cookies = await session.defaultSession.cookies.get({ url: 'https://www.nseindia.com' })
  const cookieString = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ')
  return cookieString
}

function initializeData(apiResponse) {
  apiResponse.forEach((item) => {
    const strikePrice = parseInt(item.strikePrice)

    const data = {
      strikePrice: strikePrice,
      call_iv: item.CE?.impliedVolatility || 0,
      put_iv: item.PE?.impliedVolatility || 0,
      call_ltp: item.CE?.lastPrice || 0,
      put_ltp: item.PE?.lastPrice || 0,
      call_oi: item.CE?.openInterest || 0,
      put_oi: item.PE?.openInterest || 0
    }

    prev_data.set(strikePrice, { ...data })
    latest_data.set(strikePrice, { ...data })
  })
}

function greeksHandler(greeks) {
  const symbolInfo = parseSymbol(greeks.Symbol)
  if (!symbolInfo) return

  const { strikePrice, optionType } = symbolInfo
  const key = parseInt(strikePrice)

  let existingData = latest_data.get(key) || {
    strikePrice: key,
    call_iv: 0,
    put_iv: 0,
    call_ltp: 0,
    put_ltp: 0,
    call_oi: 0,
    put_oi: 0
  }

  if (optionType === 'CE') {
    existingData.call_iv = greeks.IV != null ? greeks.IV * 100 : 0
  } else if (optionType === 'PE') {
    existingData.put_iv = greeks.IV != null ? greeks.IV * 100 : 0
  }

  latest_data.set(key, existingData)
}

function tickHandler(tick) {
  if (tick.Symbol === 'NIFTY-I' && tick.LTP) {
    currentPrice = tick.LTP
    return
  }
  const symbolInfo = parseSymbol(tick.Symbol)
  if (!symbolInfo) return

  const { strikePrice, optionType } = symbolInfo
  const key = parseInt(strikePrice)

  let existingData = latest_data.get(key) || {
    strikePrice: key,
    call_iv: 0,
    put_iv: 0,
    call_ltp: 0,
    put_ltp: 0,
    call_oi: 0,
    put_oi: 0
  }

  if (optionType === 'CE') {
    existingData.call_ltp = tick.LTP || 0
    existingData.call_oi = tick.OI || 0
  } else if (optionType === 'PE') {
    existingData.put_ltp = tick.LTP || 0
    existingData.put_oi = tick.OI || 0
  }

  latest_data.set(key, existingData)
}

function updatePrevData() {
  prev_data.clear()
  latest_data.forEach((value, key) => {
    prev_data.set(key, { ...value })
  })
}

function getDataChanges() {
  const atmStrike = findATMStrike(currentPrice)

  if (!atmStrike) {
    return null
  }

  const latest = latest_data.get(atmStrike)
  const prev = prev_data.get(atmStrike)

  if (!latest || !prev) {
    return null
  }

  const callOTMStrikes = [atmStrike + 50, atmStrike + 100]
  const putOTMStrikes = [atmStrike - 50, atmStrike - 100]

  let currentCallLTP = latest.call_ltp
  callOTMStrikes.forEach((strike) => {
    const strikeData = latest_data.get(strike)
    currentCallLTP += strikeData?.call_ltp || 0
  })

  let prevCallLTP = prev.call_ltp
  callOTMStrikes.forEach((strike) => {
    const strikeData = prev_data.get(strike)
    prevCallLTP += strikeData?.call_ltp || 0
  })

  let currentPutLTP = latest.put_ltp
  putOTMStrikes.forEach((strike) => {
    const strikeData = latest_data.get(strike)
    currentPutLTP += strikeData?.put_ltp || 0
  })

  let prevPutLTP = prev.put_ltp
  putOTMStrikes.forEach((strike) => {
    const strikeData = prev_data.get(strike)
    prevPutLTP += strikeData?.put_ltp || 0
  })

  const call_iv = latest.call_iv - prev.call_iv
  const put_iv = latest.put_iv - prev.put_iv
  const call_oi_change =
    prev.call_oi !== 0 ? ((latest.call_oi - prev.call_oi) / prev.call_oi) * 100 : 0
  const put_oi_change = prev.put_oi !== 0 ? ((latest.put_oi - prev.put_oi) / prev.put_oi) * 100 : 0
  const call_ltp = currentCallLTP - prevCallLTP
  const put_ltp = currentPutLTP - prevPutLTP

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
  return data
}

function findATMStrike(currentPrice) {
  let closestStrike = null
  let minDifference = Infinity
  latest_data.forEach((data, strikePrice) => {
    const difference = Math.abs(strikePrice - currentPrice)
    if (difference < minDifference) {
      minDifference = difference
      closestStrike = strikePrice
    }
  })

  return closestStrike
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
    // ...(process.platform === 'linux' ? { icon } : {}),
    icon: path.join(__dirname, 'icon.ico'),
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

  ipcMain.on('start-websocket', async (expiry) => {
    console.log('Connect WebSocket')
    expiry = new Date('2025-06-19')

    const options = { day: '2-digit', month: 'short', year: 'numeric' }
    const formatted1 = expiry.toLocaleDateString('en-GB', options).replace(/ /g, '-')

    const yy = String(expiry.getFullYear()).slice(-2)
    const mm = String(expiry.getMonth() + 1).padStart(2, '0')
    const dd = String(expiry.getDate()).padStart(2, '0')
    const formatted2 = `${yy}${mm}${dd}`
    let strike = formatted2

    const cookieString = await getCookiesForNSE()

    const response = await fetch(
      `https://www.nseindia.com/api/option-chain-v3?type=Indices&symbol=NIFTY&expiry=19-Jun-2025`,
      {
        headers: {
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          Referer: 'https://www.nseindia.com/option-chain',
          cookie: cookieString
        },
        method: 'GET'
      }
    )

    console.log('is res ok', response.ok)

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    const data = await response.json()
    console.log('Option chain data fetched successfully:', data.records.data)
    currentPrice = data.records.underlyingValue
    initializeData(data.records.data)

    const optionChainRes = await axios.get(
      `https://api.truedata.in/getOptionChain?user=${username}&password=${password}&symbol=NIFTY&expiry=20${formatted2}`
    )
    const strikePrices = []

    const strikeRecords = optionChainRes.data.Records

    strikeRecords.forEach((r) => {
      strikePrices.push(r[1])
    })

    const targetPrice = currentPrice
    const requiredCount = 100

    const regexPattern = new RegExp(`NIFTY${strike}(\\d+)(CE|PE)`)

    const prices = strikePrices.map((item) => {
      const match = item.match(regexPattern)
      return match ? parseInt(match[1], 10) : null
    })

    let closestIndex = prices.reduce(
      (closestIdx, price, idx) =>
        Math.abs(price - targetPrice) < Math.abs(prices[closestIdx] - targetPrice)
          ? idx
          : closestIdx,
      0
    )

    const halfCount = Math.floor(requiredCount / 2)
    const start = Math.max(closestIndex - halfCount, 0)
    const end = Math.min(start + requiredCount, strikePrices.length)

    const result = strikePrices.slice(start, end)
    if (isWebSocketConnected) return
    isWebSocketConnected = true

    rtConnect(username, password, ['NIFTY-I', ...result], 8084, 1, 1, 0, 'push')
    rtFeed.on('tick', tickHandler)
    rtFeed.on('greeks', greeksHandler)

    intervalId = setInterval(() => {
      const data = getDataChanges()
      updatePrevData()
      // console.log('Sending live data:', data)
      mainWindow.webContents.send('live-data', data)
    }, 1000)
  })

  ipcMain.on('disconnect-websocket', () => {
    console.log('Disconnect WebSocket')
    if (!isWebSocketConnected) return
    isWebSocketConnected = false

    rtDisconnect()

    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  })
}
let hiddenWindow = null
app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  hiddenWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      offscreen: true,
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  try {
    await hiddenWindow.loadURL('https://www.nseindia.com')

    setTimeout(() => {
      console.log('NSE cookies should now be available.')
    }, 2000)
  } catch (error) {
    console.error('Failed to load NSE site:', error)
  }

  setTimeout(() => {
    hiddenWindow.destroy()
    hiddenWindow = null
  }, 4000)

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
