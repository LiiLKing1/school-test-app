import { useState, useEffect } from 'react'
import ResultsTable from './ResultsTable.jsx'
import { createTest, getTests, deleteTest } from '../utils/firestore'
import { clearCurrentStudent } from '../utils/localStudent'

const emptyQuestion = () => ({ q: '', options: ['', '', '', ''], correct: '', score: 2 })

export default function AdminDashboard() {
  const [tab, setTab] = useState('results')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [tests, setTests] = useState([])
  const [testsLoading, setTestsLoading] = useState(false)

  const loadTests = async () => {
    setTestsLoading(true)
    const data = await getTests()
    setTests(data)
    setTestsLoading(false)
  }

  useEffect(() => {
    loadTests()
    // ensure student session cleared when entering admin panel
    clearCurrentStudent()
  }, [])

  const setQuestionField = (idx, field, value) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }
  const setOption = (qIdx, optIdx, value) => {
    setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: q.options.map((o, j) => j === optIdx ? value : o) } : q))
  }
  const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion()])
  const removeQuestion = (idx) => setQuestions(qs => qs.filter((_, i) => i !== idx))

  const handleSaveTest = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const cleaned = questions.map(q => ({ ...q, options: q.options.filter(Boolean) }))
      await createTest({ title, description, questions: cleaned })
      setTitle('')
      setDescription('')
      setQuestions([emptyQuestion()])
      setMessage('Test saved successfully')
      await loadTests()
      setTab('results')
    } catch (e2) {
      setMessage(e2.message || 'Failed to save test')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTest = async (id) => {
    if (!confirm('Ushbu test o\'chirilsinmi?')) return
    await deleteTest(id)
    setTests(ts => ts.filter(t => t.id !== id))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <div role="tablist" className="tabs tabs-lifted">
        <input type="radio" name="tabs" role="tab" className="tab" aria-label="Create Test" checked={tab==='create'} onChange={()=>setTab('create')} />
        <div role="tabpanel" className="tab-content bg-base-100 p-4 rounded-box">
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-bold">Existing Tests</h2>
            {testsLoading ? (
              <div className="loading loading-spinner" />
            ) : tests.length === 0 ? (
              <div className="text-sm opacity-70">Hozircha test yo'q</div>
            ) : (
              <div className="space-y-3">
                {tests.map(t => (
                  <div key={t.id} className="flex items-center justify-between border-2 border-black bg-white px-4 py-2">
                    <div className="min-w-0">
                      <div className="font-semibold break-words">{t.title}</div>
                      <div className="text-xs opacity-70">{(t.questions||[]).reduce((s,q)=>s + (typeof q.score==='number'? q.score:2),0)} score</div>
                    </div>
                    <button className="btn btn-error btn-sm rounded-none" onClick={() => handleDeleteTest(t.id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <form onSubmit={handleSaveTest} className="space-y-5">
            {message && <div className="alert alert-info text-sm">{message}</div>}
            <input className="w-full border-2 border-black px-3 py-2" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
            <textarea className="w-full border-2 border-black px-3 py-2" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
            <div className="space-y-8">
              {questions.map((q, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute inset-0 translate-x-2 translate-y-2 border border-black pointer-events-none" />
                  <div className="relative border-2 border-black bg-white p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">Question {idx + 1}</h3>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={()=>removeQuestion(idx)} disabled={questions.length===1}>Remove</button>
                    </div>
                    <input className="w-full border-2 border-black px-3 py-2" placeholder="Question text" value={q.q} onChange={(e)=>setQuestionField(idx,'q',e.target.value)} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, j) => (
                        <input key={j} className="w-full border-2 border-black px-3 py-2" placeholder={`Option ${j+1}`} value={opt} onChange={(e)=>setOption(idx, j, e.target.value)} required />
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm">Correct answer</label>
                        <select className="border-2 border-black px-3 py-2 w-40" value={q.correct} onChange={(e)=>setQuestionField(idx,'correct', e.target.value)} required>
                          <option value="" disabled>Select correct</option>
                          {q.options.filter(Boolean).map((opt, j) => (
                            <option value={opt} key={j}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm">Score</label>
                        <select className="border-2 border-black px-3 py-2 w-24" value={q.score ?? 2} onChange={(e)=>setQuestionField(idx,'score', Number(e.target.value))}>
                          {[1,2,3,4,5].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="text-xs opacity-70">Default 2 ball</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="inline-block bg-black text-white px-6 py-2 rounded-none" onClick={addQuestion}>Add Question</button>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="inline-block bg-black text-white px-6 py-2 rounded-none" disabled={saving}>{saving ? 'Saving...' : 'Save Test'}</button>
            </div>
          </form>
        </div>

        <input type="radio" name="tabs" role="tab" className="tab" aria-label="Results" checked={tab==='results'} onChange={()=>setTab('results')} />
        <div role="tabpanel" className="tab-content bg-base-100 p-4 rounded-box">
          <ResultsTable />
        </div>
      </div>
    </div>
  )
}
