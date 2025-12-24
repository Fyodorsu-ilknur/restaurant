import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

// allowedRoles: Bu sayfaya kimler girebilir? (Örn: ['ADMIN', 'KITCHEN'])
const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation()
  const userRole = localStorage.getItem('userRole') // Giriş yapmış rolü al

  // 1. Hiç giriş yapılmamışsa Login sayfasına at
  if (!userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 2. Giriş yapılmış ama yetkisi yetmiyorsa (Örn: Mutfakçı -> Admin Paneline girmeye çalışırsa)
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Admin ise her yere girebilsin mantığı ekleyebiliriz veya direkt reddederiz
    if (userRole === 'ADMIN') {
        return children;
    }
    return <Navigate to="/" replace />
  }

  // Sorun yoksa sayfayı göster
  return children
}

export default ProtectedRoute