export function createReasoningStream(trackId: string): EventSource {
  const url = `${getBackstageSseUrl()}/pipelines/${trackId}/events`
  return new EventSource(url)
}

function getBackstageSseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BACKSTAGE_SSE_URL

  if (!baseUrl) {
    throw new Error('Missing required env var NEXT_PUBLIC_BACKSTAGE_SSE_URL')
  }

  return baseUrl.replace(/\/$/, '')
}
