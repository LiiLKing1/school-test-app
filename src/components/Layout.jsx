import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAdmin } from '../context/AdminContext.jsx'
import { getCurrentStudent } from '../utils/localStudent'

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
      <div className="navbar bg-base-100 shadow">
        <div className="container mx-auto">
          <div className="flex-1">
            <Link to="/tests" className="btn btn-ghost text-xl">School Testing System</Link>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li><NavLink to="/tests">Tests</NavLink></li>
              <li><NavLink to="/register">Register</NavLink></li>
              <li>
                <button className="btn btn-ghost" onClick={()=>setTheme(theme==='light'?'dark':'light')}>
                  {theme==='light' ? 'Dark' : 'Light'}
                </button>
              </li>
              {isAdmin ? (
                <>
                  <li><NavLink to="/admin/dashboard">Dashboard</NavLink></li>
                  <li><button className="btn btn-ghost" onClick={logout}>Logout</button></li>
                </>
              ) : (
                <li><NavLink to="/admin">Admin</NavLink></li>
              )}
              {student && (
                <li className="px-2 opacity-70">{`${student.firstName ?? ''} ${student.lastName ?? ''}`.trim()} ({student.classNumber ?? ''}-{student.classType ?? ''})</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4">
        <div className="mx-auto max-w-3xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
