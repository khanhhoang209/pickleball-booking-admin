import React, { useEffect } from 'react'
import { Toaster } from 'sonner'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router'
import { AuthProvider } from '~/contexts/AuthContext'
import { setNavigate } from '~/config/axios'
import LoginPage from '~/pages/auth/LoginPage'
import ProtectedRoute from '~/components/auth/ProtectedRoute'
import NotFound from '~/pages/error/NotFound'
import Dashboard from '~/pages/manage/Daskboard'
import FieldsPage from '~/pages/manage/FieldsPage'
import FieldDetailPage from '~/pages/manage/FieldDetailPage'
import CreateFieldPage from '~/pages/manage/CreateFieldPage'
import EditFieldPage from '~/pages/manage/EditFieldPage'
import PricingsPage from '~/pages/manage/PricingsPage'
import CreatePricingPage from '~/pages/manage/CreatePricingPage'
import EditPricingPage from '~/pages/manage/EditPricingPage'

const AppRoutes: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    setNavigate(navigate)
  }, [navigate])

  return (
    <Routes>
      {/* Public routes */}
      <Route path='/login' element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path='/'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Fields Management */}
      <Route
        path='/fields'
        element={
          <ProtectedRoute>
            <FieldsPage />
          </ProtectedRoute>
        }
      />

      {/* Create Field */}
      <Route
        path='/fields/create'
        element={
          <ProtectedRoute>
            <CreateFieldPage />
          </ProtectedRoute>
        }
      />

      {/* Field Detail */}
      <Route
        path='/fields/:id'
        element={
          <ProtectedRoute>
            <FieldDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Edit Field */}
      <Route
        path='/fields/:id/edit'
        element={
          <ProtectedRoute>
            <EditFieldPage />
          </ProtectedRoute>
        }
      />

      {/* Pricings Management */}
      <Route
        path='/pricings'
        element={
          <ProtectedRoute>
            <PricingsPage />
          </ProtectedRoute>
        }
      />

      {/* Create Pricing */}
      <Route
        path='/pricings/create'
        element={
          <ProtectedRoute>
            <CreatePricingPage />
          </ProtectedRoute>
        }
      />

      {/* Edit Pricing */}
      <Route
        path='/pricings/:id/edit'
        element={
          <ProtectedRoute>
            <EditPricingPage />
          </ProtectedRoute>
        }
      />

      {/* Placeholder routes for sidebar navigation */}
      <Route
        path='/users'
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 page */}
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
        <Toaster position='top-right' richColors closeButton duration={4000} />
      </BrowserRouter>
    </>
  )
}

export default App
