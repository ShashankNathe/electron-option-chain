// import { app, shell, BrowserWindow, ipcMain } from 'electron'
// import { join } from 'path'
// import { electronApp, optimizer, is } from '@electron-toolkit/utils'
// import icon from '../../resources/icon.png?asset'
// import { rtConnect, rtFeed, rtDisconnect } from 'truedata-nodejs'
// function createWindow() {
//   // Create the browser window.

//   const mainWindow = new BrowserWindow({
//     width: 900,
//     height: 670,
//     show: false,
//     autoHideMenuBar: true,
//     ...(process.platform === 'linux' ? { icon } : {}),
//     webPreferences: {
//       preload: join(__dirname, '../preload/index.js'),
//       sandbox: false
//     }
//   })

//   mainWindow.on('ready-to-show', () => {
//     mainWindow.show()
//   })

//   mainWindow.webContents.setWindowOpenHandler((details) => {
//     shell.openExternal(details.url)
//     return { action: 'deny' }
//   })

//   if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//     mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
//   } else {
//     mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
//   }

//   const user = 'tdwsp612'
//   const pwd = 'sagar@612'
//   const port = 8084

//   const symbols = ['NIFTY-I']

//   // rtConnect(user, pwd, symbols, port, 1, 1, 0, 'push')

//   // rtFeed.on('touchline', touchlineHandler) // Receives Touchline Data
//   // rtFeed.on('tick', tickHandler) // Receives Tick data
//   // rtFeed.on('greeks', greeksHandler) // Receives Greeks data
//   // rtFeed.on('bidask', bidaskHandler) // Receives Bid Ask data if enabled
//   // rtFeed.on('bidaskL2', bidaskL2Handler) // Receives level 2 Bid Ask data only for BSE exchange
//   // rtFeed.on('bar', barHandler) // Receives 1min and 5min bar data
//   // rtFeed.on('marketstatus', marketStatusHandler) // Receives marketstatus messages
//   // rtFeed.on('heartbeat', heartbeatHandler) // Receives heartbeat message and time

//   // rtFeed.on('tick', (tickData) => {
//   //   console.log('tickData', tickData)
//   //   mainWindow.webContents.send('tick-data', tickData)
//   // })

//   // rtFeed.on('bar', (barData) => {
//   //   console.log('barData', barData)
//   //   mainWindow.webContents.send('bar-data', barData)
//   // })

