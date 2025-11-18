import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext.jsx'
import { SUBJECT_OPTIONS, getSubjectDisplay, getSubjectBadgeClass, getSubjectBadgeStyle } from '../constants/subjects'
import { updateTeacher, getSubjects } from '../utils/firestore'

export default function TeacherProfile() {
  const { role, teacher, setTeacher, logout } = useAdmin()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(teacher?.firstName || '')
  const [lastName, setLastName] = useState(teacher?.lastName || '')
  const [subject, setSubject] = useState(teacher?.subject || SUBJECT_OPTIONS[0].value)
  const [login, setLogin] = useState(teacher?.login || '')
  const [password, setPassword] = useState(teacher?.password || '')
  const [photoUrl, setPhotoUrl] = useState(teacher?.photoUrl || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [extraSubjects, setExtraSubjects] = useState([])

  useEffect(() => {
    if (role !== 'teacher' || !teacher) {
      navigate('/admin/dashboard', { replace: true })
      return
    }

    const loadSubjects = async () => {
      try {
        const data = await getSubjects()
        setExtraSubjects(data || [])
      } catch {
        // ignore subject loading errors
      }
    }

    loadSubjects()
  }, [role, teacher, navigate])

  if (!teacher) return null

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!teacher.id) return
    setSaving(true)
    setMessage('')
    try {
      const payload = {
        ...teacher,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        subject,
        login: login.trim(),
        password,
        photoUrl: photoUrl.trim() || null,
      }
      await updateTeacher(teacher.id, payload)
      setTeacher(payload)
      setMessage("Ma'lumotlar saqlandi")
    } catch (e2) {
      setMessage(e2.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const initials = `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase()

  const subjectOptions = (() => {
    const base = SUBJECT_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))
    const extra = (extraSubjects || []).map(s => ({ value: s.name, label: s.name }))
    const merged = [...base, ...extra]
    if (subject && !merged.some(opt => opt.value === subject)) {
      return [...merged, { value: subject, label: subject }]
    }
    return merged
  })()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Teacher profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-[260px,1fr] gap-6 items-start">
        <div className="border-2 border-black bg-white p-4 space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-white to-gray-200 grid place-items-center font-bold text-2xl">
            {photoUrl ? (
              <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{initials || '?'}</span>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="font-semibold break-words">{firstName} {lastName}</div>
            <div
              className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase rounded ${getSubjectBadgeClass(subject)}`}
              style={getSubjectBadgeStyle(subject)}
            >
              {getSubjectDisplay(subject)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="border-2 border-black bg-white p-5 space-y-4">
          {message && <div className="alert alert-info text-sm">{message}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="w-full border-2 border-black px-3 py-2" placeholder="Ism" value={firstName} onChange={e=>setFirstName(e.target.value)} required />
            <input className="w-full border-2 border-black px-3 py-2" placeholder="Familya" value={lastName} onChange={e=>setLastName(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-semibold">Fan</label>
            <select
              className="mt-2 w-full border-2 border-black px-3 py-2 bg-white text-sm"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            >
              {subjectOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="w-full border-2 border-black px-3 py-2" placeholder="Login" value={login} onChange={e=>setLogin(e.target.value)} required />
            <input type="password" className="w-full border-2 border-black px-3 py-2" placeholder="Parol" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-semibold">Rasm URL</label>
            <input className="w-full border-2 border-black px-3 py-2" placeholder="https://..." value={photoUrl} onChange={e=>setPhotoUrl(e.target.value)} />
          </div>
          <button type="submit" className="inline-block bg-black text-white px-6 py-2 rounded-none" disabled={saving}>
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </form>
      </div>

      <div className="max-w-md border-2 border-black bg-white p-4 space-y-3">
        {!logoutConfirm ? (
          <>
            <div className="text-sm">Akkauntdan chiqmoqchimisiz?</div>
            <button
              type="button"
              className="inline-block bg-black text-white px-4 py-2 rounded-none text-sm"
              onClick={() => setLogoutConfirm(true)}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <div className="text-sm">Rostan ham akkauntdan chiqmoqchimisiz?</div>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-block bg-black text-white px-4 py-2 rounded-none text-sm"
                onClick={handleLogout}
              >
                Ha, chiqish
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setLogoutConfirm(false)}
              >
                Yo'q, qolish
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
