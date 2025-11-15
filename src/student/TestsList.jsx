import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTests } from '../utils/firestore'

export default function StudentTestsList() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await getTests()
      setTests(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Available Tests</h1>
      {loading ? (
        <div className="loading loading-spinner" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map(t => (
            <div key={t.id} className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">{t.title}</h2>
                <p>{t.description}</p>
                <div className="text-sm opacity-80">Total score: {(t.questions || []).reduce((s,q)=> s + (typeof q.score==='number'? q.score : 2), 0)}</div>
                <div className="card-actions justify-end">
                  <Link to={`/test/${t.id}`} className="btn btn-primary">Start</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
