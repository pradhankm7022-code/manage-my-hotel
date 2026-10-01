import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { call } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { BOOKING_STATUS_STYLES } from '../lib/constants'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    call('dashboard.summary')
      .then(setStats)
      .catch(e => alert(e.message))
      .finally(() => setLoading(false))
  }, [])

  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">The Paradise</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
        </div>
        <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-10">Loading…</p>
      ) : !stats ? null : (
        <>
          {/* Today's activity */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-green-50 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{stats.checkInsToday}</p>
              <p className="text-xs text-green-600 mt-0.5">Arrivals</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.inHouse}</p>
              <p className="text-xs text-blue-600 mt-0.5">In-house</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-700">{stats.checkOutsToday}</p>
              <p className="text-xs text-gray-500 mt-0.5">Departures</p>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">₹{Number(stats.revenueToday).toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Occupancy</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">
                {stats.totalRooms > 0 ? Math.round((stats.rooms.OCCUPIED / stats.totalRooms) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Room status grid */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[
              { key: 'AVAILABLE',    label: 'Avail',  bg: 'bg-green-100',  text: 'text-green-700'  },
              { key: 'OCCUPIED',     label: 'Occup',  bg: 'bg-blue-100',   text: 'text-blue-700'   },
              { key: 'DIRTY',        label: 'Dirty',  bg: 'bg-yellow-100', text: 'text-yellow-700' },
              { key: 'MAINTENANCE',  label: 'Maint',  bg: 'bg-orange-100', text: 'text-orange-700' },
              { key: 'OUT_OF_ORDER', label: 'OOO',    bg: 'bg-red-100',    text: 'text-red-700'    },
            ].map(s => (
              <div key={s.key} className={`${s.bg} rounded-xl p-2 text-center`}>
                <p className={`text-lg font-bold ${s.text}`}>{stats.rooms[s.key] || 0}</p>
                <p className={`text-xs ${s.text} leading-tight`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Recent bookings */}
          {stats.recent.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Recent Bookings</p>
                <Link to="/bookings" className="text-xs text-blue-600">View all</Link>
              </div>
              <div className="space-y-3">
                {stats.recent.map(b => {
                  const st = BOOKING_STATUS_STYLES[b.status] || BOOKING_STATUS_STYLES.CONFIRMED
                  return (
                    <Link key={b.bookingId} to={`/bookings/${b.bookingId}`} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{b.guestName}</p>
                        <p className="text-xs text-gray-400">Room {b.roomNumber} · {formatDate(b.checkIn)} → {formatDate(b.checkOut)}</p>
                      </div>
                      <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${st.bg} ${st.text} whitespace-nowrap`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
