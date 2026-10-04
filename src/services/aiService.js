/**
 * AI Service — Groq-primary engine for the landing page chatbot.
 * RAG-ready structure with conversation history support.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_FALLBACK_MODEL = 'llama-3.1-8b-instant'

const SYSTEM_PROMPT = `You are IntelliX AI, an advanced academic assistant integrated into a coaching management platform.

You assist students, teachers, and admins with highly structured, context-aware, and actionable responses.

RESPONSE BEHAVIOR:
- ALWAYS respond in properly formatted Markdown.
- Use headings (## Topic) to section your response.
- Use bullet points, bold text, and step-by-step breakdowns for clarity.
- Keep responses concise, structured, and highly readable.
- Prioritize ChatGPT-like readability over long unstructured blocks.

CONTEXT HANDLING:
- You will receive additional context: User Role, Platform Data (attendance, tests, materials, etc.)
- You MUST tailor responses based on role.
- Use context if available.
- Avoid assumptions if data is missing.

ROLE-BASED BEHAVIOR:
- STUDENT: Focus on concept clarity, study plans, test preparation, weak area improvement.
- TEACHER: Focus on test creation, student performance insights, teaching strategies.
- ADMIN: Focus on analytics, system insights, optimization suggestions.

RESPONSE LOGIC:
- Concept Explanation: (1) Simple explanation, (2) Example, (3) Optional code/formula.
- Planning Requests: Day-wise or step-wise breakdown.
- Question Generation: Easy then Medium then Hard.
- Platform Queries: Answer based strictly on provided data.

STRICT RULES:
- Format cleanly with Markdown.
- No raw or broken markdown markers.
- No long unstructured paragraphs.
- No generic AI phrases.
- No hallucinated data.

GOAL: Act like a smart academic assistant embedded inside IntelliX, giving precise, structured, and context-aware responses.`;

// Response Cleaner
const cleanResponse = (text) => {
  if (!text) return "I couldn't generate a response.";
  
  let cleaned = text.trim();

  // Protect against overly long responses
  if (cleaned.length > 3000) {
    cleaned = cleaned.substring(0, 3000) + '\n\n_[Response trimmed for readability]_';
  }

  return cleaned;
};

/**
 * Send a message to the AI engine.
 * @param {string} message - User query
 * @param {Array} history - Chat history [{role, text}]
 * @param {string} role - User role (student/teacher/admin)
 * @param {Object} contextData - Platform context data
 * @param {string[]} [contextChunks] - Future RAG chunks
 * @returns {Promise<string>} Cleaned AI response
 */
export const sendMessage = async (message, history = [], role = 'student', contextData = {}, contextChunks = []) => {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!groqKey) {
    throw new Error("AI assistant is not configured. Please set VITE_GROQ_API_KEY in your environment.");
  }

  // Build context string
  let contextStr = `User Role: ${role}\nContext Data: ${JSON.stringify(contextData)}`;
  
  // RAG-ready: inject pre-retrieved chunks
  if (contextChunks.length > 0) {
    contextStr += `\n\nRELEVANT CONTEXT:\n${contextChunks.join('\n---\n')}`;
  }

  // Format conversation history (last 10 messages)
  const formattedHistory = history.slice(-10).map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }));

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: contextStr },
    ...formattedHistory,
    { role: "user", content: message }
  ];

  // Try primary model, then fallback
  try {
    return await callGroq(groqKey, messages, GROQ_MODEL);
  } catch (primaryErr) {
    console.warn('Primary model failed, trying fallback:', primaryErr.message);
    
    try {
      return await callGroq(groqKey, messages, GROQ_FALLBACK_MODEL);
    } catch (fallbackErr) {
      console.error('AI Service Error (all models failed):', fallbackErr);
      throw new Error('AI service is temporarily unavailable. Please try again shortly.');
    }
  }
};

/**
 * Internal: Call Groq chat completions API.
 */
async function callGroq(apiKey, messages, model) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
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
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.error?.message || `API Error: ${response.status}`;
      
      if (response.status === 429) {
        throw new Error('AI rate limit reached. Please wait a moment and try again.');
      }
      throw new Error(msg);
    }

    const data = await response.json();
    const rawResponse = data.choices?.[0]?.message?.content || "I couldn't generate a response.";
    return cleanResponse(rawResponse);
  } finally {
    clearTimeout(timeout);
  }
}
