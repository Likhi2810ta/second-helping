import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import Spinner from './components/Spinner'
import Home from './pages/Home'

// Only the landing page is loaded up front. Every other screen is downloaded
// the first time someone visits it, which keeps the home page fast.
const Post = lazy(() => import('./pages/Post'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const History = lazy(() => import('./pages/History'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Register = lazy(() => import('./pages/Register'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const MyListings = lazy(() => import('./pages/MyListings'))
const Find = lazy(() => import('./pages/Find'))
const ListingDetail = lazy(() => import('./pages/ListingDetail'))
const Pickups = lazy(() => import('./pages/Pickups'))
const AdminVerify = lazy(() => import('./pages/admin/AdminVerify'))
const AdminListings = lazy(() => import('./pages/admin/AdminListings'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports'))

export default function App() {
  const { pathname } = useLocation()
  return (
    <ErrorBoundary resetKey={pathname}>
      <ScrollToTop />
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

              <Route element={<ProtectedRoute roles={['donor', 'receiver']} />}>
                <Route path="/history" element={<History />} />
              </Route>

              <Route element={<ProtectedRoute roles={['donor']} />}>
                <Route path="/post" element={<Post />} />
                <Route path="/my-listings" element={<MyListings />} />
              </Route>

              <Route element={<ProtectedRoute roles={['receiver']} />}>
                <Route path="/find" element={<Find />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/pickups" element={<Pickups />} />
              </Route>

              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route path="/admin/verify" element={<AdminVerify />} />
                <Route path="/admin/listings" element={<AdminListings />} />
                <Route path="/admin/reports" element={<AdminReports />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
