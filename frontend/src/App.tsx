import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Spinner from './components/Spinner'
import Home from './pages/Home'

// Only the landing page is loaded up front. Every other screen is downloaded
// the first time someone visits it, which keeps the home page fast.
const Post = lazy(() => import('./pages/Post'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Register = lazy(() => import('./pages/Register'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
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
            <Route path="/post" element={<Post />} />
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
    </Suspense>
  )
}