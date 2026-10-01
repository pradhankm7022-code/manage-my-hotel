import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { call } from '../lib/api'
import { STATUS_STYLES } from '../lib/constants'

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => { fetchRooms() }, [])

  async function fetchRooms() {
    try {
      const data = await call('room.list', { includeInactive: false })
      setRooms(data)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  const statuses = ['ALL', 'AVAILABLE', 'OCCUPIED', 'DIRTY', 'MAINTENANCE', 'OUT_OF_ORDER']
  const filtered = filter === 'ALL' ? rooms : rooms.filter(r => r.status === filter)

  const counts = {}
  rooms.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1 })

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Rooms</h2>
        <Link to="/rooms/types" className="text-sm text-blue-600">Room Types</Link>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {['AVAILABLE', 'OCCUPIED', 'DIRTY', 'MAINTENANCE', 'OUT_OF_ORDER'].map(s => {
          const st = STATUS_STYLES[s]
          return (
            <div key={s} className={`${st.bg} rounded-xl p-2 text-center`}>
              <p className={`text-lg font-bold ${st.text}`}>{counts[s] || 0}</p>
              <p className={`text-xs ${st.text} leading-tight`}>{s === 'OUT_OF_ORDER' ? 'OOO' : s.charAt(0) + s.slice(1).toLowerCase()}</p>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-10">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-10">No rooms found</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })).map(room => {
            const st = STATUS_STYLES[room.status] || STATUS_STYLES.AVAILABLE
            return (
              <Link
                key={room.roomId}
                to={`/rooms/${room.roomId}`}
                className={`${st.bg} rounded-xl p-3 flex flex-col gap-1`}
              >
                <p className={`text-xl font-bold ${st.text}`}>{room.roomNumber}</p>
                <p className="text-xs text-gray-500">{room.roomTypeName}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`w-2 h-2 rounded-full ${st.dot}`} />
                  <p className={`text-xs font-medium ${st.text}`}>
                    {room.status.charAt(0) + room.status.slice(1).toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Add room button (Admin only handled in detail page) */}
      <Link
        to="/rooms/new"
        className="fixed bottom-20 right-4 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-2xl"
      >
        +
      </Link>
    </div>
  )
}
