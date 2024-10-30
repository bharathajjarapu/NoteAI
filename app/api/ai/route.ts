import { NextResponse } from 'next/server'
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { action, content } = await req.json()
    const systemPrompts = {
      generate: "You are a helpful AI writing assistant. Generate content based on the given prompt:",
      paraphrase: "Paraphrase the following text while maintaining its meaning:",
      summarize: "Provide a concise summary of the following text:",
      elaborate: "Expand and elaborate on the following text with more details and examples:"
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompts[action as keyof typeof systemPrompts] },
        { role: "user", content }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1000,
    })

    return NextResponse.json({
      content: completion.choices[0]?.message?.content || ''
    })
  } catch (error) {
    console.error('AI processing error:', error)
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 })
  }
}