//   //   tickData {
//   //   Symbol: 'NIFTY-I',
//   //   Symbol_ID: 900000596,
//   //   Timestamp: '2025-06-12T11:39:37',
//   //   LTP: 25106,
//   //   LTQ: 300,
//   //   ATP: 25171.47,
//   //   Volume: 2942925,
//   //   Open: 25210.5,
//   //   High: 25260,
//   //   Low: 25100,
//   //   Prev_Close: 25211.7,
//   //   OI: 11495775,
//   //   Price_Change: -105.7,
//   //   Price_Change_Percentage: -0.42,
//   //   OI_Change: 92775,
//   //   OI_Change_Percentage: 0.81,
//   //   Prev_Open_Int_Close: 11403000,
//   //   Day_Turnover: 74077748349.75,
//   //   Special: '',
//   //   Tick_Sequence_No: 4162,
//   //   Bid: 25106,
//   //   Bid_Qty: 150,
//   //   Ask: 25106.6,
//   //   Ask_Qty: 825
//   // }
//   // tickData {
//   //   Symbol: 'NIFTY-I',
//   //   Symbol_ID: 900000596,
//   //   Timestamp: '2025-06-12T11:39:39',
//   //   LTP: 25104.1,
//   //   LTQ: 1125,
//   //   ATP: 25171.44,
//   //   Volume: 2944050,
//   //   Open: 25210.5,
//   //   High: 25260,
//   //   Low: 25100,
//   //   Prev_Close: 25211.7,
//   //   OI: 11495775,
//   //   Price_Change: -107.6,
//   //   Price_Change_Percentage: -0.43,
//   //   OI_Change: 92775,
//   //   OI_Change_Percentage: 0.81,
//   //   Prev_Open_Int_Close: 11403000,
//   //   Day_Turnover: 74105977932,
//   //   Special: '',
//   //   Tick_Sequence_No: 4163,
//   //   Bid: 25103.2,
//   //   Bid_Qty: 75,
//   //   Ask: 25106,
//   //   Ask_Qty: 75
//   // }
//   // Message HeartBeat Time: 2025-06-12T11:39:40.355
//   // tickData {
//   //   Symbol: 'NIFTY-I',
//   //   Symbol_ID: 900000596,
//   //   Timestamp: '2025-06-12T11:39:41',
//   //   LTP: 25109,
//   //   LTQ: 225,
//   //   ATP: 25171.44,
//   //   Volume: 2944275,
//   //   Open: 25210.5,
//   //   High: 25260,
//   //   Low: 25100,
//   //   Prev_Close: 25211.7,
//   //   OI: 11495775,
//   //   Price_Change: -102.7,
//   //   Price_Change_Percentage: -0.41,
//   //   OI_Change: 92775,
//   //   OI_Change_Percentage: 0.81,
//   //   Prev_Open_Int_Close: 11403000,
//   //   Day_Turnover: 74111641506,
//   //   Special: '',
//   //   Tick_Sequence_No: 4164,
//   //   Bid: 25106.6,
//   //   Bid_Qty: 225,
//   //   Ask: 25109.8,
//   //   Ask_Qty: 900
//   // }
//   // tickData {
//   //   Symbol: 'NIFTY-I',
//   //   Symbol_ID: 900000596,
//   //   Timestamp: '2025-06-12T11:39:42',
//   //   LTP: 25106.6,
//   //   LTQ: 375,
//   //   ATP: 25171.43,
//   //   Volume: 2944650,
//   //   Open: 25210.5,
//   //   High: 25260,
//   //   Low: 25100,
//   //   Prev_Close: 25211.7,
//   //   OI: 11495775,
//   //   Price_Change: -105.1,
//   //   Price_Change_Percentage: -0.42,
//   //   OI_Change: 92775,
//   //   OI_Change_Percentage: 0.81,
//   //   Prev_Open_Int_Close: 11403000,
//   //   Day_Turnover: 74121051349.5,
//   //   Special: '',
//   //   Tick_Sequence_No: 4165,
//   //   Bid: 25106.6,
//   //   Bid_Qty: 75,
//   //   Ask: 25109.8,
//   //   Ask_Qty: 825
//   // }
//   // tickData {
//   //   Symbol: 'NIFTY-I',
//   //   Symbol_ID: 900000596,
//   //   Timestamp: '2025-06-12T11:39:44',
//   //   LTP: 25108,
//   //   LTQ: 225,
//   //   ATP: 25171.43,
//   //   Volume: 2944875,
//   //   Open: 25210.5,
//   //   High: 25260,
//   //   Low: 25100,
//   //   Prev_Close: 25211.7,
//   //   OI: 11495775,
//   //   Price_Change: -103.7,
//   //   Price_Change_Percentage: -0.41,
//   //   OI_Change: 92775,
//   //   OI_Change_Percentage: 0.81,
//   //   Prev_Open_Int_Close: 11403000,
//   //   Day_Turnover: 74126714921.25,
//   //   Special: '',
//   //   Tick_Sequence_No: 4166,
//   //   Bid: 25105,
//   //   Bid_Qty: 300,
//   //   Ask: 25106.6,
//   //   Ask_Qty: 75
//   // }
//   // Message HeartBeat Time: 2025-06-12T11:39:45.229
//   // tickData {
//   //   Symbol: 'NIFTY-I',
//   //   Symbol_ID: 900000596,
//   //   Timestamp: '2025-06-12T11:39:46',
//   //   LTP: 25105,
//   //   LTQ: 525,
//   //   ATP: 25171.41,
//   //   Volume: 2945400,
//   //   Open: 25210.5,
//   //   High: 25260,
//   //   Low: 25100,
//   //   Prev_Close: 25211.7,
//   //   OI: 11440575,
//   //   Price_Change: -106.7,
//   //   Price_Change_Percentage: -0.42,
//   //   OI_Change: 37575,
//   //   OI_Change_Percentage: 0.33,
//   //   Prev_Open_Int_Close: 11403000,
//   //   Day_Turnover: 74139871014,
//   //   Special: '',
//   //   Tick_Sequence_No: 4167,
//   //   Bid: 25103.2,
//   //   Bid_Qty: 75,
//   //   Ask: 25105,
//   //   Ask_Qty: 1125
//   // }
//   // tickData {
//   //   Symbol: 'NIFTY-I',
//   //   Symbol_ID: 900000596,
//   //   Timestamp: '2025-06-12T11:39:47',
//   //   LTP: 25108.5,
//   //   LTQ: 1350,
//   //   ATP: 25171.38,
//   //   Volume: 2946750,
//   //   Open: 25210.5,
//   //   High: 25260,
//   //   Low: 25100,
//   //   Prev_Close: 25211.7,
//   //   OI: 11440575,
//   //   Price_Change: -103.2,
//   //   Price_Change_Percentage: -0.41,
//   //   OI_Change: 37575,
//   //   OI_Change_Percentage: 0.33,
//   //   Prev_Open_Int_Close: 11403000,
//   //   Day_Turnover: 74173764015,
//   //   Special: '',
//   //   Tick_Sequence_No: 4168,
//   //   Bid: 25103.2,
//   //   Bid_Qty: 225,
//   //   Ask: 25109,
//   //   Ask_Qty: 75
//   // }
//   // tickData {
//   //   Symbol: 'NIFTY-I',
//   //   Symbol_ID: 900000596,
//   //   Timestamp: '2025-06-12T11:39:49',
//   //   LTP: 25107.9,
//   //   LTQ: 600,
//   //   ATP: 25171.37,
//   //   Volume: 2947350,
//   //   Open: 25210.5,
//   //   High: 25260,
//   //   Low: 25100,
//   //   Prev_Close: 25211.7,
//   //   OI: 11440575,
//   //   Price_Change: -103.8,
//   //   Price_Change_Percentage: -0.41,
//   //   OI_Change: 37575,
//   //   OI_Change_Percentage: 0.33,
//   //   Prev_Open_Int_Close: 11403000,
//   //   Day_Turnover: 74188837369.5,
//   //   Special: '',
//   //   Tick_Sequence_No: 4169,
//   //   Bid: 25103,
//   //   Bid_Qty: 825,
//   //   Ask: 25107.9,
//   //   Ask_Qty: 525
//   // }
//   // Message HeartBeat Time: 2025-06-12T11:39:50.104
//   // tickData {
//   //   Symbol: 'NIFTY-I',
//   //   Symbol_ID: 900000596,
//   //   Timestamp: '2025-06-12T11:39:51',
//   //   LTP: 25103,
//   //   LTQ: 600,
//   //   ATP: 25171.36,
//   //   Volume: 2947950,
//   //   Open: 25210.5,
//   //   High: 25260,
//   //   Low: 25100,
//   //   Prev_Close: 25211.7,
//   //   OI: 11440575,
//   //   Price_Change: -108.7,
//   //   Price_Change_Percentage: -0.43,
//   //   OI_Change: 37575,
//   //   OI_Change_Percentage: 0.33,
//   //   Prev_Open_Int_Close: 11403000,
//   //   Day_Turnover: 74203910712,
//   //   Special: '',
//   //   Tick_Sequence_No: 4170,
//   //   Bid: 25103,
//   //   Bid_Qty: 375,
//   //   Ask: 25103.2,
//   //   Ask_Qty: 75
//   // }

