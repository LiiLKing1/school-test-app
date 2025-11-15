import { useEffect, useState } from 'react'
import { getStudents } from '../utils/firestore'

export default function StudentsTable() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await getStudents()
      setStudents(data)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Students</h1>
      {loading ? (
        <div className="loading loading-spinner" />
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Ism</th>
                <th>Familya</th>
                <th>Sinf raqami</th>
                <th>Sinf turi</th>
                <th>Vaqt</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>{s.firstName}</td>
                  <td>{s.lastName}</td>
                  <td>{s.classNumber}</td>
                  <td>{s.classType}</td>
                  <td>{s.time?.toDate ? s.time.toDate().toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
