
import React, { useState } from 'react'

export default function App() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [room, setRoom] = useState(null)
  const [error, setError] = useState('')

  async function createRoom() {
    const playerName = name.trim()

    if (!playerName) {
      setError('กรุณาตั้งชื่อผู้เล่นก่อนครับ')
      return
    }

    if (playerName.length > 30) {
      setError('ชื่อผู้เล่นต้องไม่เกิน 30 ตัวอักษร')
      return
    }

    setLoading(true)
    setError('')
    setRoom(null)

    try {
      const response = await fetch(
        '/.netlify/functions/create-room',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            player_name: playerName
          })
        }
      )

      const responseText = await response.text()

      let result

      try {
        result = JSON.parse(responseText)
      } catch {
        throw new Error(
          'เซิร์ฟเวอร์ส่งข้อมูลกลับมาไม่ถูกต้อง: ' +
          responseText.slice(0, 300)
        )
      }

      if (!response.ok) {
        throw new Error(
          result.detail ||
          result.error ||
          `เกิดข้อผิดพลาด HTTP ${response.status}`
        )
      }

      if (!result.room_code || !result.room_id) {
        throw new Error('เซิร์ฟเวอร์ไม่ได้ส่งข้อมูลห้องเกมกลับมา')
      }

      setRoom(result)

    } catch (err) {
      setError(
        err.message || 'ไม่สามารถสร้างห้องเกมได้'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#10141d',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      padding: '24px',
      textAlign: 'center'
    }}>

      <h1>หนีจากเมืองนรก</h1>

      <p style={{
        color: '#e0a33b',
        letterSpacing: '3px'
      }}>
        HELL CITY ESCAPE
      </p>

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
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) {
              createRoom()
            }
          }}
          placeholder="ชื่อผู้เล่น"
          maxLength={30}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid #536174',
            marginBottom: '16px',
            fontSize: '16px',
            boxSizing: 'border-box'
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
            background: loading ? '#777777' : '#e0a33b',
            color: '#111111',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: loading ? 'wait' : 'pointer'
          }}
        >
          {loading ? 'กำลังสร้างห้อง...' : 'สร้างห้องเกม'}
        </button>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '14px',
            background: '#3b2025',
            border: '1px solid #a94452',
            borderRadius: '8px',
            textAlign: 'left',
            overflowWrap: 'anywhere'
          }}>
            <strong style={{ color: '#ff7777' }}>
              สร้างห้องไม่สำเร็จ
            </strong>

            <p style={{
              color: '#ffd5d5',
              fontSize: '14px',
              lineHeight: '1.6'
            }}>
              {error}
            </p>
          </div>
        )}

        {room && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: '#10141d',
            borderRadius: '10px'
          }}>

            <h3 style={{ color: '#70d69b' }}>
              สร้างห้องสำเร็จ!
            </h3>

            <p>รหัสห้องของคุณ</p>

            <h1 style={{
              color: '#e0a33b',
              letterSpacing: '6px',
              fontSize: '32px'
            }}>
              {room.room_code}
            </h1>

            <p style={{
              color: '#9aa6b5',
              fontSize: '14px'
            }}>
              ส่งรหัสนี้ให้เพื่อนเพื่อเข้าร่วมห้อง
            </p>

          </div>
        )}

      </section>

      <p style={{ color: '#9aa6b5' }}>
        ผู้เล่น 2–6 คน
      </p>

      <p style={{
        color: '#667080',
        fontSize: '12px'
      }}>
        HELL CITY ESCAPE ONLINE
      </p>

    </main>
  )
}
