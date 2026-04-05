import { supabase } from '../lib/supabase'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

/**
 * AI Chat Service for Global Assistant & Doubt Solver
 */
export const sendChatMessage = async (message, context = {}) => {
  if (!GEMINI_API_KEY) {
    throw new Error('AI credits not configured. Please check VITE_GEMINI_API_KEY in .env')
  }

  const { role, currentPage, user, batchId } = context
  
  // 1. Fetch relevant materials for Doubt Solving if batchId is provided
  let materialsContext = ""
  if (batchId) {
    try {
      const { data: materials } = await supabase
        .from('materials')
        .select('title, content')
        .eq('batch_id', batchId)
        .limit(3)
      
      if (materials?.length > 0) {
        materialsContext = "\n\nRELEVANT CLASS MATERIALS:\n" + materials.map(m => `Title: ${m.title}\nContent: ${m.content?.substring(0, 500)}`).join('\n---\n')
      }
    } catch (err) {
      console.warn('Failed to fetch materials for context:', err)
    }
  }

  const systemPrompt = `You are "IntelliX AI", a premium educational assistant for the IntelliX SaaS platform.
Current Platform Context:
- User Role: ${role || 'User'}
- Current Page: ${currentPage || 'Dashboard'}
- User Name: ${user?.user_metadata?.full_name || 'Student'}

YOUR MISSION:
1. Be helpful, professional, and encouraging.
2. For STUDENTS: Help solve doubts using the provided class materials. If no materials are relevant, use your general knowledge but focus on conceptual clarity.
3. For TEACHERS: Help with test creation, batch management, and performance insights.
4. For ADMINS: help with institute-wide analytics and management.
5. KEEP RESPONSES CONCISE and formatted with Markdown.

${materialsContext}`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: "Understood. I am IntelliX AI, your personal assistant. How can I help you today?" }] },
          { role: 'user', parts: [{ text: message }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error?.message || 'Gemini API Error')
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response."
  } catch (err) {
    console.error('AI Chat Error:', err)
    throw err
  }
}
