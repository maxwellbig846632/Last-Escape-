
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

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
    const {
      room_id,
      player_id,
      session_token
    } = JSON.parse(event.body || '{}')

    if (!room_id || !player_id || !session_token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'ข้อมูลเข้าห้องไม่ครบ' })
      }
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const tokenHash = createHash('sha256')
      .update(session_token)
      .digest('hex')

    const { data: player, error: playerError } =
      await supabase
        .from('game_players')
        .select('id, room_id, player_name, seat_number, is_owner, status, is_ready, session_token_hash')
        .eq('id', player_id)
        .eq('room_id', room_id)
        .maybeSingle()

    if (playerError) throw playerError

    if (!player || player.session_token_hash !== tokenHash) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'ไม่สามารถยืนยันสิทธิ์ผู้เล่นได้' })
      }
    }

    const { data: room, error: roomError } =
      await supabase
        .from('game_rooms')
        .select('id, room_code, owner_player_id, status, max_players')
        .eq('id', room_id)
        .maybeSingle()

    if (roomError) throw roomError

    if (!room) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'ไม่พบห้องเกมนี้' })
      }
    }

    const { data: players, error: playersError } =
      await supabase
        .from('game_players')
        .select('id, player_name, seat_number, is_owner, status, is_ready')
        .eq('room_id', room_id)
        .order('joined_at', { ascending: true })

    if (playersError) throw playersError

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        room,
        players,
        current_player_id: player_id
      })
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'ไม่สามารถโหลดข้อมูลห้องได้',
        detail: error.message
      })
    }
  }
}
