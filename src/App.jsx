import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import NotFound from './pages/NotFound.jsx'
import Register from './pages/Register.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminRoute from './utils/AdminRoute.jsx'

import StudentTestsList from './student/TestsList.jsx'
import TestSolve from './student/TestSolve.jsx'
import ResultView from './student/ResultView.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>        
        <Route path="/" element={<Navigate to="/tests" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tests" element={<StudentTestsList />} />
        <Route path="/test/:id" element={<TestSolve />} />
        <Route path="/result/:id" element={<ResultView />} />

        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
