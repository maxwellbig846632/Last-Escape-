
import React, { useState } from 'react'

export default function App() {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState(() =>
    new URLSearchParams(window.location.search)
      .get('room')?.toUpperCase() || ''
  )
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const inviteLink = room
    ? `${window.location.origin}/?room=${room.room_code}`
    : ''

  async function sendRequest(endpoint, body) {
    const response = await fetch(
      `/.netlify/functions/${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    )

    const responseText = await response.text()
    let result

    try {
      result = JSON.parse(responseText)
    } catch {
      throw new Error(
        'เซิร์ฟเวอร์ส่งข้อมูลกลับมาไม่ถูกต้อง: ' +
        responseText.slice(0, 200)
      )
    }

    if (!response.ok) {
      throw new Error(
        result.detail ||
        result.error ||
        `เกิดข้อผิดพลาด HTTP ${response.status}`
      )
    }

    return result
  }

  async function createRoom() {
    const playerName = name.trim()

    if (!playerName) {
      setError('กรุณาตั้งชื่อผู้เล่นก่อนครับ')
      return
    }

    setLoading(true)
    setError('')
    setRoom(null)

    try {
      const result = await sendRequest('create-room', {
        player_name: playerName
      })

      localStorage.setItem(
        `hell-city-${result.room_id}`,
        result.session_token
      )

      setRoom(result)
      setRoomCode(result.room_code)

      window.history.replaceState(
        {},
        '',
        `?room=${result.room_code}`
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function joinRoom() {
    const playerName = name.trim()
    const code = roomCode.trim().toUpperCase()

    if (!playerName) {
      setError('กรุณาตั้งชื่อผู้เล่นก่อนครับ')
      return
    }

    if (!/^[A-Z0-9]{6}$/.test(code)) {
      setError('กรุณากรอกรหัสห้อง 6 ตัวอักษร')
      return
    }

    setLoading(true)
    setError('')
    setRoom(null)

    try {
      const result = await sendRequest('join-room', {
        room_code: code,
        player_name: playerName
      })

      localStorage.setItem(
        `hell-city-${result.room_id}`,
        result.session_token
      )

      setRoom(result)

      window.history.replaceState(
        {},
        '',
        `?room=${result.room_code}`
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
    } catch {
      setError('คัดลอกไม่ได้ กรุณาคัดลอกลิงก์จากช่องข้อความแทนครับ')
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

      <p style={{
        color: '#e0a33b',
        letterSpacing: '3px'
      }}>
        HELL CITY ESCAPE
      </p>

      <section style={{
        maxWidth: '440px',
        margin: '35px auto',
        padding: '24px',
        background: '#202938',
        borderRadius: '16px'
      }}>

        <h2>ห้องเกมออนไลน์</h2>

        <p>ตั้งชื่อผู้เล่น</p>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="ชื่อผู้เล่น"
          maxLength={30}
          disabled={loading || !!room}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid #536174',
            marginBottom: '20px',
            fontSize: '16px',
            boxSizing: 'border-box'
          }}
        />

        {!room && (
          <>
            <button
              onClick={createRoom}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                border: 'none',
                borderRadius: '8px',
                background: '#e0a33b',
                color: '#111',
                fontWeight: 'bold',
                fontSize: '16px',
                marginBottom: '24px'
              }}
            >
              {loading ? 'กำลังดำเนินการ...' : 'สร้างห้องใหม่'}
            </button>

            <div style={{
              borderTop: '1px solid #536174',
              paddingTop: '20px'
            }}>
              <h3>เข้าร่วมห้อง</h3>

              <input
                type="text"
                value={roomCode}
                onChange={e =>
                  setRoomCode(
                    e.target.value.toUpperCase().slice(0, 6)
                  )
                }
                placeholder="กรอกรหัสห้อง 6 ตัว"
                maxLength={6}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #536174',
                  marginBottom: '12px',
                  fontSize: '18px',
                  textAlign: 'center',
                  letterSpacing: '4px',
                  boxSizing: 'border-box'
                }}
              />

              <button
                onClick={joinRoom}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#4b9bd8',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                {loading ? 'กำลังเข้าห้อง...' : 'เข้าร่วมห้อง'}
              </button>
            </div>
          </>
        )}

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
              เกิดข้อผิดพลาด
            </strong>
            <p>{error}</p>
          </div>
        )}

        {room && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: '#10141d',
            borderRadius: '10px'
          }}>
            <h2 style={{ color: '#70d69b' }}>
              {room.player_status === 'spectator'
                ? 'เข้าชมห้องสำเร็จ'
                : 'เข้าห้องสำเร็จ!'}
            </h2>

            <p>รหัสห้อง</p>

            <h1 style={{
              color: '#e0a33b',
              letterSpacing: '6px',
              fontSize: '32px'
            }}>
              {room.room_code}
            </h1>

            <p>ลิงก์เชิญเพื่อน</p>

            <input
              type="text"
              readOnly
              value={inviteLink}
              onFocus={e => e.target.select()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #536174',
                background: '#202938',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />

            <button
              onClick={copyInviteLink}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '12px',
                border: 'none',
                borderRadius: '8px',
                background: '#e0a33b',
                color: '#111',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              {copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์เชิญ'}
            </button>

            <p style={{
              color: '#9aa6b5',
              fontSize: '13px',
              marginTop: '18px'
            }}>
              ส่งลิงก์นี้ให้เพื่อนเพื่อเข้าห้องเดียวกัน
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
