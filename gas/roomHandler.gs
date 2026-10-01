// roomHandler.gs — API handlers for rooms and room types

const VALID_ROOM_STATUSES = ['AVAILABLE', 'OCCUPIED', 'DIRTY', 'MAINTENANCE', 'OUT_OF_ORDER']

function handleRoomList(token, payload) {
  requireRole(token, ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'])
  const rooms = roomRepo.getAllRooms(payload.includeInactive || false)
  const types = roomRepo.getAllRoomTypes(true)
  const typeMap = {}
  types.forEach(t => { typeMap[t.roomTypeId] = t.name })
  return rooms.map(r => ({ ...r, roomTypeName: typeMap[r.roomTypeId] || '' }))
}

function handleRoomGet(token, payload) {
  requireRole(token, ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'])
  const room = roomRepo.getRoomById(payload.roomId)
  if (!room) throw { code: 404, message: 'Room not found' }
  const type = roomRepo.getRoomTypeById(room.roomTypeId)
  return { ...room, roomTypeName: type ? type.name : '' }
}

function handleRoomCreate(token, payload) {
  const session = requireRole(token, ['ADMIN'])
  const { roomNumber, floor, roomTypeId, maxOccupancy, currentRate, notes } = payload
  if (!roomNumber || !floor || !roomTypeId || !maxOccupancy || !currentRate) {
    throw { code: 400, message: 'roomNumber, floor, roomTypeId, maxOccupancy and currentRate are required' }
  }
  const existing = roomRepo.getAllRooms(true).find(r => r.roomNumber === String(roomNumber))
  if (existing) throw { code: 409, message: 'Room number already exists' }

  const room = {
    roomId: generateId('RM'),
    roomNumber: String(roomNumber),
    floor: Number(floor),
    roomTypeId,
    status: 'AVAILABLE',
    maxOccupancy: Number(maxOccupancy),
    currentRate: Number(currentRate),
    notes: notes || '',
    active: true,
    updatedAt: new Date().toISOString()
  }
  roomRepo.createRoom(room)
  logAction(session.userId, 'ROOM_CREATED', 'Room', room.roomId, null, room)
  return room
}

function handleRoomUpdate(token, payload) {
  const session = requireRole(token, ['ADMIN', 'MANAGER'])
  const { roomId, ...updates } = payload
  if (!roomId) throw { code: 400, message: 'roomId required' }
  const allowed = ['roomNumber', 'floor', 'roomTypeId', 'maxOccupancy', 'currentRate', 'notes', 'active']
  const filtered = {}
  allowed.forEach(k => { if (updates[k] !== undefined) filtered[k] = updates[k] })
  roomRepo.updateRoom(roomId, filtered)
  logAction(session.userId, 'ROOM_UPDATED', 'Room', roomId, null, filtered)
  return roomRepo.getRoomById(roomId)
}

function handleRoomSetStatus(token, payload) {
  const session = requireRole(token, ['ADMIN', 'MANAGER', 'RECEPTIONIST'])
  const { roomId, status } = payload
  if (!roomId || !status) throw { code: 400, message: 'roomId and status required' }
  if (!VALID_ROOM_STATUSES.includes(status)) throw { code: 400, message: 'Invalid status' }
  const room = roomRepo.getRoomById(roomId)
  if (!room) throw { code: 404, message: 'Room not found' }
  roomRepo.setStatus(roomId, status)
  logAction(session.userId, 'ROOM_STATUS_CHANGED', 'Room', roomId, { status: room.status }, { status })
  return roomRepo.getRoomById(roomId)
}

// ── Room Types ──────────────────────────────────────────────────────────────

function handleRoomTypeList(token) {
  requireRole(token, ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'])
  return roomRepo.getAllRoomTypes(true)
}

function handleRoomTypeCreate(token, payload) {
  const session = requireRole(token, ['ADMIN'])
  const { name, description, maxGuests, basePrice, amenities } = payload
  if (!name || !maxGuests || !basePrice) throw { code: 400, message: 'name, maxGuests and basePrice required' }

  const roomType = {
    roomTypeId: generateId('RT'),
    name: name.trim(),
    description: description || '',
    maxGuests: Number(maxGuests),
    basePrice: Number(basePrice),
    amenities: amenities || '',
    active: true,
    createdAt: new Date().toISOString()
  }
  roomRepo.createRoomType(roomType)
  logAction(session.userId, 'ROOMTYPE_CREATED', 'RoomType', roomType.roomTypeId, null, roomType)
  return roomType
}

function handleRoomTypeUpdate(token, payload) {
  const session = requireRole(token, ['ADMIN'])
  const { roomTypeId, ...updates } = payload
  if (!roomTypeId) throw { code: 400, message: 'roomTypeId required' }
  const allowed = ['name', 'description', 'maxGuests', 'basePrice', 'amenities', 'active']
  const filtered = {}
  allowed.forEach(k => { if (updates[k] !== undefined) filtered[k] = updates[k] })
  roomRepo.updateRoomType(roomTypeId, filtered)
  logAction(session.userId, 'ROOMTYPE_UPDATED', 'RoomType', roomTypeId, null, filtered)
  return roomRepo.getRoomTypeById(roomTypeId)
}
