import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">The Paradise</h1>
            <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
          Dashboard — coming in Sprint 6
        </div>
      </div>
    </div>
  )
}
