export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const text = searchParams.get('text')

  if (!text) {
    return new Response('Missing text parameter', { status: 400 })
  }

  const encoded = encodeURIComponent(text.slice(0, 200))
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${encoded}`

  try {
    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://translate.google.com/',
      },
    })

    if (!response.ok) {
      return new Response('TTS fetch failed', { status: 502 })
    }

    const audioBuffer = await response.arrayBuffer()

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24h
      },
    })
  } catch {
    return new Response('TTS service unavailable', { status: 502 })
  }
}