//   // function touchlineHandler(touchline) {
//   //   console.log('touchline', touchline)
//   // }

//   // function tickHandler(tick) {
//   //   console.log('tick', tick)
//   // }

//   // function greeksHandler(greeks) {
//   //   console.log(greeks)
//   // }

//   // function bidaskHandler(bidask) {
//   //   console.log(bidask)
//   // }

//   // function bidaskL2Handler(bidaskL2) {
//   //   console.log(bidaskL2)
//   // }

//   // function barHandler(bar) {
//   //   console.log('bar', bar)
//   // }

//   // function marketStatusHandler(status) {
//   //   console.log(status)
//   // }

//   // function heartbeatHandler(heartbeat) {
//   //   console.log(heartbeat)
//   // }
// }

// app.whenReady().then(() => {
//   electronApp.setAppUserModelId('com.electron')

//   app.on('browser-window-created', (_, window) => {
//     optimizer.watchWindowShortcuts(window)
//   })

//   // IPC test
//   ipcMain.on('ping', () => console.log('pong'))
//   // ipcMain.on('disconnect-websocket', () => rtDisconnect())
//   // ipcMain.on('connect-websocket', () => rtDisconnect())
//   ipcMain.on('disconnect-websocket', () => console.log('Disconnect WebSocket'))
//   ipcMain.on('start-websocket', () => console.log('Connect WebSocket'))

//   createWindow()

//   app.on('activate', function () {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow()
//   })
// })

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

// // In this file you can include the rest of your app's specific main process
// // code. You can also put them in separate files and require them here.
