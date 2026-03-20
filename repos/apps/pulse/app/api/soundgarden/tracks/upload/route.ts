import { NextResponse } from 'next/server'

const SOUNDGARDEN_BASE_URL =
  process.env.SOUNDGARDEN_BASE_URL ?? 'http://localhost:7100'

export async function POST(request: Request): Promise<NextResponse> {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { errorCode: 'UPLOAD_INTERRUPTED', message: 'No file provided' },
        { status: 400, headers: { 'x-request-id': requestId } }
      )
    }

    const forwardFormData = new FormData()
    forwardFormData.append(
      'file',
      file,
      file instanceof File ? file.name : 'audio.mp3'
    )

    const metadata = formData.get('metadata')
    if (metadata && typeof metadata === 'string') {
      forwardFormData.append('metadata', metadata)
    }

    const response = await fetch(`${SOUNDGARDEN_BASE_URL}/tracks/upload`, {
      method: 'POST',
      body: forwardFormData,
      headers: {
        'x-request-id': requestId
      }
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(
        {
          errorCode: data.errorCode ?? 'UPLOAD_FAILED',
          message: data.message ?? 'Upload failed'
        },
        {
          status: response.status,
          headers: { 'x-request-id': requestId }
        }
      )
    }

    return NextResponse.json(data, {
      headers: { 'x-request-id': requestId }
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { errorCode: 'UPLOAD_FAILED', message },
      {
        status: 500,
        headers: { 'x-request-id': requestId }
      }
    )
  }
}
