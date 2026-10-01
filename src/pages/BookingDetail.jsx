import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { call } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { BOOKING_STATUS_STYLES } from '../lib/constants'

export default function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    call('booking.get', { bookingId: id })
      .then(setBooking)
      .catch(e => { alert(e.message); navigate('/bookings') })
      .finally(() => setLoading(false))
  }, [id])

  async function doAction(action) {
    if (!confirm(`Confirm: ${action.replace('booking.', '').toUpperCase()}?`)) return
    setActing(true)
    try {
      const updated = await call(action, { bookingId: id })
      setBooking(updated)
    } catch (e) {
      alert(e.message)
    } finally {
      setActing(false)
    }
  }

  function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  function nights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0
    return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
  }

  if (loading) return <p className="text-center text-gray-400 text-sm py-10">Loading…</p>
  if (!booking) return null

  const st = BOOKING_STATUS_STYLES[booking.status] || BOOKING_STATUS_STYLES.CONFIRMED
  const canAct = ['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(user?.role)
  const n = nights(booking.checkIn, booking.checkOut)

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/bookings')} className="text-gray-400 text-xl">←</button>
        <h2 className="text-xl font-bold text-gray-900">Booking</h2>
        <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
          {booking.status.replace('_', ' ')}
        </span>
      </div>

      {/* Guest */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
        <p className="text-xs text-gray-400 mb-1">Guest</p>
        <p className="font-semibold text-gray-800">{booking.guestName}</p>
        <p className="text-sm text-gray-500">{booking.guestPhone}</p>
      </div>

      {/* Stay */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 space-y-2">
        <p className="text-xs text-gray-400 mb-1">Stay</p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Room</span>
          <span className="font-medium text-gray-800">{booking.roomNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Check-in</span>
          <span className="font-medium text-gray-800">{formatDate(booking.checkIn)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Check-out</span>
          <span className="font-medium text-gray-800">{formatDate(booking.checkOut)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Duration</span>
          <span className="font-medium text-gray-800">{n} night{n !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Guests</span>
          <span className="font-medium text-gray-800">
            {booking.adults} adult{booking.adults > 1 ? 's' : ''}
            {booking.children > 0 ? `, ${booking.children} child${booking.children > 1 ? 'ren' : ''}` : ''}
          </span>
        </div>
        {booking.notes ? (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Notes</span>
            <span className="font-medium text-gray-800 text-right max-w-48">{booking.notes}</span>
          </div>
        ) : null}
      </div>

      {/* Amount */}
      <div className="bg-blue-50 rounded-2xl p-4 mb-4 flex items-center justify-between">
        <p className="text-sm text-blue-700">Total Amount</p>
        <p className="text-lg font-bold text-blue-700">₹{Number(booking.totalAmount).toLocaleString('en-IN')}</p>
      </div>

      {/* Actions */}
      {canAct && (
        <div className="space-y-2">
          {booking.status === 'CONFIRMED' && (
            <>
              <button
                onClick={() => doAction('booking.checkIn')} disabled={acting}
                className="w-full bg-green-600 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
              >
                Check In
              </button>
              <button
                onClick={() => doAction('booking.cancel')} disabled={acting}
                className="w-full bg-red-50 text-red-600 rounded-xl py-3 text-sm font-medium disabled:opacity-50"
              >
                Cancel Booking
              </button>
            </>
          )}
          {booking.status === 'CHECKED_IN' && (
            <>
              <button
                onClick={() => doAction('booking.checkOut')} disabled={acting}
                className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
              >
                Check Out
              </button>
              <button
                onClick={() => doAction('booking.cancel')} disabled={acting}
                className="w-full bg-red-50 text-red-600 rounded-xl py-3 text-sm font-medium disabled:opacity-50"
              >
                Cancel Booking
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
