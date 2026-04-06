import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Sparkles, Trash2, Plus, ChevronDown, ChevronUp, FileText, Loader2, CheckCircle2, AlertCircle, Brain, Send, Clock } from 'lucide-react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { extractPdfText, cleanText, filterByChapter, generateMCQs, extractQuestionCount } from '../../services/aiTestService'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const AITestCreatorModal = ({ isOpen, onClose, batches = [], onTestCreated }) => {
  const { user, profile } = useAuth()
  const fileInputRef = useRef(null)
  
  // Step tracking
  const [step, setStep] = useState(1) // 1=upload, 2=config, 3=generating, 4=review, 5=saving
  
  // PDF state
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfText, setPdfText] = useState('')
  
  // Config state
  const [prompt, setPrompt] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [testTitle, setTestTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [totalMarks, setTotalMarks] = useState(15)
  
  // Generated questions
  const [questions, setQuestions] = useState([])
  const [editingIndex, setEditingIndex] = useState(null)
  
  // Loading / progress
  const [progress, setProgress] = useState('')
  const [saving, setSaving] = useState(false)

  const resetModal = () => {
    setStep(1)
    setPdfFile(null)
    setPdfText('')
    setPrompt('')
    setSelectedBatch('')
    setTestTitle('')
    setStartTime('')
    setDurationMinutes(30)
    setTotalMarks(15)
    setQuestions([])
    setEditingIndex(null)
    setProgress('')
    setSaving(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  // ── Step 1: Handle PDF Upload ──────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF file')
      return
    }
    
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Max 50MB allowed.')
      return
    }

    setPdfFile(file)
    setStep(3)
    
    try {
      const rawText = await extractPdfText(file, setProgress)
      const cleaned = cleanText(rawText)
      
      // Removed text length validation to allow image-heavy PDFs
      
      setPdfText(cleaned)
      setTestTitle(file.name.replace('.pdf', '').replace(/[_-]/g, ' '))
      setStep(2)
      toast.success(`PDF processed! ${cleaned.length.toLocaleString()} characters extracted.`)
    } catch (err) {
      toast.error(err.message)
      setStep(1)
      setPdfFile(null)
    }
  }

  // ── Step 2: Generate Questions ─────────────────────────────
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt describing what to generate')
      return
    }
    if (!selectedBatch) {
      toast.error('Please select a batch for this test')
      return
    }
    if (!testTitle.trim()) {
      toast.error('Please enter a test title')
      return
    }

    setStep(3)
    
    try {
      // Smart extraction: parse number of questions from prompt
      const extractedCount = extractQuestionCount(prompt)
      setProgress(`Extracting ${extractedCount} questions from prompt...`)
      // Filter content by chapter/section if specified
      setProgress('Filtering content by chapter...')
      const filtered = filterByChapter(pdfText, prompt)
      
      // Generate MCQs with AI-extracted count
      // Append local ids for stable React keys
      const mcqs = (await generateMCQs(filtered, extractedCount, setProgress)).map(q => ({
        ...q,
        local_id: Math.random().toString(36).substr(2, 9)
      }))
      
      setTotalMarks(mcqs.length)
      setQuestions(mcqs)
      setStep(4)
      toast.success(`${mcqs.length} questions generated successfully!`)
    } catch (err) {
      toast.error(err.message)
      setStep(2)
    }
  }

  // ── Step 4: Edit questions ─────────────────────────────────
  const updateQuestion = (index, field, value) => {
    setQuestions(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const updateOption = (qIndex, oIndex, value) => {
    setQuestions(prev => {
      const updated = [...prev]
      const options = [...updated[qIndex].options]
      options[oIndex] = value
      updated[qIndex] = { ...updated[qIndex], options }
      return updated
    })
  }

  const deleteQuestion = (index) => {
    if (questions.length <= 1) {
      toast.error('Cannot delete the last question')
      return
    }
    setQuestions(prev => prev.filter((_, i) => i !== index))
    setEditingIndex(null)
    toast.success('Question deleted')
  }

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      question: 'New question?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'A',
      sort_order: prev.length,
    }])
    setEditingIndex(questions.length)
    toast.success('New question added')
  }

  // ── Step 5: Save Test ──────────────────────────────────────
  const handleSaveTest = async () => {
    if (!testTitle.trim() || !selectedBatch || questions.length === 0) {
      toast.error('Missing required fields')
      return
    }

    setSaving(true)
    setStep(5)
    setProgress('Saving test...')

    try {
      // Get institute_id  
      const instituteId = profile?.institute_id

      // Create the test
      const { data: test, error: testError } = await supabase
        .from('tests')
        .insert({
          title: testTitle,
          batch_id: selectedBatch,
          date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD in local time
          total_marks: totalMarks || questions.length,
          created_by: user.id,
          institute_id: instituteId,
          start_time: startTime || null,
          end_time: startTime && durationMinutes 
            ? new Date(new Date(startTime).getTime() + (durationMinutes || 30) * 60 * 1000).toISOString() 
            : null,
          duration_minutes: durationMinutes || 30,
          is_ai_generated: true,
          status: startTime ? 'published' : 'draft',
        })
        .select()
        .single()

      if (testError) throw testError

      setProgress('Saving questions...')

      // Insert questions
      const questionsToInsert = questions.map((q, i) => ({
        test_id: test.id,
        question: q.question,
        options: q.options,
        answer: q.answer,
        sort_order: i,
        institute_id: instituteId,
      }))

      const { error: qError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (qError) throw qError

      try {
        const { data: batchStudents } = await supabase
          .from('batch_students')
          .select('student_id')
          .eq('batch_id', selectedBatch)

        if (batchStudents && batchStudents.length > 0) {
          const notifications = batchStudents.map(bs => ({
            user_id: bs.student_id,
            title: 'New AI Test Available',
            message: `A new test "${testTitle}" has been created for your class.`,
            type: 'test',
            institute_id: instituteId,
          }))

          await supabase.from('notifications').insert(notifications)
        }
      } catch (notifyErr) {
        console.error('Notification error:', notifyErr)
      }

      toast.success('Test created and published successfully!')
      onTestCreated?.()
      handleClose()
    } catch (err) {
      console.error('Save error:', err)
      toast.error(`Failed to save test: ${err.message}`)
      setStep(4)
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-gradient-to-r from-purple-500/5 to-cyan-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/20">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">IntelliX AI Test Generator</h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {step === 1 && 'Upload a PDF to get started'}
                  {step === 2 && 'Configure your test parameters'}
                  {step === 3 && 'AI is processing...'}
                  {step === 4 && `Review ${questions.length} generated questions`}
                  {step === 5 && 'Saving your test...'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/50">
            <div className="flex items-center gap-2">
              {['Upload PDF', 'Configure', 'Generate', 'Review', 'Save'].map((label, i) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    step > i + 1 ? 'text-green-400' : step === i + 1 ? 'text-purple-400' : 'text-[var(--text-secondary)]/50'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      step > i + 1 
                        ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                        : step === i + 1 
                          ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' 
                          : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]/50'
                    }`}>
                      {step > i + 1 ? '✓' : i + 1}
                    </div>
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                  {i < 4 && <div className={`flex-1 h-px transition-colors ${step > i + 1 ? 'bg-green-500/30' : 'bg-[var(--border-subtle)]'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Upload */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-12">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-md border-2 border-dashed border-[var(--border-subtle)] hover:border-purple-500/50 rounded-3xl p-12 text-center cursor-pointer transition-all hover:bg-purple-500/5 group"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Drop your PDF here</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">or click to browse • Max 50MB</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">
                    <FileText className="w-3.5 h-3.5" />
                    Supports any educational PDF
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Configure */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl mx-auto">
                {/* PDF Info */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-400 truncate">{pdfFile?.name}</p>
                    <p className="text-xs text-green-400/70">{pdfText.length.toLocaleString()} characters extracted</p>
                  </div>
                  <button 
                    onClick={() => { setStep(1); setPdfFile(null); setPdfText('') }}
                    className="text-xs text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                  >
                    Change
                  </button>
                </div>

                {/* Test Title */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Test Title</label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    placeholder="e.g., Physics Chapter 5 Test"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                {/* Batch Select */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Batch</label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select a batch</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* AI Prompt */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                    AI Prompt
                  </label>
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Generate 15 MCQs from Chapter 5 till Section 5.3"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)]/50 outline-none focus:border-purple-500/50 transition-all resize-none"
                    />
                    <div className="absolute right-3 bottom-3">
                      <Sparkles className="w-4 h-4 text-purple-400/50" />
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                    💡 Tip: Specify chapter/section range for better results. E.g., "Chapter 3 till Section 3.5"
                  </p>
                </div>

                {/* AI auto-detects question count from prompt. Show info. */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <p className="text-xs text-purple-400/80 font-medium">
                    💡 AI will auto-detect question count from your prompt. E.g., "Generate <strong>15</strong> MCQs from Chapter 3". Default: 10 if not specified.
                  </p>
                </div>

                {/* Timing Settings */}
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-app)]/30 space-y-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span className="text-lg">⏱️</span> Test Timing (Optional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-purple-500/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Duration (min)</label>
                      <input
                        type="number"
                        min={5}
                        max={180}
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs outline-none focus:border-purple-500/50 transition-all"
                      />
                    </div>
                  </div>
                  {/* Auto-computed end time preview */}
                  {startTime && durationMinutes && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                      <span className="text-xs text-[var(--text-secondary)] font-medium">
                        Auto End Time: <span className="text-[var(--text-primary)] font-bold">
                          {new Date(new Date(startTime).getTime() + durationMinutes * 60 * 1000).toLocaleString()}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => { setStep(1); setPdfFile(null); setPdfText('') }}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || !selectedBatch || !testTitle.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Questions
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Generating / Processing */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-500/10 to-cyan-500/10 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">AI Processing</h3>
                <p className="text-sm text-purple-400 font-medium animate-pulse">{progress || 'Please wait...'}</p>
              </motion.div>
            )}

            {/* Step 4: Review Questions */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Summary */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">
                      {questions.length} questions generated for "{testTitle}"
                    </span>
                  </div>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {questions.map((q, qIdx) => (
                    <div
                      key={q.local_id || qIdx}
                      className={`rounded-2xl border transition-all ${
                        editingIndex === qIdx
                          ? 'border-purple-500/30 bg-purple-500/5'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      {/* Question Header */}
                      <div
                        onClick={() => setEditingIndex(editingIndex === qIdx ? null : qIdx)}
                        className="flex items-start justify-between px-5 py-4 cursor-pointer"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
                            {qIdx + 1}
                          </span>
                          {editingIndex === qIdx ? (
                            <textarea
                              value={q.question}
                              onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              rows={2}
                              className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm outline-none focus:border-purple-500/50 resize-none"
                            />
                          ) : (
                            <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">{q.question}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteQuestion(qIdx) }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {editingIndex === qIdx ? <ChevronUp className="w-4 h-4 text-purple-400" /> : <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />}
                        </div>
                      </div>

                      {/* Expanded Options */}
                      <AnimatePresence>
                        {editingIndex === qIdx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4 space-y-3">
                              {q.options.map((opt, oIdx) => {
                                const optionLetter = ['A', 'B', 'C', 'D'][oIdx]
                                const isCorrect = q.answer === optionLetter
                                return (
                                  <div key={oIdx} className="flex items-center gap-3">
                                    <button
                                      onClick={() => updateQuestion(qIdx, 'answer', optionLetter)}
                                      className={`flex-shrink-0 w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                                        isCorrect
                                          ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                          : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-green-500/30 hover:text-green-400'
                                      }`}
                                    >
                                      {optionLetter}
                                    </button>
                                    <input
                                      value={opt}
                                      onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                      className={`flex-1 px-3 py-2 rounded-lg border text-sm outline-none transition-all ${
                                        isCorrect
                                          ? 'bg-green-500/5 border-green-500/20 text-green-400 focus:border-green-500/40'
                                          : 'bg-[var(--bg-app)] border-[var(--border-subtle)] text-[var(--text-primary)] focus:border-purple-500/50'
                                      }`}
                                    />
                                  </div>
                                )
                              })}
                              <p className="text-[10px] text-[var(--text-secondary)] pl-11">Click a letter to mark it as the correct answer</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all"
                  >
                    ← Back to Config
                  </button>
                  <button
                    onClick={handleSaveTest}
                    disabled={saving || questions.length === 0}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    Publish Test ({questions.length} Qs)
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Saving */}
            {step === 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Publishing Test</h3>
                <p className="text-sm text-[var(--text-secondary)]">{progress}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}

export default AITestCreatorModal
