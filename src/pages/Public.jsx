import { useState, useEffect } from 'react'
import { publicCall } from '../lib/api'

const STEPS = { SEARCH: 'SEARCH', RESULTS: 'RESULTS', FORM: 'FORM', CONFIRMED: 'CONFIRMED' }

export default function Public() {
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  const [step, setStep] = useState(STEPS.SEARCH)
  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(tomorrow)
  const [rooms, setRooms] = useState([])
  const [selected, setSelected] = useState(null)
  const [searching, setSearching] = useState(false)
  const [booking, setBooking] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ guestName: '', guestPhone: '', adults: '1', children: '0', notes: '' })

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSearch(e) {
    e.preventDefault()
    setSearching(true)
    try {
      const data = await publicCall('public.checkAvailability', { checkIn, checkOut })
      setRooms(data)
      setStep(STEPS.RESULTS)
    } catch (err) {
      alert(err.message)
    } finally {
      setSearching(false)
    }
  }

  function selectRoom(room) {
    setSelected(room)
    setStep(STEPS.FORM)
  }

  async function handleBook(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const result = await publicCall('public.book', {
        ...form,
        roomId: selected.roomId,
        checkIn,
        checkOut,
        adults: Number(form.adults),
        children: Number(form.children),
      })
      setBooking(result)
      setStep(STEPS.CONFIRMED)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">The Paradise</h1>
        <p className="text-sm text-gray-500 mt-0.5">Experience comfort like home</p>
      </div>

      <div className="max-w-lg mx-auto p-4">

        {/* ── STEP 1: Search ── */}
        {step === STEPS.SEARCH && (
          <>
            {/* Hero */}
            <div className="bg-blue-600 rounded-2xl p-6 mb-6 text-white text-center">
              <p className="text-lg font-semibold mb-1">Book Your Stay</p>
              <p className="text-sm text-blue-200">Select your dates to check availability</p>
            </div>

            <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Check-in</label>
                  <input
                    type="date" value={checkIn} min={today}
                    onChange={e => setCheckIn(e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Check-out</label>
                  <input
                    type="date" value={checkOut} min={checkIn || today}
                    onChange={e => setCheckOut(e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                type="submit" disabled={searching}
                className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
              >
                {searching ? 'Checking…' : 'Check Availability'}
              </button>
            </form>

            {/* Room types showcase */}
            <RoomShowcase />
          </>
        )}

        {/* ── STEP 2: Results ── */}
        {step === STEPS.RESULTS && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setStep(STEPS.SEARCH)} className="text-gray-400 text-xl">←</button>
              <div>
                <p className="font-semibold text-gray-800">Available Rooms</p>
                <p className="text-xs text-gray-400">{formatDate(checkIn)} → {formatDate(checkOut)}</p>
              </div>
            </div>

            {rooms.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500 text-sm mb-3">No rooms available for these dates.</p>
                <button onClick={() => setStep(STEPS.SEARCH)} className="text-blue-600 text-sm font-medium">
                  Try different dates
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map(r => (
                  <div key={r.roomId} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">{r.name}</p>
                        {r.description && <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">Up to {r.maxGuests} guests</p>
                        {r.amenities && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {r.amenities.split(',').map(a => (
                              <span key={a} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{a.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 text-right flex-shrink-0">
                        <p className="font-bold text-gray-900">₹{Number(r.currentRate).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-400">/night</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          ₹{Number(r.totalAmount).toLocaleString('en-IN')} total
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => selectRoom(r)}
                      className="w-full mt-2 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium"
                    >
                      Book This Room
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── STEP 3: Guest form ── */}
        {step === STEPS.FORM && selected && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setStep(STEPS.RESULTS)} className="text-gray-400 text-xl">←</button>
              <p className="font-semibold text-gray-800">Your Details</p>
            </div>

            {/* Selected room summary */}
            <div className="bg-blue-50 rounded-2xl p-4 mb-4">
              <p className="text-sm font-semibold text-blue-800">{selected.name}</p>
              <p className="text-xs text-blue-600 mt-0.5">{formatDate(checkIn)} → {formatDate(checkOut)} · {selected.nights} night{selected.nights !== 1 ? 's' : ''}</p>
              <p className="text-base font-bold text-blue-800 mt-1">₹{Number(selected.totalAmount).toLocaleString('en-IN')}</p>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text" value={form.guestName} placeholder="Rahul Sharma"
                    onChange={e => set('guestName', e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
                  <input
                    type="tel" value={form.guestPhone} placeholder="9876543210"
                    onChange={e => set('guestPhone', e.target.value)} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Adults</label>
                    <input
                      type="number" value={form.adults} min="1" max={selected.maxGuests}
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
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Special Requests (optional)</label>
                  <input
                    type="text" value={form.notes} placeholder="Early check-in, extra pillow…"
                    onChange={e => set('notes', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={saving}
                className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Confirming…' : 'Confirm Booking'}
              </button>
            </form>
          </>
        )}

        {/* ── STEP 4: Confirmed ── */}
        {step === STEPS.CONFIRMED && booking && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Booking Confirmed!</h2>
            <p className="text-sm text-gray-500 mb-6">We'll see you soon, {booking.guestName.split(' ')[0]}.</p>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Booking ID</span>
                <span className="font-medium text-gray-800">{booking.bookingId}</span>
              </div>
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
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">₹{Number(booking.totalAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => { setStep(STEPS.SEARCH); setForm({ guestName: '', guestPhone: '', adults: '1', children: '0', notes: '' }) }}
              className="text-blue-600 text-sm font-medium"
            >
              Make another booking
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

function RoomShowcase() {
  const [types, setTypes] = useState(null)

  useEffect(() => {
    publicCall('public.roomTypes')
      .then(setTypes)
      .catch(() => {})
  }, [])

  if (!types || types.length === 0) return null

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Our Rooms</p>
      <div className="space-y-3">
        {types.map(t => (
          <div key={t.roomTypeId} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{t.name}</p>
                {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                <p className="text-xs text-gray-400 mt-1">Up to {t.maxGuests} guests</p>
                {t.amenities && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.amenities.split(',').map(a => (
                      <span key={a} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{a.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="ml-4 text-right flex-shrink-0">
                <p className="font-bold text-gray-900">₹{Number(t.basePrice).toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400">/night</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
