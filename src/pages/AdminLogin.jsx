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
    <div className="max-w-sm mx-auto mt-10 card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Admin Login</h2>
        {error && <div className="alert alert-error text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input input-bordered w-full" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} required />
          <input type="password" className="input input-bordered w-full" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <button type="submit" className="btn btn-primary w-full">Login</button>
        </form>
        <div className="text-xs opacity-70 mt-2">Hint: username: Gulnoza, password: test-app-admin</div>
      </div>
    </div>
  )
}
