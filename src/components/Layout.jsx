import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/',             label: 'Dashboard' },
  { to: '/rooms',        label: 'Rooms'     },
  { to: '/bookings',     label: 'Bookings'  },
  { to: '/housekeeping', label: 'Cleaning'  },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function isActive(to) {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-gray-900 text-base">The Paradise</Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">{user?.name} · {user?.role}</span>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600">Sign out</button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10">
        {NAV.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex-1 py-3 text-xs text-center font-medium transition-colors ${
              isActive(item.to) ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="pb-20">
        {children}
      </div>
    </div>
  )
}
