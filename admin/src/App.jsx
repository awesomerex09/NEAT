import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE = 'http://localhost:3001/api'

function App() {
  const [profiles, setProfiles] = useState([])
  const [schedules, setSchedules] = useState([])
  
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const resP = await axios.get(`${API_BASE}/profiles`)
    const resS = await axios.get(`${API_BASE}/schedules`)
    setProfiles(resP.data)
    setSchedules(resS.data)
  }

  const handleSaveProfiles = async () => {
    try {
      await axios.post(`${API_BASE}/profiles`, profiles)
      alert('儲存成功！資料已同步到學員前台。')
    } catch (e) {
      alert('儲存失敗')
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>NEAT 教練管理後台</h1>
      <p>修改下方的 JSON 內容，點擊儲存即可自動發布到學員端。</p>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>學員檔案 (Profiles)</h2>
          <textarea 
            style={{ width: '100%', height: '500px', fontFamily: 'monospace', padding: '10px' }}
            value={JSON.stringify(profiles, null, 2)}
            onChange={(e) => {
              try { setProfiles(JSON.parse(e.target.value)) } catch(err){}
            }}
          />
          <button onClick={handleSaveProfiles} style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer' }}>
            💾 儲存並同步學員資料
          </button>
        </div>
        
        <div style={{ flex: 1 }}>
          <h2>課表管理 (Schedules)</h2>
          <textarea 
            style={{ width: '100%', height: '500px', fontFamily: 'monospace', padding: '10px' }}
            value={JSON.stringify(schedules, null, 2)}
            onChange={(e) => {
              try { setSchedules(JSON.parse(e.target.value)) } catch(err){}
            }}
          />
          <button onClick={async () => {
            try {
              await axios.post(`${API_BASE}/schedules`, schedules)
              alert('儲存成功！資料已同步到學員前台。')
            } catch (e) {
              alert('儲存失敗')
            }
          }} style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer' }}>
            💾 儲存並同步課表資料
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
