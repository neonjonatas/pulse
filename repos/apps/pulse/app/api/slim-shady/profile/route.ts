import { NextResponse } from 'next/server'

const SLIM_SHADY_BASE_URL =
  process.env.SLIM_SHADY_BASE_URL ?? 'http://localhost:7400'

type PatchType = 'profile' | 'preferences' | 'onboarding'

interface UpdateProfileRequest {
  profileId: string
  type: PatchType
  data: Record<string, unknown>
}

export async function GET(request: Request): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()

  try {
    const { searchParams } = new URL(request.url)
    const authId = searchParams.get('authId')

    if (!authId) {
      return NextResponse.json(
        {
          errorCode: 'BAD_REQUEST',
          message: 'Query param authId is required'
        },
        { status: 400, headers: { 'x-request-id': requestId } }
      )
    }

    const response = await fetch(
      `${SLIM_SHADY_BASE_URL}/slim-shady/profile/auth/${encodeURIComponent(authId)}`,
      {
        method: 'GET',
        headers: { 'x-request-id': requestId }
      }
    )
    const data = await response.json().catch(() => ({}))

    return NextResponse.json(data, {
      status: response.status,
      headers: { 'x-request-id': requestId }
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { errorCode: 'PROFILE_FETCH_FAILED', message },
      {
        status: 500,
        headers: { 'x-request-id': requestId }
      }
    )
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()

  try {
    const body = (await request.json()) as UpdateProfileRequest

    if (!body.profileId || !body.type || !body.data) {
      return NextResponse.json(
        {
          errorCode: 'BAD_REQUEST',
          message: 'profileId, type, and data are required'
        },
        { status: 400, headers: { 'x-request-id': requestId } }
      )
    }

    const suffix =
      body.type === 'profile'
        ? ''
        : body.type === 'preferences'
          ? '/preferences'
          : '/onboarding'

    const response = await fetch(
      `${SLIM_SHADY_BASE_URL}/slim-shady/profile/${encodeURIComponent(body.profileId)}${suffix}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId
        },
        body: JSON.stringify(body.data)
      }
    )
    const data = await response.json().catch(() => ({}))

    return NextResponse.json(data, {
      status: response.status,
      headers: { 'x-request-id': requestId }
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { errorCode: 'PROFILE_UPDATE_FAILED', message },
      {
        status: 500,
        headers: { 'x-request-id': requestId }
      }
    )
  }
}
