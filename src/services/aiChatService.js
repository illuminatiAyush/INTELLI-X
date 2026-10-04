import { supabase } from '../lib/supabase'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_FALLBACK_MODEL = 'llama-3.1-8b-instant'

const SYSTEM_PROMPT = `You are "IntelliX AI", a premium educational assistant embedded inside the IntelliX SaaS platform.

RESPONSE RULES:
1. Be helpful, professional, and encouraging.
2. Keep responses concise and formatted with Markdown.
3. Use bullet points, headings, and step-by-step breakdowns when appropriate.
4. No hallucinated data — if you don't know, say so clearly.
5. No generic AI filler phrases.

ROLE-BASED BEHAVIOR:
- STUDENT: Help solve doubts, explain concepts clearly, suggest study plans, and improve weak areas.
- TEACHER: Help with test creation, batch management, performance analysis, and teaching strategies.
- ADMIN: Help with institute analytics, system insights, and management optimization.

GOAL: Act like a smart, context-aware academic assistant giving precise, structured, and actionable responses.`

/**
 * Clean and truncate AI response for chat readability.
 */
const cleanResponse = (text) => {
  if (!text) return "I couldn't generate a response. Please try again."
  let cleaned = text
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  if (cleaned.length > 2500) {
    cleaned = cleaned.substring(0, 2500) + '\n\n[Response trimmed for readability]'
  }
  return cleaned
}

/**
 * Send a chat message to the AI backend (Groq-primary, RAG-ready).
 *
 * @param {string} message - The user's message.
 * @param {Object} context - Context object for platform awareness and future RAG.
 * @param {string} [context.role] - User role (student/teacher/admin).
 * @param {string} [context.currentPage] - Current dashboard page path.
 * @param {Object} [context.user] - Supabase auth user object.
 * @param {string} [context.batchId] - Optional batch ID for material context.
 * @param {string[]} [context.contextChunks] - Future RAG: pre-retrieved content chunks.
 * @param {Array} [context.history] - Previous chat messages for multi-turn context.
 * @returns {Promise<{reply: string, suggestions?: string[]}>}
 */
export const sendChatMessage = async (message, context = {}) => {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY

  if (!groqKey) {
    return {
      reply: "AI assistant is not configured. Please set VITE_GROQ_API_KEY in your environment.",
      suggestions: []
    }
  }

  const { role, currentPage, user, batchId, contextChunks, history } = context

  // ── Build contextual information ──────────────────────────────────
  let platformContext = `\nPlatform Context:\n- User Role: ${role || 'User'}\n- Current Page: ${currentPage || 'Dashboard'}\n- User Name: ${user?.user_metadata?.full_name || 'User'}`

  // ── RAG-ready: inject pre-retrieved chunks if provided ────────────
  if (contextChunks && contextChunks.length > 0) {
    platformContext += `\n\nRELEVANT CONTEXT (use this to answer):\n${contextChunks.join('\n---\n')}`
  }

  // ── Fetch materials context if batchId provided (lightweight RAG) ─
  if (batchId && (!contextChunks || contextChunks.length === 0)) {
    try {
      const { data: materials } = await supabase
        .from('materials')
        .select('title, content')
        .eq('batch_id', batchId)
        .limit(3)

      if (materials?.length > 0) {
        platformContext += `\n\nRELEVANT CLASS MATERIALS:\n${materials.map(m => `Title: ${m.title}\nContent: ${m.content?.substring(0, 500)}`).join('\n---\n')}`
      }
    } catch (err) {
      console.warn('Failed to fetch materials for context:', err)
    }
  }

  // ── Build message array (OpenAI-compatible format) ────────────────
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + platformContext }
  ]

  // Inject conversation history for multi-turn (last 10 messages max)
  if (history && history.length > 0) {
    const recentHistory = history.slice(-10)
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.text
      })
    })
  }

  messages.push({ role: 'user', content: message })

  // ── Call Groq API ─────────────────────────────────────────────────
  try {
    const reply = await callGroq(groqKey, messages, GROQ_MODEL)
    return { reply, suggestions: [] }
  } catch (primaryErr) {
    console.warn('Primary model failed, trying fallback:', primaryErr.message)

    // Fallback to smaller model
    try {
      const reply = await callGroq(groqKey, messages, GROQ_FALLBACK_MODEL)
      return { reply, suggestions: [] }
    } catch (fallbackErr) {
      console.error('AI Chat Error (all models failed):', fallbackErr)
      return {
        reply: "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        suggestions: ['Try again', 'Ask a simpler question']
      }
    }
  }
}

/**
 * Internal: Call Groq chat completions API.
 */
async function callGroq(apiKey, messages, model) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
        stream: false
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      const msg = errData.error?.message || `API Error: ${response.status}`

      // Rate limit handling
      if (response.status === 429) {
        throw new Error('AI rate limit reached. Please wait a moment and try again.')
      }
      throw new Error(msg)
    }

    const data = await response.json()
    const rawResponse = data.choices?.[0]?.message?.content || ''
    return cleanResponse(rawResponse)
  } finally {
    clearTimeout(timeout)
  }
}

// ── Legacy compatibility: default export for components that import directly ──
export default { sendChatMessage }
