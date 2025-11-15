import { useEffect, useMemo, useState } from 'react'
import { getResults, clearAllResults } from '../utils/firestore'

export default function ResultsTable() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

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

  const SESSION_GAP_MS = 10 * 60 * 1000
  const COOLDOWN_MS = 10 * 60 * 1000

  const grouped = useMemo(() => {
    // Normalize times and sort ascending
    const items = (results || []).map(r => ({
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button className="btn btn-error" onClick={handleClearAll} disabled={loading || results.length===0}>Clear all</button>
        </div>
        <button className="btn btn-outline" onClick={handleDownload} disabled={loading || results.length===0}>
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
                  <div className="overflow-x-auto mt-3">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Test</th>
                          <th>Correct</th>
                          <th>Wrong</th>
                          <th>Score</th>
                          <th>Time</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.map(r => (
                          <tr key={r.id}>
                            <td>{r.studentName}</td>
                            <td>{r.testTitle || r.testId}</td>
                            <td>{r.correct}</td>
                            <td>{r.wrongQuestions?.length || 0}</td>
                            <td>{(r.scoreGain ?? ((r.correct || 0) * 2))} / {(r.scoreTotal ?? (((r.correct || 0) + (r.wrongQuestions?.length || 0)) * 2))}</td>
                            <td>{r.time?.toDate ? r.time.toDate().toLocaleString() : ''}</td>
                            <td>
                              <button className="btn btn-sm" onClick={()=>setSelected(r)}>View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
