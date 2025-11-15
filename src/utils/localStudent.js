const KEY = 'current_student'

export function setCurrentStudent(student) {
  localStorage.setItem(KEY, JSON.stringify(student))
}

export function getCurrentStudent() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearCurrentStudent() {
  localStorage.removeItem(KEY)
}
