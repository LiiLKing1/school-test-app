import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setCurrentStudent } from '../utils/localStudent'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [classNumber, setClassNumber] = useState('')
  const [classType, setClassType] = useState('A')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      setCurrentStudent({ firstName, lastName, classNumber, classType })
      navigate('/tests')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title">Ro'yxatdan o'tish</h2>
        {error && <div className="alert alert-error text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input input-bordered w-full" placeholder="Ism" value={firstName} onChange={(e)=>setFirstName(e.target.value)} required />
          <input className="input input-bordered w-full" placeholder="Familya" value={lastName} onChange={(e)=>setLastName(e.target.value)} required />
          <input className="input input-bordered w-full" placeholder="Sinf raqami (masalan, 7)" value={classNumber} onChange={(e)=>setClassNumber(e.target.value)} required />
          <select className="select select-bordered w-full" value={classType} onChange={(e)=>setClassType(e.target.value)}>
            {['A','B','C','D','E','F'].map(t => <option key={t} value={t}>{`Sinf turi ${t}`}</option>)}
          </select>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Saving...' : 'Register'}</button>
        </form>
        <p className="text-sm">Admin? <Link to="/admin" className="link">Go to admin login</Link></p>
      </div>
    </div>
  )
}
