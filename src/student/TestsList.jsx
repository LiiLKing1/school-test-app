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
    <div className="space-y-10">
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight">Tests</h1>
        {loading ? (
          <div className="loading loading-spinner" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tests.map(t => (
              <div key={t.id} className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 border border-black pointer-events-none" />
                <div className="relative border-2 border-black bg-white p-5 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <h2 className="text-3xl font-extrabold break-words min-w-0 max-w-full">{t.title}</h2>
                    <span className="text-[11px] px-2 py-0.5 border border-black shrink-0">{(t.questions || []).reduce((s,q)=> s + (typeof q.score==='number'? q.score : 2), 0)} score</span>
                  </div>
                  <p className="mt-1 text-sm break-words">{t.description}</p>
                  <div className="mt-4 pt-2">
                    <Link to={`/test/${t.id}`} className="inline-block bg-black text-white px-6 py-2 rounded-none">Start</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold tracking-tight">Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="relative">
            <div className="absolute inset-0 translate-x-2 translate-y-2 border border-black pointer-events-none" />
            <div className="relative border-2 border-black bg-white p-5 h-full flex flex-col">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <h3 className="text-3xl font-extrabold break-words min-w-0 max-w-full">Brain Bucks</h3>
              </div>
              <p className="mt-1 text-sm break-words">Interactive team game with 100$–500$ questions.</p>
              <div className="mt-4 pt-2">
                <Link to="/games/brain-bucks" className="inline-block bg-black text-white px-6 py-2 rounded-none">Start</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
