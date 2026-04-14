import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs`

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

// ── STEP 1: Extract text from PDF ─────────────────────────────────────
export const extractPdfText = async (file, onProgress) => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(`Extracting page ${i} of ${pdf.numPages}...`)
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items.map(item => item.str)
    fullText += strings.join(' ') + '\n'
  }
  
  return fullText
}

export const cleanText = (text) => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/Page \d+/gi, '')
    .trim()
}

export const filterByChapter = (text, prompt) => {
  const chapterMatch = prompt.match(/chapter\s+(\d+)/i)
  if (chapterMatch) {
    const chapterNum = chapterMatch[1]
    const chapterIndex = text.toLowerCase().indexOf(`chapter ${chapterNum}`)
    if (chapterIndex !== -1) {
      // Find the start of the next chapter to define a boundary
      const nextChapterMatch = text.toLowerCase().indexOf(`chapter ${parseInt(chapterNum) + 1}`, chapterIndex + 10)
      if (nextChapterMatch !== -1) {
        return text.substring(chapterIndex, nextChapterMatch)
      }
      return text.substring(chapterIndex)
    }
  }
  return text
}

export const extractQuestionCount = (prompt) => {
  const match = prompt.match(/(\d+)\s+questions?/i) || prompt.match(/generate\s+(\d+)/i)
  return match ? parseInt(match[1]) : 10
}

// ── STEP 4 + 5: Generate MCQs using AI (Groq Primary) ─────────────────────────
export const generateMCQs = async (content, numQuestions, onProgress) => {
  onProgress?.('Preparing content for AI...')

  if (!GROQ_API_KEY) {
    throw new Error('AI credits not found. Please configure VITE_GROQ_API_KEY in .env')
  }

  const trimmed = (content || '').trim()
  if (trimmed.length < 100) {
    throw new Error('Not enough text could be extracted from this PDF.')
  }

  const maxChars = 8000
  const truncatedContent = trimmed.length > maxChars ? trimmed.substring(0, maxChars) : trimmed

  onProgress?.('Generating interactive questions...')

  try {
    return await generateWithGroq(truncatedContent, numQuestions, GROQ_API_KEY, onProgress)
  } catch (err) {
    console.warn('Primary Groq model failed, trying fallback:', err)
    // Fallback attempt within Groq with smaller model
    return await generateWithGroq(truncatedContent, numQuestions, GROQ_API_KEY, onProgress, 'llama-3.1-8b-instant')
  }
}

// ── GROQ GENERATOR ───────────────────────────────────────────────────
const generateWithGroq = async (content, numQuestions, apiKey, onProgress, model = 'llama3-70b-8192') => {
  const prompt = `Generate exactly ${numQuestions} high-quality MCQs from this content.
Return ONLY a JSON array of objects with: "question", "options" (array of 4 strings), "answer" ("A", "B", "C", or "D").
No markdown, no text, ONLY JSON.

CONTENT:
${content}`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a JSON-only response bot. Output valid JSON arrays only.' },
        { role: 'user', content: prompt },
      ],
      model: model,
      temperature: 0.7,
      max_tokens: 3000,
    }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error?.message || `AI Error: ${response.status}`)
  }

  const data = await response.json()
  const rawResponse = data.choices?.[0]?.message?.content || ''
  return parseAndValidateMCQs(rawResponse, numQuestions, content, apiKey, onProgress)
}

// Parse and validate MCQ JSON, retry once if invalid
const parseAndValidateMCQs = async (rawResponse, numQuestions, content, apiKey, onProgress) => {
  let questions = tryParseJSON(rawResponse)

  if (!questions) {
    onProgress?.('Retrying with stricter instructions...')
    
    const retryResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Output ONLY a valid JSON array. No text before or after.' },
          { role: 'user', content: `Generate ${numQuestions} MCQs from this content: ${content.substring(0, 4000)}` },
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
      }),
    })

    if (!retryResponse.ok) throw new Error('AI generation failed after retry.')

    const retryData = await retryResponse.json()
    const retryRaw = retryData.choices?.[0]?.message?.content
      
    questions = tryParseJSON(retryRaw)
    if (!questions) throw new Error('AI generated invalid data.')
  }

  const validated = questions.filter(
    (q) => q.question && Array.isArray(q.options) && q.options.length === 4 && ['A', 'B', 'C', 'D'].includes(String(q.answer).toUpperCase().trim())
  ).map((q, i) => ({
    question: String(q.question).trim(),
    options: q.options.map((o) => String(o).trim()),
    answer: String(q.answer).toUpperCase().trim(),
    sort_order: i,
  }))

  if (validated.length === 0) throw new Error('Could not generate valid questions.')

  return validated
}

// ... (omitting unchanged helper function tryParseJSON)

// ── AI PERFORMANCE ANALYZER ───────────────────────────────────────────
export const generateAIFeedback = async (resultData, testData, questions) => {
  const groqKey = import.meta.env.VITE_GROQ_API_KEY
  if (!groqKey) return null

  try {
    const payload = {
      marks: resultData.marks,
      total_marks: testData.total_marks || questions.length,
      percentage: Math.round((resultData.marks / (testData.total_marks || questions.length)) * 100),
      answers_summary: questions.map(q => ({
        question: q.question,
        correct: q.answer,
        student: resultData.answers?.[q.id] || 'Skipped',
        is_correct: q.answer === resultData.answers?.[q.id]
      })).slice(0, 30)
    }

    const prompt = `You are an expert AI educational analyst. Analyze performance and provide feedback.
Input: ${JSON.stringify(payload)}
Return ONLY valid JSON: { strengths: [], weak_topics: [], improvement_suggestions: [], accuracy_pct: number, overall_summary: string }`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'system', content: 'JSON response bot.' }, { role: 'user', content: prompt }],
        model: 'llama3-70b-8192',
        temperature: 0.2,
      })
    })

    if (response.ok) {
      const data = await response.json()
      const raw = data.choices?.[0]?.message?.content || ''
      const start = raw.indexOf('{')
      const end = raw.lastIndexOf('}')
      if (start !== -1 && end !== -1) return JSON.parse(raw.substring(start, end + 1))
    }
    return null
  } catch (err) {
    console.error('AI Feedback Error:', err)
    return null
  }
}
