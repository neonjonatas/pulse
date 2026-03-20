import axios from 'axios'
import { requireStringEnv } from '@pack/env-orchestration'
import type { SpotifyTokenResponse } from './spotify.types'

const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const EXPIRY_BUFFER_MS = 60_000

let cachedToken: string | null = null
let expiresAt = 0

export async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < expiresAt) {
    return cachedToken
  }

  const clientId = requireStringEnv('SPOTIFY_CLIENT_ID')
  const clientSecret = requireStringEnv('SPOTIFY_CLIENT_SECRET')

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  )

  const response = await axios.post<SpotifyTokenResponse>(
    TOKEN_URL,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10_000
    }
  )

  cachedToken = response.data.access_token
  expiresAt = Date.now() + response.data.expires_in * 1_000 - EXPIRY_BUFFER_MS

  return cachedToken
}

export function invalidateToken(): void {
  cachedToken = null
  expiresAt = 0
}
