import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AdminContext = createContext(null)
const USERNAME = 'Gulnoza'
const PASSWORD = 'test-app-admin'

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('isAdmin')
    setIsAdmin(saved === 'true')
  }, [])

  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false')
  }, [isAdmin])

  const login = (username, password) => {
    if (username === USERNAME && password === PASSWORD) {
      setIsAdmin(true)
      return true
    }
    return false
  }

  const logout = () => setIsAdmin(false)

  const value = useMemo(() => ({ isAdmin, login, logout }), [isAdmin])

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  return useContext(AdminContext)
}
