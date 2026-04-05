const SYSTEM_PROMPT = `You are IntelliX AI, an advanced academic assistant integrated into a coaching management platform.

You assist students, teachers, and admins with highly structured, context-aware, and actionable responses.

RESPONSE BEHAVIOR:
- Always respond in a clean, structured format.
- Use headings, bullet points, and step-by-step breakdowns.
- Keep responses concise but highly useful.
- Prioritize clarity over verbosity.

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
- No long unstructured paragraphs
- No generic AI phrases
- No hallucinated data

GOAL: Act like a smart academic assistant embedded inside IntelliX, giving precise, structured, and context-aware responses.`;

// Level 5: Response Cleaner
const cleanResponse = (text) => {
  if (!text) return "I couldn't generate a response.";
  
  let cleaned = text
    // Remove excessive markdown symbols
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '• ')
    .replace(/---/g, '')
    .replace(/```/g, '')
    // Clean up excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Limit response length (max ~2000 chars to keep chat readable)
  if (cleaned.length > 2000) {
    cleaned = cleaned.substring(0, 2000) + '\n\n[Response trimmed for readability]';
  }

  return cleaned;
};

// Level 3 + 4: Context injection + Chat history
export const sendMessage = async (message, history = [], role = 'student', contextData = {}) => {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!groqKey && !geminiKey) {
    throw new Error("AI credits not configured. Please set API keys in your environment.");
  }

  // Formatting history
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'ai' ? 'assistant' : 'user',
    content: msg.text
  }));

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: `User Role: ${role}` },
    { role: "system", content: `Context Data: ${JSON.stringify(contextData)}` },
    ...formattedHistory,
    { role: "user", content: message }
  ];

  // Logic: Try Gemini first if available, else Groq
  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `${SYSTEM_PROMPT}\n\nUser Role: ${role}\nContext: ${JSON.stringify(contextData)}\n\nQuery: ${message}` 
            }] 
          }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        return cleanResponse(raw);
      }
    } catch (err) {
      console.warn("Gemini Chat failed, falling back to Groq:", err);
    }
  }

  // Groq Fallback
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const rawResponse = data.choices?.[0]?.message?.content || "I couldn't generate a response.";
    return cleanResponse(rawResponse);

  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};
