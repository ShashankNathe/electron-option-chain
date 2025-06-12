import { useEffect, useState } from 'react'

function OptionChain() {
  const [dataLog, setDataLog] = useState([])

  const startWebsocket = () => window.api?.startWebSocket?.()
  const disconnectWebsocket = () => window.api?.stopWebSocket?.()

  useEffect(() => {
    if (window.api?.onLiveData) {
      window.api.onLiveData((newData) => {
        setDataLog((prev) => [...prev, newData]) // Append without slicing
      })
    }
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ marginBottom: '10px' }}>📈 Live Option Chain</h2>

      <div style={{ marginBottom: '15px' }}>
        <button onClick={startWebsocket} style={{ marginRight: '10px' }}>
          ▶ Start WebSocket
        </button>
        <button onClick={disconnectWebsocket}>⛔ Disconnect WebSocket</button>
      </div>

      <table
        border="1"
        cellPadding="8"
        cellSpacing="0"
        style={{ width: '100%', borderCollapse: 'collapse' }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>Time</th>
            <th>Call IV</th>
            <th>Put IV</th>
            <th>Call LTP</th>
            <th>Put LTP</th>
            <th>Call OI Change</th>
            <th>Put OI Change</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {dataLog.map((row, i) => (
            <tr key={i}>
              <td>{row.time}</td>
              <td>{row.call_iv.toFixed(2)}</td>
              <td>{row.put_iv.toFixed(2)}</td>
              <td>{row.call_ltp.toFixed(2)}</td>
              <td>{row.put_ltp.toFixed(2)}</td>
              <td>{row.call_oi_change}</td>
              <td>{row.put_oi_change}</td>
              <td>{row.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OptionChain
