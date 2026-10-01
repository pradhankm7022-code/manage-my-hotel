import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { call } from '../lib/api'

export default function BookingNew() {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    guestName: '', guestPhone: '', roomId: '',
    checkIn: '', checkOut: '', adults: '1', children: '0', notes: ''
  })

  useEffect(() => {
    call('room.list', { includeInactive: false })
      .then(data => setRooms(data.filter(r => r.status === 'AVAILABLE')))
      .catch(e => alert(e.message))
  }, [])

  const selectedRoom = rooms.find(r => r.roomId === form.roomId)
  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24)))
    : 0
  const total = selectedRoom && nights > 0 ? nights * Number(selectedRoom.currentRate) : 0

  function set(key, val) {
    setForm(p => ({ ...p, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (nights <= 0) return alert('Check-out must be after check-in')
    setSaving(true)
    try {
      const booking = await call('booking.create', {
        ...form,
        adults: Number(form.adults),
        children: Number(form.children),
      })
      navigate(`/bookings/${booking.bookingId}`)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/bookings')} className="text-gray-400 text-xl">←</button>
        <h2 className="text-xl font-bold text-gray-900">New Booking</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Guest info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Guest</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
            <input
              type="text" value={form.guestName} placeholder="Rahul Sharma"
              onChange={e => set('guestName', e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
            <input
              type="tel" value={form.guestPhone} placeholder="9876543210"
              onChange={e => set('guestPhone', e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Room + dates */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Room &amp; Dates</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Room</label>
            <select
              value={form.roomId} onChange={e => set('roomId', e.target.value)} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select available room…</option>
              {rooms.map(r => (
                <option key={r.roomId} value={r.roomId}>
                  Room {r.roomNumber} — {r.roomTypeName} · ₹{Number(r.currentRate).toLocaleString('en-IN')}/night
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Check-in</label>
              <input
                type="date" value={form.checkIn} min={today}
                onChange={e => set('checkIn', e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Check-out</label>
              <input
                type="date" value={form.checkOut} min={form.checkIn || today}
                onChange={e => set('checkOut', e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Adults</label>
              <input
                type="number" value={form.adults} min="1"
                onChange={e => set('adults', e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Children</label>
              <input
                type="number" value={form.children} min="0"
                onChange={e => set('children', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
            <input
              type="text" value={form.notes} placeholder="Early check-in, extra pillow…"
              onChange={e => set('notes', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Total */}
        {total > 0 && (
          <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-sm text-blue-700">{nights} night{nights > 1 ? 's' : ''}</p>
            <p className="text-lg font-bold text-blue-700">₹{total.toLocaleString('en-IN')}</p>
          </div>
        )}

        <button
          type="submit" disabled={saving}
          className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  )
}
