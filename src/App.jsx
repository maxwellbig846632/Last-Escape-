
import React from 'react'

export default function App() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#10141d',
      color: '#ffffff',
      fontFamily: 'sans-serif',
      padding: '24px',
      textAlign: 'center'
    }}>
      <h1>หนีจากเมืองนรก</h1>
      <p>HELL CITY ESCAPE</p>

      <section style={{
        maxWidth: '420px',
        margin: '40px auto',
        padding: '24px',
        background: '#202938',
        borderRadius: '16px'
      }}>
        <h2>ระบบเกมออนไลน์</h2>
        <p>เตรียมสร้างห้องเพื่อเล่นกับเพื่อน</p>
        <button style={{
          padding: '14px 24px',
          borderRadius: '8px',
          border: 'none',
          background: '#e0a33b',
          color: '#111',
          fontWeight: 'bold'
        }}>
          สร้างห้องเกม
        </button>
      </section>

      <p style={{ color: '#9aa6b5' }}>
        ผู้เล่น 2–6 คน
      </p>
    </main>
  )
}
