import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.mjs`

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GROQ_API_KEY

// ── STEP 1: Extract text from PDF ─────────────────────────────────────
export const extractPdfText = async (file, onProgress) => {
  try {
    onProgress?.('Reading PDF file...')
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress?.(`Extracting page ${i} of ${pdf.numPages}...`)
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item) => item.str).join(' ')
      fullText += pageText + '\n\n'
    }

    return fullText
  } catch (err) {
    console.error('PDF extraction error:', err)
    throw new Error('Failed to read PDF. Please ensure the file is a valid PDF document.')
  }
}

// ── STEP 2: Clean extracted text ──────────────────────────────────────
export const cleanText = (rawText) => {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{3,}/g, ' ')
    .replace(/[^\x20-\x7E\n\t.,;:!?'"()\-–—\[\]{}@#$%^&*+=<>/\\|`~₹€£¥°©®™…·•§¶†‡‰′″‹›«»""''÷×±≤≥≠≈∞∑∏∫√∂∆∇∈∉∋∌∩∪⊂⊃⊄⊅⊆⊇⊈⊉⊊⊋αβγδεζηθικλμνξοπρςστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ]/g, '')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()
}

// ── STEP 3: Filter by chapter/section ─────────────────────────────────
export const filterByChapter = (text, prompt) => {
  // Extract chapter/section references from prompt
  const chapterMatch = prompt.match(/chapter\s*(\d+)/i)
  const sectionFromMatch = prompt.match(/section\s*(\d+\.?\d*)/i)
  const sectionToMatch = prompt.match(/(?:till|to|through|until|upto|up\s*to)\s*(?:section\s*)?(\d+\.?\d*)/i)

  if (!chapterMatch && !sectionFromMatch) {
    // No specific chapter reference found, return full text
    return text
  }

  const chapterNum = chapterMatch ? chapterMatch[1] : null
  const sectionFrom = sectionFromMatch ? sectionFromMatch[1] : null
  const sectionTo = sectionToMatch ? sectionToMatch[1] : null

  const lines = text.split('\n')
  let capturing = false
  let result = []
  let foundStart = false

  // Build patterns for matching
  const startPatterns = []
  if (chapterNum) {
    startPatterns.push(new RegExp(`chapter\\s*${chapterNum}\\b`, 'i'))
    startPatterns.push(new RegExp(`^\\s*${chapterNum}\\.\\s`, 'i'))
    startPatterns.push(new RegExp(`chapter\\s*[-–:]?\\s*${chapterNum}`, 'i'))
  }
  if (sectionFrom && !chapterNum) {
    startPatterns.push(new RegExp(`section\\s*${sectionFrom.replace('.', '\\.')}`, 'i'))
    startPatterns.push(new RegExp(`^\\s*${sectionFrom.replace('.', '\\.')}\\s`, 'i'))
  }

  // End patterns - stop at next chapter or past the target section
  const endPatterns = []
  if (chapterNum) {
    const nextChapter = parseInt(chapterNum) + 1
    endPatterns.push(new RegExp(`chapter\\s*${nextChapter}\\b`, 'i'))
    endPatterns.push(new RegExp(`^\\s*${nextChapter}\\.\\s`, 'i'))
  }
  if (sectionTo) {
    const parts = sectionTo.split('.')
    const majorSection = parseInt(parts[0])
    const minorSection = parts[1] ? parseInt(parts[1]) + 1 : null
    if (minorSection !== null) {
      endPatterns.push(new RegExp(`^\\s*${majorSection}\\.${minorSection}\\b`, 'i'))
      endPatterns.push(new RegExp(`section\\s*${majorSection}\\.${minorSection}\\b`, 'i'))
    } else {
      const nextSection = majorSection + 1
      endPatterns.push(new RegExp(`^\\s*${nextSection}\\.`, 'i'))
      endPatterns.push(new RegExp(`section\\s*${nextSection}\\.`, 'i'))
    }
  }

  for (const line of lines) {
    // Check if we should start capturing
    if (!capturing) {
      for (const pattern of startPatterns) {
        if (pattern.test(line)) {
          capturing = true
          foundStart = true
          break
        }
      }
    }

    // Check if we should stop capturing
    if (capturing && foundStart && endPatterns.length > 0) {
      for (const pattern of endPatterns) {
        if (pattern.test(line)) {
          capturing = false
          break
        }
      }
    }

    if (capturing) {
      result.push(line)
    }
  }

  // Fallback: if no specific chapter found, return full text with a warning
  if (result.length < 50) {
    console.warn('Chapter filtering captured too little content, using full text as fallback')
    return text
  }

  return result.join('\n')
}

// ── STEP 4 + 5: Generate MCQs using AI (Gemini or Groq) ─────────────────────────
export const generateMCQs = async (content, numQuestions, onProgress) => {
  onProgress?.('Preparing content for AI...')

  const groqKey = import.meta.env.VITE_GROQ_API_KEY
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
  
  if (!groqKey && !geminiKey) {
    throw new Error('AI credits not found. Please configure Groq or Gemini API key in .env')
  }

  // Optimized truncation to stay within TPM limits (approx 2000-2500 tokens)
  const maxChars = 8000 
  const truncatedContent = content.length > maxChars ? content.substring(0, maxChars) : content

  onProgress?.('Generating interactive questions...')

  // Strategy: Try Gemini first if available (higher limits), else use Groq
  if (geminiKey) {
    try {
      return await generateWithGemini(truncatedContent, numQuestions, geminiKey, onProgress)
    } catch (err) {
      console.warn('Gemini failed, trying Groq fallback:', err)
      if (!groqKey) throw err
    }
  }

  return await generateWithGroq(truncatedContent, numQuestions, groqKey, onProgress)
}

