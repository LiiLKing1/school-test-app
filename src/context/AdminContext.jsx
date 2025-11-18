import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getTeacherByCredentials } from '../utils/firestore'

const AdminContext = createContext(null)

// Hardcoded super-admin that can create teachers
const SUPER_LOGIN = 'superadmin'
const SUPER_PASSWORD = 'superadmin36'

// Legacy built-in English teacher account
const LEGACY_EN_TEACHER_LOGIN = 'Gulnoza'
const LEGACY_EN_TEACHER_PASSWORD = 'gulnoza409'

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [role, setRole] = useState(null) // 'super' | 'teacher' | null
  const [teacher, setTeacher] = useState(null) // teacher document when role === 'teacher'

  useEffect(() => {
    // Backwards compatibility: old flag + new structured state
    const savedState = localStorage.getItem('adminState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        if (parsed && typeof parsed === 'object') {
          setIsAdmin(!!parsed.isAdmin)
          setRole(parsed.role || null)
          setTeacher(parsed.teacher || null)
          return
        }
      } catch {
        // ignore and fall back to simple flag
      }
    }
    const simple = localStorage.getItem('isAdmin')
    setIsAdmin(simple === 'true')
  }, [])

  useEffect(() => {
    const state = { isAdmin, role, teacher }
    localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false')
    localStorage.setItem('adminState', JSON.stringify(state))
  }, [isAdmin, role, teacher])

  const login = async (username, password) => {
    // Super-admin (hardcoded)
    if (username === SUPER_LOGIN && password === SUPER_PASSWORD) {
      setIsAdmin(true)
      setRole('super')
      setTeacher(null)
      return 'super'
    }

    // Built-in English teacher (does not live in Firestore)
    if (username === LEGACY_EN_TEACHER_LOGIN && password === LEGACY_EN_TEACHER_PASSWORD) {
      const legacyTeacher = {
        id: null,
        firstName: 'Gulnoza',
        lastName: '',
        subject: 'english',
        login: LEGACY_EN_TEACHER_LOGIN,
        password: LEGACY_EN_TEACHER_PASSWORD,
      }
      setIsAdmin(true)
      setRole('teacher')
      setTeacher(legacyTeacher)
      return 'teacher'
    }

    // Teacher login via Firestore
    const found = await getTeacherByCredentials(username, password)
    if (found) {
      setIsAdmin(true)
      setRole('teacher')
      setTeacher(found)
      return 'teacher'
    }

    setIsAdmin(false)
    setRole(null)
    setTeacher(null)
    return null
  }

  const logout = () => {
    setIsAdmin(false)
    setRole(null)
    setTeacher(null)
  }

  const value = useMemo(
    () => ({ isAdmin, role, teacher, login, logout, setTeacher }),
    [isAdmin, role, teacher]
  )

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  return useContext(AdminContext)
}
