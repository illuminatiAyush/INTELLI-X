import { createWorker } from 'tesseract.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const DOUBT_SOLVER_PROMPT = `You are "IntelliX Doubt Solver", an expert teacher dedicated to helping students solve their academic problems.

YOUR MISSION:
Instead of just giving the answer, you must act like a pedagogical guide. Lead the student through the concept, the logic, and then the final result.

### RESPONSE STRUCTURE:
You MUST follow this exact structure for every response:

## Problem Understanding
[Restate the user's problem or OCR text clearly]

## Concept
[Explain the underlying academic concept or formula involved in this problem in simple terms]

## Solution Steps
1. [Step 1 description]
2. [Step 2 description]
...

## Final Answer
[Provide the final concise result highlighted clearly]

## Tip
[Provide a useful shortcut, a common pitfall to avoid, or a mnemonic related to this problem]

TONE:
- Encouraging, professional, and clear.
- Use Markdown for beautiful formatting.
- Avoid generic AI filler.
`;

/**
 * Extract text from an image using Tesseract.js
 */
export const performOCR = async (imageSource, onProgress) => {
  const worker = await createWorker('eng', 1, {
    logger: m => {
      if (onProgress) {
        if (m.status === 'loading tesseract core' || m.status === 'initializing tesseract') {
          onProgress(Math.round(m.progress * 20)); // 0-20%
        } else if (m.status === 'loading language traineddata') {
          onProgress(20 + Math.round(m.progress * 30)); // 20-50%
        } else if (m.status === 'initializing api') {
          onProgress(55);
        } else if (m.status === 'recognizing text') {
          onProgress(60 + Math.round(m.progress * 40)); // 60-100%
        }
      }
    }
  });

  try {
    const { data: { text } } = await worker.recognize(imageSource);
    if (onProgress) onProgress(100);
    return text.trim();
  } catch (err) {
    console.error('OCR Error:', err);
    throw new Error('Failed to extract text from the image. Please type your doubt manually.');
  } finally {
    await worker.terminate();
  }
};

/**
 * Solve a doubt using Groq LLM
 */
export const solveDoubt = async (message, context = {}) => {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!groqKey) {
    throw new Error("AI service is not configured. Please contact support.");
  }

  const { ocrText, history = [] } = context;

  const messages = [
    { role: 'system', content: DOUBT_SOLVER_PROMPT }
  ];

  // Add conversation history
  if (history.length > 0) {
    history.slice(-6).forEach(msg => {
      messages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.text
      });
    });
  }

  // Combine user message and OCR text if present
  let fullMessage = message;
  if (ocrText) {
    fullMessage = `[OCR Text from Image]: ${ocrText}\n\n[User Question]: ${message || "Please solve the problem in the image."}`;
  }

  messages.push({ role: 'user', content: fullMessage });

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model: GROQ_MODEL,
        temperature: 0.5, // Lower temperature for more precise academic solving
        max_tokens: 2048,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I couldn't generate a solution. Please try again.";
  } catch (err) {
    console.error('AI Processing Error:', err);
    throw err;
  }
};

export default { performOCR, solveDoubt };
