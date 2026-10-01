import { useEffect, useState } from 'react'
import { call } from '../lib/api'

export default function Housekeeping() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [cleaning, setCleaning] = useState({})

  useEffect(() => { fetchDirty() }, [])

  async function fetchDirty() {
    setLoading(true)
    try {
      const data = await call('room.list', { includeInactive: false })
      setRooms(data.filter(r => r.status === 'DIRTY').sort((a, b) =>
        String(a.roomNumber).localeCompare(String(b.roomNumber), undefined, { numeric: true })
      ))
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function markClean(room) {
    setCleaning(p => ({ ...p, [room.roomId]: true }))
    try {
      await call('room.setStatus', { roomId: room.roomId, status: 'AVAILABLE' })
      setRooms(p => p.filter(r => r.roomId !== room.roomId))
    } catch (e) {
      alert(e.message)
    } finally {
      setCleaning(p => ({ ...p, [room.roomId]: false }))
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Housekeeping</h2>
        <span className="text-xs text-gray-400">{rooms.length} room{rooms.length !== 1 ? 's' : ''} to clean</span>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-10">Loading…</p>
      ) : rooms.length === 0 ? (
        <div className="bg-green-50 rounded-2xl p-8 text-center">
          <p className="text-2xl mb-2">✓</p>
          <p className="text-green-700 font-medium text-sm">All rooms are clean</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map(room => (
            <div key={room.roomId} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Room {room.roomNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">Floor {room.floor} · {room.roomTypeName}</p>
              </div>
              <button
                onClick={() => markClean(room)}
                disabled={cleaning[room.roomId]}
                className="bg-green-600 text-white text-xs px-4 py-2 rounded-xl font-medium disabled:opacity-50"
              >
                {cleaning[room.roomId] ? 'Saving…' : 'Mark Clean'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
