import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResultById } from '../utils/firestore'

export default function ResultView() {
  const { id } = useParams()
  const [result, setResult] = useState(null)

  useEffect(() => {
    const load = async () => {
      const data = await getResultById(id)
      setResult(data)
    }
    load()
  }, [id])

  if (!result) return <div className="loading loading-spinner" />

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Result</h1>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div>Test: <span className="font-medium">{result.testTitle || result.testId}</span></div>
          <div>Student: <span className="font-medium">{result.studentName}</span></div>
          <div>Correct: <span className="font-medium">{result.correct}</span></div>
          <div>Wrong: <span className="font-medium">{result.wrongQuestions?.length || 0}</span></div>
          <div>Score: <span className="font-medium">{(result.scoreGain ?? ((result.correct || 0) * 2))} / {(result.scoreTotal ?? (((result.correct || 0) + (result.wrongQuestions?.length || 0)) * 2))}</span></div>
          <div>Time: <span className="font-medium">{result.time?.toDate ? result.time.toDate().toLocaleString() : ''}</span></div>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Wrong Answers</h2>
        {(result.wrongQuestions || []).length === 0 ? (
          <p>Great job! No wrong answers.</p>
        ) : (
          result.wrongQuestions.map((w, i) => (
            <div key={i} className="p-3 rounded border">
              <div className="font-medium">Q{w.index + 1}: {w.q}</div>
              <div className="text-sm">Your answer: {w.selected ?? 'No answer'}</div>
              <div className="text-sm">Correct answer: {w.correct}</div>
            </div>
          ))
        )}
      </div>
      <Link to="/tests" className="btn">Back to tests</Link>
    </div>
  )
}
