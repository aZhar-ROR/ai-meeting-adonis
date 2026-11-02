import env from '#start/env'

const PYTHON_API_URL = env.get('PYTHON_AI_URL', 'http://localhost:8000')

export default class GeminiService {
  async analyze(
    transcript: string,
    _modelName: string = 'gemini-2.5-flash',
    promptVersion: number = 3
  ): Promise<Record<string, any>> {
    const body = new URLSearchParams({
      transcript,
      prompt_version: String(promptVersion),
    })

    const res = await fetch(`${PYTHON_API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    const text = await res.text()
    let data: Record<string, any>

    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(
        `The AI service is currently starting up (it sleeps when idle). ` +
        `Please visit ${PYTHON_API_URL}/health and wait until it shows {"status":"ok"}, then try again.`
      )
    }

    if (!res.ok) {
      throw new Error(data.error || `Python AI service returned ${res.status}`)
    }

    return data
  }
}
