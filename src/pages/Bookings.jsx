import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { call } from '../lib/api'
import { BOOKING_STATUS_STYLES } from '../lib/constants'

const TABS = [
  { key: 'TODAY', label: 'Today' },
  { key: 'ALL',   label: 'All'   },
  { key: 'CONFIRMED',   label: 'Confirmed'   },
  { key: 'CHECKED_IN',  label: 'In-house'    },
  { key: 'CHECKED_OUT', label: 'Checked Out' },
]

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('TODAY')

  useEffect(() => { fetchBookings() }, [tab])

  async function fetchBookings() {
    setLoading(true)
    try {
      const isDateFilter = tab === 'TODAY'
      const data = await call('booking.list', {
        status: isDateFilter ? 'ALL' : tab,
        date: isDateFilter ? 'TODAY' : undefined,
      })
      setBookings(data)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              tab === t.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-10">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-10">No bookings found</p>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => {
            const st = BOOKING_STATUS_STYLES[b.status] || BOOKING_STATUS_STYLES.CONFIRMED
            return (
              <Link
                key={b.bookingId}
                to={`/bookings/${b.bookingId}`}
                className="block bg-white rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{b.guestName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Room {b.roomNumber} · {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {b.adults} adult{b.adults > 1 ? 's' : ''}{b.children > 0 ? ` · ${b.children} child${b.children > 1 ? 'ren' : ''}` : ''} · ₹{Number(b.totalAmount).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className={`ml-3 mt-0.5 text-xs font-medium px-2 py-1 rounded-full ${st.bg} ${st.text} whitespace-nowrap`}>
                    {b.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <Link
        to="/bookings/new"
        className="fixed bottom-20 right-4 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-2xl"
      >
        +
      </Link>
    </div>
  )
}
