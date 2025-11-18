import { useEffect, useMemo, useState } from 'react'
import { getResults, clearAllResults, deleteResult } from '../utils/firestore'
import { useAdmin } from '../context/AdminContext.jsx'
import { getSubjectDisplay } from '../constants/subjects'

export default function ResultsTable() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const { role, teacher } = useAdmin()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await getResults()
      setResults(data)
      setLoading(false)
    }
    load()
  }, [])

  const toCSV = (rows) => {
    const headers = ['studentName','testTitle','correct','wrongCount','scoreGain','scoreTotal','time']
    const lines = [headers.join(',')]
    rows.forEach(r => {
      const vals = [
        r.studentName ?? '',
        r.testTitle ?? '',
        r.correct ?? 0,
        (r.wrongQuestions?.length ?? 0),
        (r.scoreGain ?? ((r.correct || 0) * 2)),
        (r.scoreTotal ?? (((r.correct || 0) + (r.wrongQuestions?.length || 0)) * 2)),
        r.time?.toDate ? r.time.toDate().toISOString() : '',
      ]
      const esc = vals.map(v => {
        const s = String(v)
        return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g,'""')}"` : s
      })
      lines.push(esc.join(','))
    })
    return '\ufeff' + lines.join('\n')
  }

  const handleDownload = () => {
    const csv = toCSV(results)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `results_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearAll = async () => {
    if (!confirm('Barcha natijalar o\'chirilsinmi?')) return
    await clearAllResults()
    setResults([])
  }

  const handleDeleteResult = async (id) => {
    if (!confirm('Ushbu o\'quvchining natijasi o\'chirilsinmi?')) return
    await deleteResult(id)
    setResults(rs => rs.filter(r => r.id !== id))
  }

  const SESSION_GAP_MS = 10 * 60 * 1000
  const COOLDOWN_MS = 10 * 60 * 1000

  const grouped = useMemo(() => {
    // Apply teacher subject filter if needed
    const isTeacher = role === 'teacher' && !!teacher?.subject
    const isLegacyEnglishTeacher = isTeacher && !teacher.id && teacher.login === 'Gulnoza'
    const base = isTeacher
      ? (results || []).filter(r => {
          if (isLegacyEnglishTeacher) {
            // Legacy results without subject + all English results
            return !r.subject || r.subject === teacher.subject
          }
          return r.subject === teacher.subject
        })
      : (results || [])

    // Normalize times and sort ascending
    const items = base.map(r => ({
      ...r,
      _timeMs: r.time?.toDate ? r.time.toDate().getTime() : 0,
    })).sort((a,b)=>a._timeMs - b._timeMs)

    // Cooldown filter per student+test within cooldown
    const lastMap = new Map()
    const filtered = []
    for (const r of items) {
      const key = `${r.studentName || ''}__${r.testId || ''}`
      const last = lastMap.get(key)
      if (last != null && r._timeMs - last < COOLDOWN_MS) {
        continue
      }
      filtered.push(r)
      lastMap.set(key, r._timeMs)
    }

    // Group into sessions separated by gap
    const groups = []
    let current = []
    let prevMs = null
    for (const r of filtered) {
      if (prevMs != null && r._timeMs - prevMs > SESSION_GAP_MS) {
        if (current.length) groups.push(current)
        current = []
      }
      current.push(r)
      prevMs = r._timeMs
    }
    if (current.length) groups.push(current)

    // Return newest-first groups
    return groups.reverse()
  }, [results])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Test Results</h1>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          <button className="btn btn-error" onClick={handleClearAll} disabled={loading || results.length===0}>Clear all</button>
        </div>
        <button className="btn btn-outline w-full sm:w-auto" onClick={handleDownload} disabled={loading || results.length===0}>
          Download (Excel)
        </button>
      </div>
      {loading ? (
        <div className="loading loading-spinner" />
      ) : (
        <div className="space-y-6">
          {grouped.length === 0 ? (
            <div className="alert">Natijalar yo'q</div>
          ) : (
            grouped.map((group, gi) => (
              <div key={gi} className="card bg-base-100 shadow">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title">Jamoa #{grouped.length - gi}</h2>
                    <button className="btn btn-outline btn-sm" onClick={()=>{
                      const csv = toCSV(group)
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `results_group_${grouped.length - gi}.csv`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}>Download (Excel)</button>
                  </div>
                  <div className="hidden md:block overflow-x-auto mt-3">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Test</th>
                          <th>Subject</th>
                          <th>Correct</th>
                          <th>Wrong</th>
                          <th>Score</th>
                          <th>Time</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.map(r => (
                          <tr key={r.id}>
                            <td>{r.studentName}</td>
                            <td>{r.testTitle || r.testId}</td>
                            <td>{getSubjectDisplay(r.subject)}</td>
                            <td>{r.correct}</td>
                            <td>{r.wrongQuestions?.length || 0}</td>
                            <td>{(r.scoreGain ?? ((r.correct || 0) * 2))} / {(r.scoreTotal ?? (((r.correct || 0) + (r.wrongQuestions?.length || 0)) * 2))}</td>
                            <td>{r.time?.toDate ? r.time.toDate().toLocaleString() : ''}</td>
                            <td>
                              <div className="flex gap-2">
                                <button className="btn btn-sm" onClick={()=>setSelected(r)}>View</button>
                                <button className="btn btn-error btn-sm" onClick={()=>handleDeleteResult(r.id)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden mt-3 space-y-3">
                    {group.map(r => (
                      <div key={r.id} className="border border-base-200 rounded-lg p-3 space-y-2 text-sm">
                        <div className="font-semibold text-base">{r.studentName}</div>
                        <div className="flex flex-wrap text-xs uppercase tracking-wide text-base-content/70 gap-x-4 gap-y-1">
                          <span>Test: <span className="normal-case font-medium text-base-content">{r.testTitle || r.testId}</span></span>
                          <span>Subject: <span className="normal-case font-medium text-base-content">{getSubjectDisplay(r.subject)}</span></span>
                          <span>Correct: <span className="normal-case font-medium text-base-content">{r.correct}</span></span>
                          <span>Wrong: <span className="normal-case font-medium text-base-content">{r.wrongQuestions?.length || 0}</span></span>
                          <span>Score: <span className="normal-case font-medium text-base-content">{(r.scoreGain ?? ((r.correct || 0) * 2))} / {(r.scoreTotal ?? (((r.correct || 0) + (r.wrongQuestions?.length || 0)) * 2))}</span></span>
                        </div>
                        <div className="text-xs text-base-content/80">{r.time?.toDate ? r.time.toDate().toLocaleString() : ''}</div>
                        <div className="flex gap-2 pt-2">
                          <button className="btn btn-sm flex-1" onClick={()=>setSelected(r)}>View</button>
                          <button className="btn btn-error btn-sm flex-1" onClick={()=>handleDeleteResult(r.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <input type="checkbox" checked={!!selected} onChange={()=>{}} className="modal-toggle" />
      <div className={`modal ${selected ? 'modal-open' : ''}`}>
        <div className="modal-box w-11/12 max-w-5xl">
          <h3 className="font-bold text-lg">Wrong Answers</h3>
          {!selected ? null : (
            <div className="mt-4 space-y-3">
              {(selected?.wrongQuestions || []).length === 0 ? (
                <p>All answers were correct.</p>
              ) : (
                selected.wrongQuestions.map((w, i) => (
                  <div key={i} className="p-3 rounded border">
                    <div className="font-medium">Q{w.index + 1}: {w.q}</div>
                    <div className="text-sm">Selected: {w.selected ?? 'No answer'}</div>
                    <div className="text-sm">Correct: {w.correct}</div>
                  </div>
                ))
              )}
            </div>
          )}
          <div className="modal-action">
            <button className="btn" onClick={()=>setSelected(null)}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}
