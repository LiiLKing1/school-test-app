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
      setTest(data)
      setAnswers(data?.questions?.map(()=> '') || [])
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{test.title}</h1>
        <p className="opacity-80">{test.description}</p>
        <div className="mt-2 text-sm opacity-80">Total score: {(test.questions || []).reduce((s,q)=>s + (typeof q.score==='number'? q.score : 2), 0)}</div>
      </div>
      <div className="space-y-6">
        {test.questions.map((q, idx) => (
          <div key={idx} className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="font-medium flex items-center gap-2">Q{idx+1}. {q.q} <span className="badge badge-outline">Score: {typeof q.score==='number'? q.score : 2}</span></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {q.options.map((opt, j) => (
                  <label key={j} className={`btn justify-start ${answers[idx]===opt?'btn-primary':''}`}>
                    <input type="radio" className="radio mr-2" name={`q-${idx}`} checked={answers[idx]===opt} onChange={()=>selectAnswer(idx, opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" disabled={!allAnswered || submitting} onClick={handleSubmit}>
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  )
}
