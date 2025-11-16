import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAdmin } from '../context/AdminContext.jsx'
import { getCurrentStudent } from '../utils/localStudent'
import UserBadge from './UserBadge.jsx'

export default function Layout() {
  const { isAdmin, logout } = useAdmin()
  const student = getCurrentStudent()
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <div className="relative min-h-screen bg-base-200 overflow-hidden">
      {/* subtle animated gradient background for all pages */}
      <div className="pointer-events-none absolute -z-10 inset-0">
        <div className="absolute -left-40 top-[-120px] h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-500 via-blue-500 to-sky-300 opacity-20 blur-3xl animate-blob" />
        <div className="absolute right-[-140px] bottom-[-140px] h-96 w-96 rounded-full bg-gradient-to-tr from-pink-400 via-fuchsia-500 to-purple-500 opacity-20 blur-3xl animate-blob" />
      </div>

      <div className="w-full bg-black text-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="leading-tight flex items-center gap-2 shrink-0">
            <div>
              <div className="text-xl font-extrabold tracking-tight">36-School</div>
              <div className="text-[11px] opacity-80 -mt-0.5">Testing system</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex items-center gap-6 font-medium">
              <li><NavLink to="/" className={({isActive})=>`px-2 py-1 ${isActive?'underline underline-offset-4':''}`}>Home</NavLink></li>
              <li><NavLink to="/tests" className={({isActive})=>`px-2 py-1 ${isActive?'underline underline-offset-4':''}`}>Tests</NavLink></li>
              <li><NavLink to="/about" className={({isActive})=>`px-2 py-1 ${isActive?'underline underline-offset-4':''}`}>About</NavLink></li>
            </ul>
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {!student && (
              <Link to="/register" className="btn btn-sm bg-white text-black border-0 rounded-none px-4">Register</Link>
            )}
            {!isAdmin && (
              <Link to="/admin" className="btn btn-sm bg-white text-black border-0 rounded-none px-4">Admin</Link>
            )}
            {isAdmin && (
              <Link to="/admin/dashboard" className="btn btn-sm bg-white text-black border-0 rounded-none px-4">Dashboard</Link>
            )}
            {isAdmin && (
              <button className="btn btn-sm bg-white text-black border-0 rounded-none px-4" onClick={logout}>Logout</button>
            )}
            {student && <UserBadge />}
            <label className="swap swap-rotate">
              {/* this hidden checkbox controls the state */}
              <input
                type="checkbox"
                className="theme-controller"
                value="dark"
                checked={theme==='dark'}
                onChange={()=>setTheme(theme==='light'?'dark':'light')}
              />

              {/* sun icon */}
              <svg
                className="swap-off h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>

              {/* moon icon */}
              <svg
                className="swap-on h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg>
            </label>
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            {student && <UserBadge />}
            <label className="swap swap-rotate">
              <input
                type="checkbox"
                className="theme-controller"
                value="dark"
                checked={theme==='dark'}
                onChange={()=>setTheme(theme==='light'?'dark':'light')}
              />
              <svg
                className="swap-off h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>
              <svg
                className="swap-on h-6 w-6 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24">
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg>
            </label>

            <button
              type="button"
              className="btn btn-sm btn-ghost text-white px-2"
              onClick={() => setNavOpen(o => !o)}
            >
              <span className="sr-only">Toggle navigation</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile dropdown menu */}
      {navOpen && (
        <div className="md:hidden bg-black text-white border-b border-base-300">
          <div className="container mx-auto px-4 pb-3 pt-2 space-y-2 text-sm">
            <div className="flex gap-3">
              <NavLink to="/" className={({isActive})=>`px-2 py-1 ${isActive?'underline underline-offset-4':''}`} onClick={()=>setNavOpen(false)}>Home</NavLink>
              <NavLink to="/tests" className={({isActive})=>`px-2 py-1 ${isActive?'underline underline-offset-4':''}`} onClick={()=>setNavOpen(false)}>Tests</NavLink>
              <NavLink to="/about" className={({isActive})=>`px-2 py-1 ${isActive?'underline underline-offset-4':''}`} onClick={()=>setNavOpen(false)}>About</NavLink>
            </div>
            <div className="flex flex-wrap gap-2">
              {!student && (
                <Link to="/register" className="btn btn-xs bg-white text-black border-0 rounded-none px-3" onClick={()=>setNavOpen(false)}>Register</Link>
              )}
              {!isAdmin && (
                <Link to="/admin" className="btn btn-xs bg-white text-black border-0 rounded-none px-3" onClick={()=>setNavOpen(false)}>Admin</Link>
              )}
              {isAdmin && (
                <Link to="/admin/dashboard" className="btn btn-xs bg-white text-black border-0 rounded-none px-3" onClick={()=>setNavOpen(false)}>Dashboard</Link>
              )}
              {isAdmin && (
                <button className="btn btn-xs bg-white text-black border-0 rounded-none px-3" onClick={()=>{ setNavOpen(false); logout() }}>Logout</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-6">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
