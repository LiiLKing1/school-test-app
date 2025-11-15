import { useState } from 'react'
import ResultsTable from './ResultsTable.jsx'
import { createTest } from '../utils/firestore'

const emptyQuestion = () => ({ q: '', options: ['', '', '', ''], correct: '', score: 2 })

export default function AdminDashboard() {
  const [tab, setTab] = useState('results')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

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
      setTab('results')
    } catch (e2) {
      setMessage(e2.message || 'Failed to save test')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      <div role="tablist" className="tabs tabs-lifted">
        <input type="radio" name="tabs" role="tab" className="tab" aria-label="Create Test" checked={tab==='create'} onChange={()=>setTab('create')} />
        <div role="tabpanel" className="tab-content bg-base-100 p-4 rounded-box">
          <form onSubmit={handleSaveTest} className="space-y-4">
            {message && <div className="alert alert-info text-sm">{message}</div>}
            <input className="input input-bordered w-full" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
            <textarea className="textarea textarea-bordered w-full" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="card bg-base-100 shadow">
                  <div className="card-body space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Question {idx + 1}</h3>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={()=>removeQuestion(idx)} disabled={questions.length===1}>Remove</button>
                    </div>
                    <input className="input input-bordered w-full" placeholder="Question text" value={q.q} onChange={(e)=>setQuestionField(idx,'q',e.target.value)} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, j) => (
                        <input key={j} className="input input-bordered w-full" placeholder={`Option ${j+1}`} value={opt} onChange={(e)=>setOption(idx, j, e.target.value)} required />
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="form-control">
                        <label className="label"><span className="label-text">Correct answer</span></label>
                        <select className="select select-bordered w-40" value={q.correct} onChange={(e)=>setQuestionField(idx,'correct', e.target.value)} required>
                          <option value="" disabled>Select correct</option>
                          {q.options.filter(Boolean).map((opt, j) => (
                            <option value={opt} key={j}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label"><span className="label-text">Score</span></label>
                        <select className="select select-bordered w-24" value={q.score ?? 2} onChange={(e)=>setQuestionField(idx,'score', Number(e.target.value))}>
                          {[1,2,3,4,5].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <label className="label"><span className="label-text-alt">Default 2 ball</span></label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="btn" onClick={addQuestion}>Add Question</button>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Test'}</button>
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
