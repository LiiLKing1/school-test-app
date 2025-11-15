import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext.jsx'

export default function AdminLogin() {
  const { login } = useAdmin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const ok = login(username, password)
    if (!ok) {
      setError('Invalid credentials')
      return
    }
    navigate('/admin/dashboard')
  }

  return (
    <div className="max-w-sm mx-auto mt-12 border border-black">
      <div className="bg-black text-white px-4 py-3 text-center text-xl font-extrabold">Admin panel</div>
      <div className="p-5">
        {error && <div className="alert alert-error text-sm mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="w-full border-2 border-black px-3 py-2" placeholder="Login" value={username} onChange={(e)=>setUsername(e.target.value)} required />
          <input type="password" className="w-full border-2 border-black px-3 py-2" placeholder="Parol" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-black text-white px-4 py-2">Registratsiya qilish</button>
        </form>
        <div className="text-xs opacity-70 mt-2">Hint: Login: Gulnoza, Parol: test-app-admin</div>
      </div>
    </div>
  )
}
