import React from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '~/contexts/AuthContext'
import type { ProtectedRouteProps } from '~/types/components'

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-lg'>Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to='/login' replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
