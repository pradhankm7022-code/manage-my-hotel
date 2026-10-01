import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { call } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { ROOM_STATUSES, STATUS_STYLES } from '../lib/constants'

export default function RoomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isNew = id === 'new'

  const [room, setRoom] = useState(null)
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  // Form state for new room
  const [form, setForm] = useState({ roomNumber: '', floor: '', roomTypeId: '', maxOccupancy: '', currentRate: '', notes: '' })

  useEffect(() => {
    call('roomType.list').then(setRoomTypes).catch(() => {})
    if (!isNew) {
      call('room.get', { roomId: id })
        .then(setRoom)
        .catch(e => { alert(e.message); navigate('/rooms') })
        .finally(() => setLoading(false))
    }
  }, [id])

  async function handleStatusChange(status) {
    setSaving(true)
    try {
      const updated = await call('room.setStatus', { roomId: id, status })
      setRoom(updated)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await call('room.create', {
        ...form,
        floor: Number(form.floor),
        maxOccupancy: Number(form.maxOccupancy),
        currentRate: Number(form.currentRate),
      })
      navigate('/rooms')
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (isNew) return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/rooms')} className="text-gray-400 text-xl">←</button>
        <h2 className="text-xl font-bold text-gray-900">Add Room</h2>
      </div>
      <form onSubmit={handleCreate} className="space-y-4 bg-white rounded-2xl border border-gray-100 p-4">
        {[
          { label: 'Room Number', key: 'roomNumber', type: 'text', placeholder: '101' },
          { label: 'Floor', key: 'floor', type: 'number', placeholder: '1' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
          <select
            value={form.roomTypeId}
            onChange={e => {
              const selected = roomTypes.find(t => t.roomTypeId === e.target.value)
              setForm(p => ({
                ...p,
                roomTypeId: e.target.value,
                maxOccupancy: selected ? String(selected.maxGuests) : p.maxOccupancy,
                currentRate: selected ? String(selected.basePrice) : p.currentRate,
              }))
            }}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type…</option>
            {roomTypes.filter(t => t.active === true || t.active === 'TRUE').map(t => (
              <option key={t.roomTypeId} value={t.roomTypeId}>{t.name}</option>
            ))}
          </select>
        </div>
        {[
          { label: 'Max Occupancy', key: 'maxOccupancy', type: 'number', placeholder: '2' },
          { label: 'Rate per Night (₹)', key: 'currentRate', type: 'number', placeholder: '2500' },
          { label: 'Notes', key: 'notes', type: 'text', placeholder: 'Optional' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              required={f.key !== 'notes'}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Add Room'}
        </button>
      </form>
    </div>
  )

  if (loading) return <p className="text-center text-gray-400 text-sm py-10">Loading…</p>
  if (!room) return null

  const st = STATUS_STYLES[room.status] || STATUS_STYLES.AVAILABLE
  const canChangeStatus = ['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(user?.role)

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/rooms')} className="text-gray-400 text-xl">←</button>
        <h2 className="text-xl font-bold text-gray-900">Room {room.roomNumber}</h2>
      </div>

      {/* Status badge */}
      <div className={`${st.bg} rounded-2xl p-4 mb-4`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-3 h-3 rounded-full ${st.dot}`} />
          <p className={`font-bold text-lg ${st.text}`}>{room.status.replace('_', ' ')}</p>
        </div>
        <p className="text-sm text-gray-600">{room.roomTypeName} · Floor {room.floor}</p>
        <p className="text-sm text-gray-600">Max {room.maxOccupancy} guests · ₹{Number(room.currentRate).toLocaleString('en-IN')}/night</p>
        {room.notes && <p className="text-xs text-gray-400 mt-1">{room.notes}</p>}
      </div>

      {/* Change status */}
      {canChangeStatus && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Change Status</p>
          <div className="grid grid-cols-2 gap-2">
            {ROOM_STATUSES.filter(s => s !== room.status).map(s => {
              const sst = STATUS_STYLES[s]
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={saving}
                  className={`${sst.bg} ${sst.text} rounded-xl py-2.5 text-xs font-medium disabled:opacity-50`}
                >
                  {s.replace('_', ' ')}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
