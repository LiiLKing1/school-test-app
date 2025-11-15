import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTestById, saveResult } from '../utils/firestore'
import { getCurrentStudent } from '../utils/localStudent'

export default function TestSolve() {
  const { id } = useParams()
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const student = getCurrentStudent()

  useEffect(() => {
    const load = async () => {
      const data = await getTestById(id)
      // shuffle options once per question for this session
      const shuffle = (arr) => {
        const a = [...arr]
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[a[i], a[j]] = [a[j], a[i]]
        }
        return a
      }
      const withDisplay = data ? {
        ...data,
        questions: (data.questions || []).map(q => ({ ...q, displayOptions: shuffle(q.options || []) }))
      } : null
      setTest(withDisplay)
      setAnswers(withDisplay?.questions?.map(()=> '') || [])
      setLoading(false)
    }
    load()
  }, [id])

  const allAnswered = useMemo(() => answers.length > 0 && answers.every(a => a && a.length > 0), [answers])

  const selectAnswer = (qIdx, val) => {
    setAnswers(arr => arr.map((a, i) => i === qIdx ? val : a))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      let correct = 0
      const wrongQuestions = []
      let scoreGain = 0
      const scoreOf = (q) => (typeof q.score === 'number' && !Number.isNaN(q.score) ? q.score : 2)
      test.questions.forEach((q, idx) => {
        const sel = answers[idx]
        if (sel === q.correct) correct += 1
        if (sel === q.correct) scoreGain += scoreOf(q)
        else wrongQuestions.push({ index: idx, q: q.q, selected: sel, correct: q.correct, options: q.options })
      })
      const scoreTotal = (test.questions || []).reduce((s, q) => s + scoreOf(q), 0)
      const result = {
        studentName: `${student?.firstName ?? ''} ${student?.lastName ?? ''}`.trim() || 'Anonymous',
        testId: id,
        testTitle: test.title,
        correct,
        scoreGain,
        scoreTotal,
        wrongQuestions,
      }
      const resId = await saveResult(result)
      navigate(`/result/${resId}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="loading loading-spinner" />
  if (!test) return <div className="alert">Test not found</div>

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{test.title}</h1>
          <p className="opacity-80">{test.description}</p>
        </div>
        <div className="text-right min-w-[150px]">
          <div className="text-sm opacity-80">Total score:</div>
          <div className="text-xl font-bold">{(test.questions || []).reduce((s,q)=>s + (typeof q.score==='number'? q.score : 2), 0)}</div>
        </div>
      </div>

      <div className="space-y-8">
        {test.questions.map((q, idx) => (
          <div key={idx} className="relative">
            <div className="absolute inset-0 translate-x-2 translate-y-2 border border-black pointer-events-none" />
            <div className="relative border-2 border-black bg-white p-5">
              <div className="font-semibold text-xl flex items-center gap-3 flex-wrap">
                <span className="break-words">Q{idx+1}. {q.q}</span>
                <span className="text-[11px] px-2 py-0.5 border border-black shrink-0">Score: {typeof q.score==='number'? q.score : 2}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {(q.displayOptions || q.options).map((opt, j) => (
                  <label key={j} className={`flex items-center gap-3 border-2 border-black px-4 py-3 cursor-pointer ${answers[idx]===opt?'bg-black text-white':''}`}>
                    <input type="radio" className="radio" name={`q-${idx}`} checked={answers[idx]===opt} onChange={()=>selectAnswer(idx, opt)} />
                    <span className="text-base break-words">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="inline-block bg-black text-white px-6 py-2 rounded-none" disabled={!allAnswered || submitting} onClick={handleSubmit}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  )
}
