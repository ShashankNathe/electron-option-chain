import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  onLiveData: (callback) => ipcRenderer.on('live-data', (event, data) => callback(data)),
  startWebSocket: () => ipcRenderer.send('start-websocket'),
  stopWebSocket: () => ipcRenderer.send('disconnect-websocket')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
