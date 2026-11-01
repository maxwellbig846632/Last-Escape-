
import React, { useState, useEffect } from 'react'

export default function App() {
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState(() =>
    new URLSearchParams(window.location.search)
      .get('room')?.toUpperCase() || ''
  )
  const [room, setRoom] = useState(null)
  const [lobbyData, setLobbyData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lobbyError, setLobbyError] = useState('')
  const [copied, setCopied] = useState(false)

  const inviteLink = room
    ? `${window.location.origin}/?room=${room.room_code}`
    : ''

  async function sendRequest(endpoint, body) {
    const response = await fetch(
      `/.netlify/functions/${endpoint}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    )

    const responseText = await response.text()
    let result

    try {
      result = JSON.parse(responseText)
    } catch {
      throw new Error('เซิร์ฟเวอร์ส่งข้อมูลกลับมาไม่ถูกต้อง')
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

    try {
      const result = await sendRequest('create-room', {
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

  // ตรวจสอบรายชื่อผู้เล่นทุก 3 วินาที
  useEffect(() => {
    if (!room?.room_id || !room?.player_id) return

    let active = true

    async function loadRoom() {
      try {
        const sessionToken = localStorage.getItem(
          `hell-city-${room.room_id}`
        )

        if (!sessionToken) {
          throw new Error('ไม่พบข้อมูลยืนยันตัวผู้เล่น')
        }

        const result = await sendRequest('get-room', {
          room_id: room.room_id,
          player_id: room.player_id,
          session_token: sessionToken
        })

        if (active) {
          setLobbyData(result)
          setLobbyError('')
        }
      } catch (err) {
        if (active) setLobbyError(err.message)
      }
    }

    loadRoom()
    const timer = setInterval(loadRoom, 3000)

    return () => {
      active = false
      clearInterval(timer)
    }
  }, [room])

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
    } catch {
      setError('คัดลอกไม่ได้ กรุณาคัดลอกจากช่องลิงก์แทนครับ')
    }
  }

  const players = lobbyData?.players || []
  const roomInfo = lobbyData?.room
  const isOwner = roomInfo?.owner_player_id === room?.player_id

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

      {!room ? (
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
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ชื่อผู้เล่น"
            maxLength={30}
            disabled={loading}
            style={inputStyle}
          />

          <button
            onClick={createRoom}
            disabled={loading}
            style={goldButton}
          >
            {loading ? 'กำลังดำเนินการ...' : 'สร้างห้องใหม่'}
          </button>

          <div style={{
            borderTop: '1px solid #536174',
            marginTop: '24px',
            paddingTop: '20px'
          }}>
            <h3>เข้าร่วมห้อง</h3>

            <input
              value={roomCode}
              onChange={e =>
                setRoomCode(e.target.value.toUpperCase().slice(0, 6))
              }
              placeholder="รหัสห้อง 6 ตัว"
              maxLength={6}
              disabled={loading}
              style={{
                ...inputStyle,
                textAlign: 'center',
                letterSpacing: '4px'
              }}
            />

            <button
              onClick={joinRoom}
              disabled={loading}
              style={blueButton}
            >
              {loading ? 'กำลังเข้าห้อง...' : 'เข้าร่วมห้อง'}
            </button>
          </div>

          {error && <p style={errorStyle}>{error}</p>}
        </section>
      ) : (
        <section style={{
          maxWidth: '500px',
          margin: '30px auto',
          padding: '24px',
          background: '#202938',
          borderRadius: '16px'
        }}>
          <h2 style={{ color: '#70d69b' }}>
            ห้องรอผู้เล่น
          </h2>

          <p>รหัสห้อง</p>

          <h1 style={{
            color: '#e0a33b',
            letterSpacing: '6px'
          }}>
            {room.room_code}
          </h1>

          <p>ลิงก์เชิญเพื่อน</p>

          <input
            readOnly
            value={inviteLink}
            onFocus={e => e.target.select()}
            style={inputStyle}
          />

          <button
            onClick={copyInviteLink}
            style={goldButton}
          >
            {copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์เชิญ'}
          </button>

          <div style={{
            marginTop: '28px',
            textAlign: 'left',
            borderTop: '1px solid #536174',
            paddingTop: '18px'
          }}>
            <h3>
              ผู้เล่นในห้อง ({players.length}/
              {roomInfo?.max_players || 6})
            </h3>

            {!lobbyData && (
              <p style={{ color: '#e0a33b' }}>
                กำลังโหลดรายชื่อผู้เล่น...
              </p>
            )}

            {players.map((player, index) => (
              <div
                key={player.id}
                style={{
                  background: '#10141d',
                  padding: '14px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div>
                  <strong>{player.player_name}</strong>
                  {player.is_owner && (
                    <span style={{ color: '#e0a33b' }}>
                      {' '}เจ้าของห้อง
                    </span>
                  )}
                  <div style={{
                    fontSize: '12px',
                    color: '#9aa6b5',
                    marginTop: '5px'
                  }}>
                    {player.status === 'spectator'
                      ? 'ผู้ชม'
                      : `ผู้เล่นหมายเลข ${player.seat_number || index + 1}`}
                  </div>
                </div>

                <span style={{
                  color: player.status === 'connected'
                    ? '#70d69b'
                    : '#e0a33b',
                  fontSize: '13px'
                }}>
                  {player.status === 'connected'
                    ? 'อยู่ในห้อง'
                    : player.status}
                </span>
              </div>
            ))}

            {lobbyError && (
              <p style={errorStyle}>
                อัปเดตข้อมูลไม่สำเร็จ: {lobbyError}
              </p>
            )}

            <p style={{
              color: '#9aa6b5',
              fontSize: '13px',
              textAlign: 'center',
              marginTop: '20px'
            }}>
              ระบบตรวจสอบรายชื่ออัตโนมัติทุก 3 วินาที
            </p>

            {isOwner && (
              <p style={{
                color: '#e0a33b',
                textAlign: 'center'
              }}>
                คุณเป็นเจ้าของห้อง
              </p>
            )}

            <p style={{
              color: '#9aa6b5',
              textAlign: 'center',
              fontSize: '13px'
            }}>
              รอระบบพร้อมเล่นในขั้นตอนถัดไป
            </p>
          </div>
        </section>
      )}

      <p style={{ color: '#9aa6b5' }}>
        ผู้เล่น 2–6 คน
      </p>
    </main>
  )
}

const inputStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '8px',
  border: '1px solid #536174',
  marginBottom: '14px',
  fontSize: '16px',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#111'
}

const goldButton = {
  width: '100%',
  padding: '14px',
  border: 'none',
  borderRadius: '8px',
  background: '#e0a33b',
  color: '#111',
  fontWeight: 'bold',
  fontSize: '16px',
  marginBottom: '10px'
}

const blueButton = {
  ...goldButton,
  background: '#4b9bd8',
  color: 'white'
}

const errorStyle = {
  color: '#ff8888',
  overflowWrap: 'anywhere'
}
