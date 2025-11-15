import { Navigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext.jsx'

export default function AdminRoute({ children }) {
  const { isAdmin } = useAdmin()
  if (!isAdmin) return <Navigate to="/admin" replace />
  return children
}
