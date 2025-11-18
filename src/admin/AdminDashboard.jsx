import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ResultsTable from './ResultsTable.jsx'
import { createTest, getTests, deleteTest, updateTest, createBrainBucksCard, getBrainBucksCards, deleteBrainBucksCard, updateBrainBucksCard, createTeacher, getTeachers, updateTeacher, deleteTeacher, createSubject, getSubjects } from '../utils/firestore'
import { SUBJECT_OPTIONS, DEFAULT_SUBJECT, getSubjectDisplay, getSubjectBadgeClass, getSubjectBadgeStyle } from '../constants/subjects'
import { useAdmin } from '../context/AdminContext.jsx'
import { clearCurrentStudent } from '../utils/localStudent'

const emptyQuestion = () => ({ q: '', options: ['', '', '', ''], correct: '', score: 2 })
const normalizeQuestion = (q = {}) => ({
  q: q.q || '',
  options: Array.from({ length: 4 }, (_, idx) => q.options?.[idx] || ''),
  correct: q.correct || '',
  score: typeof q.score === 'number' ? q.score : 2,
})

const buildSubjectOptionsWithCurrent = (baseOptions, extraSubjects, current) => {
  const base = baseOptions.map(opt => ({ value: opt.value, label: opt.label }))
  const extra = (extraSubjects || []).map(s => ({ value: s.name, label: s.name }))
  const merged = [...base, ...extra]
  if (current && !merged.some(opt => opt.value === current)) {
    return [...merged, { value: current, label: current }]
  }
  return merged
}

