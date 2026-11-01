
import { createClient } from '@supabase/supabase-js'
import { randomBytes, createHash } from 'node:crypto'

export async function handler(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { player_name } = JSON.parse(event.body || '{}')
    const name = String(player_name || '').trim()

    if (name.length < 1 || name.length > 30) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'กรุณาตั้งชื่อผู้เล่น 1-30 ตัวอักษร'
        })
      }
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const secretKey = process.env.SUPABASE_SECRET_KEY

    if (!supabaseUrl || !secretKey) {
      throw new Error('Missing server configuration')
    }

    const supabase = createClient(supabaseUrl, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const sessionToken = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256')
      .update(sessionToken)
      .digest('hex')

    const { data, error } = await supabase.rpc(
      'create_game_room',
      {
        p_player_name: name,
        p_session_token_hash: tokenHash
      }
    )

    if (error) {
      throw error
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...data,
        session_token: sessionToken
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'ไม่สามารถสร้างห้องเกมได้',
        detail: error.message
      })
    }
  }
}
