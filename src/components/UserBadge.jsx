import { getCurrentStudent } from '../utils/localStudent'

export default function UserBadge() {
  const s = getCurrentStudent()
  if (!s) return null
  const initials = `${(s.firstName||'').charAt(0)}${(s.lastName||'').charAt(0)}`.toUpperCase()
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-200 text-black grid place-items-center font-bold select-none">
        <span>{initials || '?'}</span>
      </div>
      <div className="text-sm leading-tight">
        <div className="font-semibold">{`${s.firstName||''} ${s.lastName||''}`.trim()}</div>
        <div className="opacity-70">{s.classNumber || ''}-{s.classType || ''}</div>
      </div>
    </div>
  )
}
