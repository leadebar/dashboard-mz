import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { messages, system } = req.body
  if (!messages || !system) return res.status(400).json({ error: 'Missing fields' })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system,
        messages,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3,
          }
        ],
      }),
    })
    const data = await response.json()
    if (!response.ok) return res.status(response.status).json(data)

    // Extract text from all content blocks (text + tool_result)
    const blocks = data.content || []
    const text = blocks
      .filter((b: {type: string}) => b.type === 'text')
      .map((b: {text: string}) => b.text)
      .join('\n')

    res.status(200).json({ content: text || '' })
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
}
