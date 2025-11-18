export const SUBJECT_OPTIONS = [
  {
    value: 'english',
    label: 'Ingliz tili',
    display: 'English',
    badgeClass: 'bg-green-200 text-green-900',
    badgeStyle: { backgroundColor: '#bbf7d0', color: '#166534' },
  },
  {
    value: 'informatics',
    label: 'Informatika',
    display: 'Informatics',
    badgeClass: 'bg-sky-200 text-sky-900',
    badgeStyle: { backgroundColor: '#bae6fd', color: '#0c4a6e' },
  },
]

export const DEFAULT_SUBJECT = SUBJECT_OPTIONS[0].value

const normalizeValue = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value)
const findSubject = (value) => SUBJECT_OPTIONS.find((option) => option.value === normalizeValue(value))
const defaultSubject = SUBJECT_OPTIONS[0]
const hashHueFromString = (value) => {
  const str = String(value || '')
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 360
}

const buildDynamicBadgeStyle = (value) => {
  if (value == null || value === '') return defaultSubject.badgeStyle
  const hue = hashHueFromString(value)
  return {
    backgroundColor: `hsl(${hue}, 85%, 88%)`,
    color: `hsl(${hue}, 60%, 25%)`,
  }
}

export const getSubjectDisplay = (value) => {
  const subject = findSubject(value)
  if (subject?.display) return subject.display
  if (value == null || value === '') return defaultSubject.display
  return String(value)
}

export const getSubjectBadgeClass = (value) => {
  const subject = findSubject(value)
  if (subject?.badgeClass) return subject.badgeClass
  // For dynamic subjects rely mostly on inline style colors, keep badge minimal
  return 'bg-white text-black'
}

export const getSubjectBadgeStyle = (value) => {
  const subject = findSubject(value)
  if (subject?.badgeStyle) return subject.badgeStyle
  return buildDynamicBadgeStyle(value)
}
