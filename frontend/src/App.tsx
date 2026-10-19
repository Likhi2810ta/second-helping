import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ComingSoon from './pages/ComingSoon'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Onboarding from './pages/Onboarding'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Logged in, organisation not required yet */}
      <Route element={<ProtectedRoute requireOrg={false} />}>
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      {/* Logged in and organisation set up */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<ComingSoon title="History" />} />

          <Route element={<ProtectedRoute roles={['donor']} />}>
            <Route path="/post" element={<ComingSoon title="Post food" />} />
            <Route path="/my-listings" element={<ComingSoon title="My listings" />} />
          </Route>

          <Route element={<ProtectedRoute roles={['receiver']} />}>
            <Route path="/find" element={<ComingSoon title="Find food" />} />
            <Route path="/listing/:id" element={<ComingSoon title="Listing detail" />} />
            <Route path="/pickups" element={<ComingSoon title="My pickups" />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin/verify" element={<ComingSoon title="Verify organisations" />} />
            <Route path="/admin/listings" element={<ComingSoon title="All listings" />} />
            <Route path="/admin/reports" element={<ComingSoon title="Reports" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}