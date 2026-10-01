// roomRepo.gs — All Sheets access for Rooms and RoomTypes

const roomRepo = {

  // ── Rooms ──────────────────────────────────────────────

  getAllRooms(includeInactive = false) {
    const rows = batchRead('Rooms')
    return includeInactive ? rows : rows.filter(r => r.active === true || r.active === 'TRUE')
  },

  getRoomById(roomId) {
    return findRow('Rooms', 'roomId', roomId)
  },

  getRoomsByType(roomTypeId) {
    return findRows('Rooms', r =>
      r.roomTypeId === roomTypeId &&
      (r.active === true || r.active === 'TRUE')
    )
  },

  createRoom(data) {
    batchWrite('Rooms', [data])
    return data
  },

  updateRoom(roomId, updates) {
    updates.updatedAt = new Date().toISOString()
    return updateRow('Rooms', 'roomId', roomId, updates)
  },

  setStatus(roomId, status) {
    return updateRow('Rooms', 'roomId', roomId, {
      status,
      updatedAt: new Date().toISOString()
    })
  },

  // ── Room Types ─────────────────────────────────────────

  getAllRoomTypes(includeInactive = false) {
    const rows = batchRead('RoomTypes')
    return includeInactive ? rows : rows.filter(r => r.active === true || r.active === 'TRUE')
  },

  getRoomTypeById(roomTypeId) {
    return findRow('RoomTypes', 'roomTypeId', roomTypeId)
  },

  createRoomType(data) {
    batchWrite('RoomTypes', [data])
    return data
  },

  updateRoomType(roomTypeId, updates) {
    return updateRow('RoomTypes', 'roomTypeId', roomTypeId, updates)
  }
}
