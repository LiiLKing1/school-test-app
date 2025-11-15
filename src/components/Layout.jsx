import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAdmin } from '../context/AdminContext.jsx'
import { getCurrentStudent } from '../utils/localStudent'
import UserBadge from './UserBadge.jsx'

export default function Layout() {
  const { isAdmin, logout } = useAdmin()
  const student = getCurrentStudent()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div className="min-h-screen bg-base-200">
      <div className="w-full bg-black text-white">
        <div className="container mx-auto px-4 py-3 flex items-center gap-6">
          <Link to="/" className="leading-tight">
            <div className="text-2xl font-extrabold tracking-tight">36-School</div>
            <div className="text-xs opacity-80 -mt-1">Testing system</div>
          </Link>
          <nav className="flex-1">
            <ul className="flex items-center justify-center gap-6 font-medium">
              <li><NavLink to="/" className={({isActive})=>`px-2 py-1 ${isActive?'underline underline-offset-4':''}`}>Home</NavLink></li>
              <li><NavLink to="/tests" className={({isActive})=>`px-2 py-1 ${isActive?'underline underline-offset-4':''}`}>Tests</NavLink></li>
              <li><NavLink to="/about" className={({isActive})=>`px-2 py-1 ${isActive?'underline underline-offset-4':''}`}>About</NavLink></li>
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            {!student && (
              <Link to="/register" className="btn btn-sm bg-white text-black border-0 rounded-none px-4">Register</Link>
            )}
            {!isAdmin && (
              <Link to="/admin" className="btn btn-sm bg-white text-black border-0 rounded-none px-4">Admin</Link>
            )}
            {isAdmin && (
              <button className="btn btn-sm bg-white text-black border-0 rounded-none px-4" onClick={logout}>Logout</button>
            )}
            {student && <UserBadge />}
            <button className="btn btn-ghost btn-sm" onClick={()=>setTheme(theme==='light'?'dark':'light')}>
              {theme==='light' ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-6">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