export default function AdminDashboard() {
  const { role, teacher, logout } = useAdmin()
  const navigate = useNavigate()
  const [tab, setTab] = useState('results')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState(DEFAULT_SUBJECT)
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [tests, setTests] = useState([])
  const [testsLoading, setTestsLoading] = useState(false)
  const [editingTestId, setEditingTestId] = useState(null)
  const [bbValue, setBbValue] = useState(100)
  const [bbQuestion, setBbQuestion] = useState('')
  const [bbAnswer, setBbAnswer] = useState('')
  const [bbSaving, setBbSaving] = useState(false)
  const [bbMessage, setBbMessage] = useState('')
  const [bbCards, setBbCards] = useState([])
  const [bbEditingId, setBbEditingId] = useState(null)
  const [tFirstName, setTFirstName] = useState('')
  const [tLastName, setTLastName] = useState('')
  const [tSubject, setTSubject] = useState(DEFAULT_SUBJECT)
  const [tLogin, setTLogin] = useState('')
  const [tPassword, setTPassword] = useState('')
  const [tSaving, setTSaving] = useState(false)
  const [tMessage, setTMessage] = useState('')
  const [teachers, setTeachers] = useState([])
  const [teachersLoading, setTeachersLoading] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [eFirstName, setEFirstName] = useState('')
  const [eLastName, setELastName] = useState('')
  const [eSubject, setESubject] = useState(DEFAULT_SUBJECT)
  const [eMaxTests, setEMaxTests] = useState('')
  const [eSaving, setESaving] = useState(false)
  const [eMessage, setEMessage] = useState('')
  const [extraSubjects, setExtraSubjects] = useState([])
  const [newSubjectName, setNewSubjectName] = useState('')
  const [sSaving, setSSaving] = useState(false)
  const [sMessage, setSMessage] = useState('')
  const [superTab, setSuperTab] = useState('teachers') // 'teachers' | 'tests' | 'subjects'

  useEffect(() => {
    if (role === 'teacher' && teacher?.subject) {
      setSubject(teacher.subject)
    }
  }, [role, teacher])

  const isTeacher = role === 'teacher' && !!teacher?.subject
  const isLegacyEnglishTeacher = isTeacher && !teacher.id && teacher.login === 'Gulnoza'
  const visibleTests = isTeacher
    ? tests.filter(t => {
        if (isLegacyEnglishTeacher) {
          // Legacy tests without subject + all English tests
          return !t.subject || t.subject === teacher.subject
        }
        return t.subject === teacher.subject
      })
    : tests

  const teacherKey = isTeacher ? (teacher.id || (teacher.login ? `legacy-${teacher.login}` : null)) : null
  const teacherTestsCount = isTeacher && teacherKey
    ? tests.filter(t => t.teacherKey === teacherKey).length
    : 0
  const maxTests = isTeacher && typeof teacher?.maxTests === 'number' ? teacher.maxTests : null
  const reachedLimit = isTeacher && maxTests != null && teacherTestsCount >= maxTests
  const reachedLimitForNew = reachedLimit && !editingTestId

  const subjectOptionsForTest = buildSubjectOptionsWithCurrent(SUBJECT_OPTIONS, extraSubjects, subject)
  const subjectOptionsForNewTeacher = buildSubjectOptionsWithCurrent(SUBJECT_OPTIONS, extraSubjects, tSubject)
  const subjectOptionsForEditTeacher = buildSubjectOptionsWithCurrent(SUBJECT_OPTIONS, extraSubjects, eSubject)

  const loadTests = async () => {
    setTestsLoading(true)
    const data = await getTests()
    setTests(data)
    setTestsLoading(false)
  }

  const handleEditBrainBucks = (card) => {
    setBbValue(card.value)
    setBbQuestion(card.question || '')
    setBbAnswer(card.answer || '')
    setBbEditingId(card.id)
    setTab('brainbucks')
  }

  const handleDeleteBrainBucks = async (id) => {
    if (!confirm('Ushbu Brain Bucks savoli o\'chirilsinmi?')) return
    await deleteBrainBucksCard(id)
    setBbCards(cards => cards.filter(c => c.id !== id))
  }

  const loadBrainBucks = async () => {
    const data = await getBrainBucksCards()
    setBbCards(data)
  }

  const loadSubjects = async () => {
    try {
      const data = await getSubjects()
      setExtraSubjects(data || [])
    } catch {
      // ignore subject loading errors
    }
  }

  const loadTeachers = async () => {
    setTeachersLoading(true)
    const data = await getTeachers()
    setTeachers(data)
    setTeachersLoading(false)
  }

  useEffect(() => {
    loadTests()
    loadBrainBucks()
    loadSubjects()
    // ensure student session cleared when entering admin panel
    clearCurrentStudent()
  }, [])

  useEffect(() => {
    if (role === 'super') {
      loadTeachers()
    }
  }, [role])

  const setQuestionField = (idx, field, value) => {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, [field]: value } : q))
  }
  const setOption = (qIdx, optIdx, value) => {
    setQuestions(qs => qs.map((q, i) => i === qIdx ? { ...q, options: q.options.map((o, j) => j === optIdx ? value : o) } : q))
  }
  const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion()])
  const removeQuestion = (idx) => setQuestions(qs => qs.filter((_, i) => i !== idx))

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setSubject(DEFAULT_SUBJECT)
    setQuestions([emptyQuestion()])
    setEditingTestId(null)
  }

  const handleEditTest = (test) => {
    setTitle(test.title || '')
    setDescription(test.description || '')
    setSubject(test.subject || DEFAULT_SUBJECT)
    const qs = (test.questions?.length ? test.questions : [emptyQuestion()]).map(q => normalizeQuestion(q))
    setQuestions(qs.length ? qs : [emptyQuestion()])
    setEditingTestId(test.id)
    setMessage('')
    setTab('create')
  }

  const handleCancelEdit = () => {
    resetForm()
    setMessage('Tahrirlash bekor qilindi')
  }

  const handleSaveTest = async (e) => {
    e.preventDefault()
    if (reachedLimitForNew) return
    setSaving(true)
    setMessage('')
    try {
      const cleaned = questions.map(q => ({ ...q, options: q.options.filter(Boolean) }))
      const payload = { title: title.trim(), description: description.trim(), subject, questions: cleaned }
      if (isTeacher && teacherKey) {
        payload.teacherKey = teacherKey
      }
      if (editingTestId) {
        await updateTest(editingTestId, payload)
        setMessage('Test updated successfully')
      } else {
        await createTest(payload)
        setMessage('Test saved successfully')
      }
      resetForm()
      await loadTests()
      setTab('results')
    } catch (e2) {
      setMessage(e2.message || 'Failed to save test')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTest = async (id) => {
    if (!confirm('Ushbu test o\'chirilsinmi?')) return
    await deleteTest(id)
    setTests(ts => ts.filter(t => t.id !== id))
  }

  const handleSaveBrainBucks = async (e) => {
    e.preventDefault()
    if (!bbQuestion.trim()) return
    setBbSaving(true)
    setBbMessage('')
    try {
      const payload = { value: bbValue, question: bbQuestion.trim(), answer: bbAnswer.trim() }
      if (bbEditingId) {
        await updateBrainBucksCard(bbEditingId, payload)
      } else {
        await createBrainBucksCard(payload)
      }
      setBbQuestion('')
      setBbAnswer('')
      setBbEditingId(null)
      setBbMessage('Card saved')
      await loadBrainBucks()
    } catch (e2) {
      setBbMessage(e2.message || 'Failed to save card')
    } finally {
      setBbSaving(false)
    }
  }

  const handleCreateTeacher = async (e) => {
    e.preventDefault()
    setTSaving(true)
    setTMessage('')
    try {
      const payload = {
        firstName: tFirstName.trim(),
        lastName: tLastName.trim(),
        subject: tSubject,
        login: tLogin.trim(),
        password: tPassword,
      }
      await createTeacher(payload)
      setTMessage('O00qituvchi saqlandi')
      setTFirstName('')
      setTLastName('')
      setTSubject(DEFAULT_SUBJECT)
      setTLogin('')
      setTPassword('')
      navigate('/')
    } catch (e2) {
      setTMessage(e2.message || 'Failed to save teacher')
    } finally {
      setTSaving(false)
    }
  }

  const handleCreateSubject = async (e) => {
    e.preventDefault()
    const name = newSubjectName.trim()
    if (!name) return

    const existsStatic = SUBJECT_OPTIONS.some(opt =>
      opt.label.toLowerCase() === name.toLowerCase() || opt.value.toLowerCase() === name.toLowerCase()
    )
    const existsExtra = (extraSubjects || []).some(s => (s.name || '').toLowerCase() === name.toLowerCase())
    if (existsStatic || existsExtra) {
      setSMessage('Bu fan allaqachon mavjud')
      return
    }

    setSSaving(true)
    setSMessage('')
    try {
      const id = await createSubject({ name })
      const created = { id, name }
      setExtraSubjects(list => [...(list || []), created])
      setNewSubjectName('')
      setSMessage("Fan qo'shildi")
    } catch (e2) {
      setSMessage(e2.message || "Fan qo'shishdagi xatolik")
    } finally {
      setSSaving(false)
    }
  }

  const startEditTeacher = (t) => {
    setEditingTeacher(t)
    setEFirstName(t.firstName || '')
    setELastName(t.lastName || '')
    setESubject(t.subject || DEFAULT_SUBJECT)
    const max = t.maxTests
    if (typeof max === 'number') {
      setEMaxTests(String(max))
    } else if (max != null) {
      setEMaxTests(String(max))
    } else {
      setEMaxTests('')
    }
    setEMessage('')
    setEditModalOpen(true)
  }

  const handleUpdateTeacher = async (e) => {
    e.preventDefault()
    if (!editingTeacher) return
    setESaving(true)
    setEMessage('')
    try {
      const trimmedMax = eMaxTests.trim()
      let maxVal = null
      if (trimmedMax !== '') {
        const parsed = Number(trimmedMax)
        if (Number.isNaN(parsed) || parsed < 0) {
          setEMessage("Max testlar soni 0 yoki undan katta raqam bo'lishi kerak")
          setESaving(false)
          return
        }
        maxVal = parsed
      }
      const payload = {
        firstName: eFirstName.trim(),
        lastName: eLastName.trim(),
        subject: eSubject,
        maxTests: maxVal,
      }
      await updateTeacher(editingTeacher.id, payload)
      setTeachers(list => list.map(t => t.id === editingTeacher.id ? { ...t, ...payload } : t))
      setEMessage("O'qituvchi yangilandi")
    } catch (e2) {
      setEMessage(e2.message || "O'qituvchini yangilashda xatolik")
    } finally {
      setESaving(false)
    }
  }

  const handleCloseEditTeacher = () => {
    setEditModalOpen(false)
    setEditingTeacher(null)
  }

  const handleDeleteTeacher = async () => {
    if (!editingTeacher || !editingTeacher.id) return
    if (!confirm("Bu o'qituvchi akkauntini o'chirmoqchimisiz?")) return
    try {
      await deleteTeacher(editingTeacher.id)
      setTeachers(list => list.filter(t => t.id !== editingTeacher.id))
      setEditModalOpen(false)
      setEditingTeacher(null)
    } catch (e2) {
      setEMessage(e2.message || "O'qituvchini o'chirishda xatolik")
    }
  }

  return (
    <div className="space-y-6">
      {role !== 'super' && (
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      )}

      {role === 'super' && (
        <div className="border-2 border-black bg-white md:grid md:grid-cols-[220px,1fr] min-h-screen">
          <aside className="border-b md:border-b-0 md:border-r border-black bg-black text-white flex flex-col">
            <div className="px-4 py-4 border-b border-white/10">
              <div className="text-lg font-extrabold tracking-tight">36-School</div>
              <div className="text-[11px] opacity-80 mt-1">Super admin</div>
            </div>
            <nav className="flex-1 py-2 text-sm">
              <button
                type="button"
                className={`w-full text-left px-4 py-2 border-b border-white/10 ${superTab==='teachers' ? 'bg-white text-black font-semibold' : 'bg-black text-white hover:bg-white/10'}`}
                onClick={() => setSuperTab('teachers')}
              >
                O'qituvchilar
              </button>
              <button
                type="button"
                className={`w-full text-left px-4 py-2 border-b border-white/10 ${superTab==='tests' ? 'bg-white text-black font-semibold' : 'bg-black text-white hover:bg-white/10'}`}
                onClick={() => setSuperTab('tests')}
              >
                Testlar
              </button>
              <button
                type="button"
                className={`w-full text-left px-4 py-2 border-b border-white/10 ${superTab==='subjects' ? 'bg-white text-black font-semibold' : 'bg-black text-white hover:bg-white/10'}`}
                onClick={() => setSuperTab('subjects')}
              >
                Fanlar
              </button>
            </nav>
            <div className="px-4 py-3 border-t border-white/10">
              <button
                type="button"
                className="w-full px-3 py-2 text-xs font-semibold border border-white bg-white text-black hover:bg-black hover:text-white rounded-none"
                onClick={() => { logout(); navigate('/') }}
              >
                Logout
              </button>
            </div>
          </aside>

          <div className="p-4 space-y-4">
            {superTab === 'teachers' && (
              <>
                <div className="border-2 border-black bg-white p-4 space-y-4">
                  <h2 className="text-lg font-bold">O'qituvchi qo'shish</h2>
                  {tMessage && <div className="alert alert-info text-sm">{tMessage}</div>}
                  <form onSubmit={handleCreateTeacher} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input className="w-full border-2 border-black px-3 py-2" placeholder="Ism" value={tFirstName} onChange={e=>setTFirstName(e.target.value)} required />
                      <input className="w-full border-2 border-black px-3 py-2" placeholder="Familya" value={tLastName} onChange={e=>setTLastName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-sm font-semibold">Fan</label>
                      <select
                        className="mt-2 w-full border-2 border-black px-3 py-2 bg-white text-sm"
                        value={tSubject}
                        onChange={e => setTSubject(e.target.value)}
                      >
                        {subjectOptionsForNewTeacher.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input className="w-full border-2 border-black px-3 py-2" placeholder="Login" value={tLogin} onChange={e=>setTLogin(e.target.value)} required />
                      <input type="password" className="w-full border-2 border-black px-3 py-2" placeholder="Parol" value={tPassword} onChange={e=>setTPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="inline-block bg-black text-white px-6 py-2 rounded-none" disabled={tSaving}>
                      {tSaving ? 'Saqlanmoqda...' : "O'qituvchi qo'shish"}
                    </button>
                  </form>
                </div>

                <div className="border-2 border-black bg-white mt-4">
                  <div className="px-4 py-3 border-b border-black/10 text-[11px] uppercase tracking-wide text-gray-500">
                    O'qituvchilar ro'yxati
                  </div>
                  {teachersLoading ? (
                    <div className="px-4 py-4 text-sm">Yuklanmoqda...</div>
                  ) : teachers.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-gray-500">Hozircha o'qituvchi yo'q</div>
                  ) : (
                    <div className="divide-y divide-black/10">
                      {teachers.map((t, idx) => {
                        const initials = `${(t.firstName || '').charAt(0)}${(t.lastName || '').charAt(0)}`.trim().toUpperCase() || '?' 
                        const fullName = `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.login
                        return (
                          <div
                            key={t.id || t.login || idx}
                            className="flex items-center gap-4 px-4 py-3"
                          >
                            <div className="w-10 text-xl font-semibold text-gray-300 tabular-nums">
                              {String(idx + 1).padStart(2, '0')}
                            </div>
                            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                              {initials || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">{fullName}</div>
                              <div className="text-[11px] uppercase tracking-wide text-gray-500">{getSubjectDisplay(t.subject)}</div>
                            </div>
                            <button
                              type="button"
                              className="px-3 py-1 text-[11px] font-semibold border border-black bg-white hover:bg-black hover:text-white transition-colors"
                              onClick={() => startEditTeacher(t)}
                            >
                              Edit
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {editingTeacher && editModalOpen && (
                  <div className="modal modal-open">
                    <div className="modal-box max-w-lg border-2 border-black rounded-none">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold">
                          O'qituvchi profili: {`${editingTeacher.firstName || ''} ${editingTeacher.lastName || ''}`.trim() || editingTeacher.login}
                        </h3>
                        <button
                          type="button"
                          className="btn btn-xs btn-ghost"
                          onClick={handleCloseEditTeacher}
                        >
                          ✕
                        </button>
                      </div>
                      {eMessage && <div className="alert alert-info text-xs mb-2">{eMessage}</div>}
                      <form onSubmit={handleUpdateTeacher} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            className="w-full border-2 border-black px-3 py-2"
                            placeholder="Ism"
                            value={eFirstName}
                            onChange={e => setEFirstName(e.target.value)}
                            required
                          />
                          <input
                            className="w-full border-2 border-black px-3 py-2"
                            placeholder="Familya"
                            value={eLastName}
                            onChange={e => setELastName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold">Fan</label>
                          <select
                            className="mt-1 w-full border-2 border-black px-3 py-2 text-xs bg-white"
                            value={eSubject}
                            onChange={e => setESubject(e.target.value)}
                          >
                            {subjectOptionsForEditTeacher.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold">Max testlar soni (bo'sh = cheklov yo'q)</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full border-2 border-black px-3 py-2"
                            value={eMaxTests}
                            onChange={e => setEMaxTests(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3 pt-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-error rounded-none"
                            onClick={handleDeleteTeacher}
                          >
                            Delete account
                          </button>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm rounded-none"
                              onClick={handleCloseEditTeacher}
                            >
                              Bekor qilish
                            </button>
                            <button
                              type="submit"
                              className="btn btn-sm bg-black text-white border-black rounded-none"
                              disabled={eSaving}
                            >
                              {eSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div className="modal-backdrop bg-black/40" onClick={handleCloseEditTeacher} />
                  </div>
                )}
              </>
            )}

            {superTab === 'tests' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Barcha testlar</h2>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs font-semibold border border-black bg-white hover:bg-black hover:text-white rounded-none"
                    onClick={loadTests}
                    disabled={testsLoading}
                  >
                    {testsLoading ? 'Yuklanmoqda...' : 'Yangilash'}
                  </button>
                </div>
                {testsLoading ? (
                  <div className="text-sm">Yuklanmoqda...</div>
                ) : tests.length === 0 ? (
                  <div className="text-sm text-gray-600">Hozircha test yo'q</div>
                ) : (
                  <div className="space-y-3">
                    {tests.map(t => (
                      <div key={t.id} className="flex items-center justify-between border-2 border-black bg-white px-4 py-3">
                        <div className="min-w-0 space-y-1">
                          <div
                            className={`text-[10px] font-semibold uppercase tracking-wide inline-flex px-2 py-1 rounded ${getSubjectBadgeClass(t.subject)}`}
                            style={getSubjectBadgeStyle(t.subject)}
                          >
                            {getSubjectDisplay(t.subject)}
                          </div>
                          <div className="font-semibold break-words">{t.title}</div>
                          <div className="text-xs opacity-70">{(t.questions||[]).reduce((s,q)=>s + (typeof q.score==='number'? q.score:2),0)} score</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn btn-sm rounded-none" onClick={() => handleEditTest(t)}>Edit</button>
                          <button className="btn btn-error btn-sm rounded-none" onClick={() => handleDeleteTest(t.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {editingTestId && (
                  <div className="mt-2 border-2 border-black bg-white p-4">
                    <h3 className="text-sm font-semibold mb-2">Testni tahrirlash</h3>
                    <form onSubmit={handleSaveTest} className="space-y-4">
                      {message && <div className="alert alert-info text-sm">{message}</div>}
                      <div>
                        <label className="text-sm font-semibold">Fan</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {SUBJECT_OPTIONS.map(opt => (
                            <button
                              type="button"
                              key={opt.value}
                              className={`px-4 py-2 border-2 border-black text-sm font-semibold ${subject===opt.value ? 'bg-black text-white' : 'bg-white'}`}
                              onClick={() => setSubject(opt.value)}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        className="w-full border-2 border-black px-3 py-2"
                        placeholder="Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                      />
                      <textarea
                        className="w-full border-2 border-black px-3 py-2"
                        placeholder="Description"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
                        {questions.map((q, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute inset-0 translate-x-2 translate-y-2 border border-black pointer-events-none" />
                            <div className="relative border-2 border-black bg-white p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-sm">Question {idx + 1}</h4>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => removeQuestion(idx)}
                                  disabled={questions.length === 1}
                                >
                                  Remove
                                </button>
                              </div>
                              <input
                                className="w-full border-2 border-black px-3 py-2"
                                placeholder="Question text"
                                value={q.q}
                                onChange={e => setQuestionField(idx, 'q', e.target.value)}
                                required
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {q.options.map((opt, j) => (
                                  <input
                                    key={j}
                                    className="w-full border-2 border-black px-3 py-2"
                                    placeholder={`Option ${j+1}`}
                                    value={opt}
                                    onChange={e => setOption(idx, j, e.target.value)}
                                    required
                                  />
                                ))}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-sm">Correct answer</label>
                                  <select
                                    className="border-2 border-black px-3 py-2 w-40"
                                    value={q.correct}
                                    onChange={e => setQuestionField(idx, 'correct', e.target.value)}
                                    required
                                  >
                                    <option value="" disabled>Select correct</option>
                                    {q.options.filter(Boolean).map((opt, j) => (
                                      <option value={opt} key={j}>{opt}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-sm">Score</label>
                                  <select
                                    className="border-2 border-black px-3 py-2 w-24"
                                    value={q.score ?? 2}
                                    onChange={e => setQuestionField(idx, 'score', Number(e.target.value))}
                                  >
                                    {[1,2,3,4,5].map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                  <div className="text-xs opacity-70">Default 2 ball</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="inline-block bg-black text-white px-6 py-2 rounded-none"
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Test'}
                        </button>
                        {editingTestId && (
                          <button
                            type="button"
                            className="btn"
                            onClick={handleCancelEdit}
                          >
                            Bekor qilish
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {superTab === 'subjects' && (
              <div className="border-2 border-black bg-white p-4 space-y-3">
                <div className="text-sm font-semibold">Fan qo'shish</div>
                {sMessage && <div className="text-xs">{sMessage}</div>}
                <form onSubmit={handleCreateSubject} className="flex flex-col md:flex-row gap-2">
                  <input
                    className="flex-1 border-2 border-black px-3 py-2 text-sm"
                    placeholder="Yangi fan nomi (masalan: Matematika)"
                    value={newSubjectName}
                    onChange={e => setNewSubjectName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="inline-block bg-black text-white px-4 py-2 text-sm rounded-none"
                    disabled={sSaving}
                  >
                    {sSaving ? 'Saqlanmoqda...' : "Qo'shish"}
                  </button>
                </form>
                {extraSubjects && extraSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-[11px] mt-1">
                    {extraSubjects.map(s => (
                      <span key={s.id} className="px-2 py-1 border border-black bg-white">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {role !== 'super' && (
        <div role="tablist" className="tabs tabs-lifted">
        <input type="radio" name="tabs" role="tab" className="tab" aria-label="Create Test" checked={tab==='create'} onChange={()=>setTab('create')} />
        <div role="tabpanel" className="tab-content bg-base-100 p-4 rounded-box">
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-bold">Existing Tests</h2>
            {testsLoading ? (
              <div className="loading loading-spinner" />
            ) : visibleTests.length === 0 ? (
              <div className="text-sm opacity-70">Hozircha test yo'q</div>
            ) : (
              <div className="space-y-3">
                {visibleTests.map(t => (
                  <div key={t.id} className="flex items-center justify-between border-2 border-black bg-white px-4 py-3">
                    <div className="min-w-0 space-y-1">
                      <div
                        className={`text-[10px] font-semibold uppercase tracking-wide inline-flex px-2 py-1 rounded ${getSubjectBadgeClass(t.subject)}`}
                        style={getSubjectBadgeStyle(t.subject)}
                      >
                        {getSubjectDisplay(t.subject)}
                      </div>
                      <div className="font-semibold break-words">{t.title}</div>
                      <div className="text-xs opacity-70">{(t.questions||[]).reduce((s,q)=>s + (typeof q.score==='number'? q.score:2),0)} score</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-sm rounded-none" onClick={() => handleEditTest(t)}>Edit</button>
                      <button className="btn btn-error btn-sm rounded-none" onClick={() => handleDeleteTest(t.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {!reachedLimitForNew && (
          <form onSubmit={handleSaveTest} className="space-y-5">
            {message && <div className="alert alert-info text-sm">{message}</div>}
            {editingTestId && (
              <div className="alert alert-warning text-sm flex flex-wrap items-center gap-2">
                <span>Hozirda mavjud testni tahrirlayapsiz</span>
                <button type="button" className="btn btn-xs" onClick={handleCancelEdit}>
                  Bekor qilish
                </button>
              </div>
            )}
            {!isTeacher && (
              <div>
                <label className="text-sm font-semibold">Fan</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SUBJECT_OPTIONS.map(opt => (
                    <button
                      type="button"
                      key={opt.value}
                      className={`px-4 py-2 border-2 border-black text-sm font-semibold ${subject===opt.value ? 'bg-black text-white' : 'bg-white'}`}
                      onClick={() => setSubject(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <input className="w-full border-2 border-black px-3 py-2" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
            <textarea className="w-full border-2 border-black px-3 py-2" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
            <div className="space-y-8">
              {questions.map((q, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute inset-0 translate-x-2 translate-y-2 border border-black pointer-events-none" />
                  <div className="relative border-2 border-black bg-white p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">Question {idx + 1}</h3>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={()=>removeQuestion(idx)} disabled={questions.length===1}>Remove</button>
                    </div>
                    <input className="w-full border-2 border-black px-3 py-2" placeholder="Question text" value={q.q} onChange={(e)=>setQuestionField(idx,'q',e.target.value)} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, j) => (
                        <input key={j} className="w-full border-2 border-black px-3 py-2" placeholder={`Option ${j+1}`} value={opt} onChange={(e)=>setOption(idx, j, e.target.value)} required />
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm">Correct answer</label>
                        <select className="border-2 border-black px-3 py-2 w-40" value={q.correct} onChange={(e)=>setQuestionField(idx,'correct', e.target.value)} required>
                          <option value="" disabled>Select correct</option>
                          {q.options.filter(Boolean).map((opt, j) => (
                            <option value={opt} key={j}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm">Score</label>
                        <select className="border-2 border-black px-3 py-2 w-24" value={q.score ?? 2} onChange={(e)=>setQuestionField(idx,'score', Number(e.target.value))}>
                          {[1,2,3,4,5].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="text-xs opacity-70">Default 2 ball</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="inline-block bg-black text-white px-6 py-2 rounded-none" onClick={addQuestion}>Add Question</button>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="inline-block bg-black text-white px-6 py-2 rounded-none" disabled={saving}>{saving ? 'Saving...' : 'Save Test'}</button>
              {editingTestId && (
                <button type="button" className="btn" onClick={handleCancelEdit}>
                  Bekor qilish
                </button>
              )}
            </div>
          </form>
          )}
        </div>

        <input type="radio" name="tabs" role="tab" className="tab" aria-label="Brain Bucks" checked={tab==='brainbucks'} onChange={()=>setTab('brainbucks')} />
        <div role="tabpanel" className="tab-content bg-base-100 p-4 rounded-box">
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Brain Bucks questions</h2>
            <form onSubmit={handleSaveBrainBucks} className="space-y-4">
              {bbMessage && <div className="alert alert-info text-sm">{bbMessage}</div>}
              <div className="flex flex-wrap gap-2">
                {[100,200,300,400,500].map(v => (
                  <button
                    key={v}
                    type="button"
                    className={`px-4 py-2 border-2 border-black text-sm font-bold ${bbValue===v ? 'bg-black text-white' : 'bg-white'}`}
                    onClick={() => setBbValue(v)}
                  >
                    {v}$
                  </button>
                ))}
              </div>
              <textarea
                className="w-full border-2 border-black px-3 py-2 min-h-[80px]"
                placeholder="Question here"
                value={bbQuestion}
                onChange={e => setBbQuestion(e.target.value)}
                required
              />
              <textarea
                className="w-full border-2 border-black px-3 py-2 min-h-[60px]"
                placeholder="Answer here (faqat o'qituvchi uchun)"
                value={bbAnswer}
                onChange={e => setBbAnswer(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-block bg-black text-white px-6 py-2 rounded-none"
                  disabled={bbSaving}
                >
                  {bbSaving ? 'Saving...' : (bbEditingId ? 'Update' : 'Apply')}
                </button>
              </div>
            </form>

            {bbCards.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Existing cards</h3>
                <div className="max-h-56 overflow-auto border border-base-300 divide-y divide-base-200">
                  {bbCards.map(c => (
                    <div key={c.id} className="px-3 py-2 text-sm flex items-center gap-2">
                      <span className="font-bold whitespace-nowrap">{c.value}$</span>
                      <span className="truncate flex-1">{c.question}</span>
                      <button
                        type="button"
                        className="btn btn-xs rounded-none"
                        onClick={() => handleEditBrainBucks(c)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-xs btn-error rounded-none"
                        onClick={() => handleDeleteBrainBucks(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <input type="radio" name="tabs" role="tab" className="tab" aria-label="Results" checked={tab==='results'} onChange={()=>setTab('results')} />
        <div role="tabpanel" className="tab-content bg-base-100 p-4 rounded-box">
          <ResultsTable />
        </div>
      </div>
      )}
    </div>
  )
}
