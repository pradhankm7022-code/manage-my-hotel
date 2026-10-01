import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-gray-900 text-base">The Paradise</Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">{user?.name} · {user?.role}</span>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600">Sign out</button>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10">
        {[
          { to: '/',            label: 'Dashboard' },
          { to: '/rooms',       label: 'Rooms'     },
          { to: '/bookings',    label: 'Bookings'  },
          { to: '/housekeeping',label: 'Cleaning'  },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="flex-1 py-3 text-xs text-center text-gray-500 hover:text-blue-600 font-medium"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Page content */}
      <div className="pb-20">
        {children}
      </div>
    </div>
  )
}
