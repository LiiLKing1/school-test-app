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
    <div className="max-w-sm mx-auto mt-12 border border-black">
      <div className="bg-black text-white px-4 py-3 text-center text-xl font-extrabold">Ro’yxatdan o’tish</div>
      <div className="p-5">
        {error && <div className="alert alert-error text-sm mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full border-2 border-black px-3 py-2" placeholder="Ism" value={firstName} onChange={(e)=>setFirstName(e.target.value)} required />
          <input className="w-full border-2 border-black px-3 py-2" placeholder="Familya" value={lastName} onChange={(e)=>setLastName(e.target.value)} required />
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <input className="border-2 border-black px-3 py-2" placeholder="Sinf" value={classNumber} onChange={(e)=>setClassNumber(e.target.value)} required />
            <select className="border-2 border-black px-3 py-2" value={classType} onChange={(e)=>setClassType(e.target.value)}>
              {['A','B','C','D','E','F'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button type="submit" className="w-full bg-black text-white px-4 py-2" disabled={loading}>{loading ? 'Saving...' : 'Registratsiya qilish'}</button>
        </form>
        <p className="text-sm mt-3">Admin? <Link to="/admin" className="underline">Admin login</Link></p>
      </div>
    </div>
  )
}