// ── GROQ GENERATOR ───────────────────────────────────────────────────
const generateWithGroq = async (content, numQuestions, apiKey, onProgress) => {
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
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 3000,
    }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    const msg = errData.error?.message || ''
    if (msg.includes('TPM')) {
      throw new Error('Content too large for current AI limit. Please try a smaller section or upgrade to Dev Tier.')
    }
    throw new Error(msg || `AI Error: ${response.status}`)
  }

  const data = await response.json()
  const rawResponse = data.choices?.[0]?.message?.content || ''
  return parseAndValidateMCQs(rawResponse, numQuestions, content, apiKey, onProgress, 'groq')
}

// ── GEMINI GENERATOR ─────────────────────────────────────────────────
const generateWithGemini = async (content, numQuestions, apiKey, onProgress) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
  
  const prompt = `You are an expert educator focusing on high-quality learning assessments.
Generate exactly ${numQuestions} high-quality, conceptually rigorous MCQs based on the provided content.

STRICT CRITERIA:
1. Test deep conceptual understanding, not just surface-level facts.
2. Avoid trivial or obvious distractor options.
3. Include real-world applications or scenarios where possible.
4. Vary difficulty: some foundational, most intermediate, at least 2 highly challenging questions.
5. Provide clear, unambiguous correct answers.

OUTPUT FORMAT:
Return ONLY a raw JSON array of objects with fields: "question", "options" (array of 4 strings), "answer" ("A", "B", "C", or "D").
No markdown code blocks, no intro/outro text.

CONTENT:
${content}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
        responseMimeType: "application/json"
      }
    }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error?.message || 'Gemini API connection failed')
  }

  const data = await response.json()
  const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return parseAndValidateMCQs(rawResponse, numQuestions, content, apiKey, onProgress, 'gemini')
}

// Parse and validate MCQ JSON, retry once if invalid
const parseAndValidateMCQs = async (rawResponse, numQuestions, content, apiKey, onProgress, provider) => {
  let questions = tryParseJSON(rawResponse)

  if (!questions) {
    onProgress?.('Retrying with stricter instructions...')
    
    let retryResponse
    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
      retryResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `System: Output ONLY valid JSON array. No markdown.\nUser: Generate ${numQuestions} MCQs from: ${content.substring(0, 5000)}` }] }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      })
    } else {
      retryResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
    }

    if (!retryResponse.ok) throw new Error('AI generation failed after retry.')

    const retryData = await retryResponse.json()
    const retryRaw = provider === 'gemini' 
      ? retryData.candidates?.[0]?.content?.parts?.[0]?.text 
      : retryData.choices?.[0]?.message?.content
      
    questions = tryParseJSON(retryRaw)
    if (!questions) throw new Error('AI generated invalid data. Please try with less content or fewer questions.')
  }

  // Validate structure and sanitize
  const validated = questions.filter(
    (q) =>
      q.question &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      ['A', 'B', 'C', 'D'].includes(String(q.answer).toUpperCase().trim())
  ).map((q, i) => ({
    question: String(q.question).trim(),
    options: q.options.map((o) => String(o).trim()),
    answer: String(q.answer).toUpperCase().trim(),
    sort_order: i,
  }))

  if (validated.length === 0) {
    throw new Error('Could not generate valid questions. Content might be too technical or too large for the current model.')
  }

  return validated
}

// Helper: try to parse JSON from potentially messy AI output
const tryParseJSON = (text) => {
  if (!text) return null

  // Try direct parse
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed
  } catch {}

  // Try extracting JSON array from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1])
      if (Array.isArray(parsed)) return parsed
    } catch {}
  }

  // Try finding array bounds
  const firstBracket = text.indexOf('[')
  const lastBracket = text.lastIndexOf(']')
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const parsed = JSON.parse(text.substring(firstBracket, lastBracket + 1))
      if (Array.isArray(parsed)) return parsed
    } catch {}
  }

  return null
}

// ── AI PERFORMANCE ANALYZER ───────────────────────────────────────────
export const generateAIFeedback = async (resultData, testData, questions) => {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!geminiKey) return null

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
      })).slice(0, 30) // Cap to prevent token overflow
    }

    const prompt = `You are an expert AI educational analyst. Analyze this student's exact test performance and provide structured feedback.
Input Data:
${JSON.stringify(payload)}

Return ONLY a valid JSON object with the exact following schema:
{
  "strengths": ["array of 2-3 strong areas"],
  "weak_topics": ["array of 2-3 weak topics"],
  "improvement_suggestions": ["array of 2 actionable tips"],
  "accuracy_pct": number,
  "overall_summary": "1 short encouraging sentence summary"
}
No markdown, no json code blocks.`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
      })
    })

    if (!response.ok) return null
    const data = await response.json()
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start !== -1 && end !== -1) {
      return JSON.parse(raw.substring(start, end + 1))
    }
    return null
    
  } catch (err) {
    console.error('AI Feedback Error:', err)
    return null
  }
}
