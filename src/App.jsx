
import React, { useState } from 'react'

export default function App() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [room, setRoom] = useState(null)
  const [error, setError] = useState('')

  async function createRoom() {
    if (!name.trim()) {
      setError('กรุณาตั้งชื่อผู้เล่นก่อนครับ')
      return
    }

    setLoading(true)
    setError('')
    setRoom(null)

    try {
      const response = await fetch('/.netlify/functions/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player_name: name.trim()
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail ? `${result.error}: ${result.detail}` : (result.error || 'สร้างห้องไม่สำเร็จ'))

      setRoom(result)
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#10141d',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '24px',
      textAlign: 'center'
    }}>
      <h1>หนีจากเมืองนรก</h1>
      <p style={{ color: '#e0a33b' }}>HELL CITY ESCAPE</p>

      <section style={{
        maxWidth: '420px',
        margin: '40px auto',
        padding: '24px',
        background: '#202938',
        borderRadius: '16px'
      }}>
        <h2>สร้างห้องเกมออนไลน์</h2>
        <p>ตั้งชื่อผู้เล่นเพื่อสร้างห้องใหม่</p>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ชื่อผู้เล่น"
          maxLength={30}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid #536174',
            marginBottom: '16px',
            fontSize: '16px'
          }}
        />

        <button
          onClick={createRoom}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border: 'none',
            background: '#e0a33b',
            color: '#111',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {loading ? 'กำลังสร้างห้อง...' : 'สร้างห้องเกม'}
        </button>

        {error && (
          <p style={{ color: '#ff7777' }}>{error}</p>
        )}

        {room && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#10141d',
            borderRadius: '10px'
          }}>
            <h3>สร้างห้องสำเร็จ</h3>
            <p>รหัสห้องของคุณ</p>
            <h1 style={{
              color: '#e0a33b',
              letterSpacing: '5px'
            }}>
              {room.room_code}
            </h1>
            <p>ส่งรหัสนี้ให้เพื่อนเพื่อเข้าร่วมห้อง</p>
          </div>
        )}
      </section>

      <p style={{ color: '#9aa6b5' }}>
        ผู้เล่น 2–6 คน
      </p>
    </main>
  )
}
