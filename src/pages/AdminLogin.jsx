import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext.jsx'
import { clearCurrentStudent } from '../utils/localStudent'

export default function AdminLogin() {
  const { login } = useAdmin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Clear any student session when visiting admin login
    clearCurrentStudent()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const role = await login(username, password)
      if (!role) {
        setError('Invalid credentials')
        return
      }
      clearCurrentStudent()
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12 border border-black">
      <div className="bg-black text-white px-4 py-3 text-center text-xl font-extrabold">Admin panel</div>
      <div className="p-5">
        {error && <div className="alert alert-error text-sm mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full border-2 border-black px-3 py-2" placeholder="Login" value={username} onChange={(e)=>setUsername(e.target.value)} required />
          <input type="password" className="w-full border-2 border-black px-3 py-2" placeholder="Parol" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-black text-white px-4 py-2" disabled={loading}>{loading ? 'Kirish...' : 'Kirish'}</button>
        </form>
      </div>
    </div>
  )
}
