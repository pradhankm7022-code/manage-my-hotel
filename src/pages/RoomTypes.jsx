import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { call } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function RoomTypes() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'

  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', maxGuests: '', basePrice: '', amenities: '' })

  useEffect(() => { fetchTypes() }, [])

  async function fetchTypes() {
    try {
      const data = await call('roomType.list')
      setTypes(data)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setEditTarget(null)
    setForm({ name: '', description: '', maxGuests: '', basePrice: '', amenities: '' })
    setShowForm(true)
  }

  function openEdit(t) {
    setEditTarget(t)
    setForm({ name: t.name, description: t.description, maxGuests: t.maxGuests, basePrice: t.basePrice, amenities: t.amenities })
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editTarget) {
        await call('roomType.update', { roomTypeId: editTarget.roomTypeId, ...form, maxGuests: Number(form.maxGuests), basePrice: Number(form.basePrice) })
      } else {
        await call('roomType.create', { ...form, maxGuests: Number(form.maxGuests), basePrice: Number(form.basePrice) })
      }
      setShowForm(false)
      fetchTypes()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(t) {
    try {
      await call('roomType.update', { roomTypeId: t.roomTypeId, active: !(t.active === true || t.active === 'TRUE') })
      fetchTypes()
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/rooms')} className="text-gray-400 text-xl">←</button>
        <h2 className="text-xl font-bold text-gray-900">Room Types</h2>
        {isAdmin && !showForm && (
          <button onClick={openNew} className="ml-auto bg-blue-600 text-white text-xs px-3 py-1.5 rounded-xl">+ Add</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">{editTarget ? 'Edit Room Type' : 'New Room Type'}</p>
          {[
            { label: 'Name', key: 'name', placeholder: 'Deluxe Double' },
            { label: 'Description', key: 'description', placeholder: 'Spacious room with city view' },
            { label: 'Max Guests', key: 'maxGuests', placeholder: '2' },
            { label: 'Base Price (₹/night)', key: 'basePrice', placeholder: '3500' },
            { label: 'Amenities', key: 'amenities', placeholder: 'WiFi, AC, TV, Hot Water' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
              <input
                type={['maxGuests', 'basePrice'].includes(f.key) ? 'number' : 'text'}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                required={['name', 'maxGuests', 'basePrice'].includes(f.key)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-10">Loading…</p>
      ) : types.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-10">No room types yet</p>
      ) : (
        <div className="space-y-3">
          {types.map(t => {
            const active = t.active === true || t.active === 'TRUE'
            return (
              <div key={t.roomTypeId} className={`bg-white rounded-2xl border border-gray-100 p-4 ${!active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{t.name}</p>
                    {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                    <p className="text-xs text-gray-500 mt-1">Max {t.maxGuests} guests · ₹{Number(t.basePrice).toLocaleString('en-IN')}/night</p>
                    {t.amenities && <p className="text-xs text-gray-400 mt-1">{t.amenities}</p>}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2 ml-2">
                      <button onClick={() => openEdit(t)} className="text-xs text-blue-600">Edit</button>
                      <button onClick={() => toggleActive(t)} className={`text-xs ${active ? 'text-red-400' : 'text-green-500'}`}>
                        {active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
