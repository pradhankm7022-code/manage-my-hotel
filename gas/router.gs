// router.gs — Main entry point for the Apps Script web app

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    const { action, token, payload = {} } = body

    const result = route(action, token, payload)
    return jsonResponse({ success: true, result })
  } catch (err) {
    const code = err.code || 500
    const message = err.message || 'Internal server error'
    return jsonResponse({ success: false, error: true, code, message })
  }
}

function doGet(e) {
  return jsonResponse({ success: true, result: 'The Paradise API is running.' })
}

function route(action, token, payload) {
  switch (action) {
    // Auth
    case 'auth.login':  return handleLogin(payload)
    case 'auth.logout': return handleLogout(token)
    case 'auth.me':     return handleMe(token)

    // Rooms
    case 'room.list':      return handleRoomList(token, payload)
    case 'room.get':       return handleRoomGet(token, payload)
    case 'room.create':    return handleRoomCreate(token, payload)
    case 'room.update':    return handleRoomUpdate(token, payload)
    case 'room.setStatus': return handleRoomSetStatus(token, payload)

    // Room Types
    case 'roomType.list':   return handleRoomTypeList(token)
    case 'roomType.create': return handleRoomTypeCreate(token, payload)
    case 'roomType.update': return handleRoomTypeUpdate(token, payload)

    // Bookings
    case 'booking.list':     return handleBookingList(token, payload)
    case 'booking.get':      return handleBookingGet(token, payload)
    case 'booking.create':   return handleBookingCreate(token, payload)
    case 'booking.checkIn':  return handleBookingCheckIn(token, payload)
    case 'booking.checkOut': return handleBookingCheckOut(token, payload)
    case 'booking.cancel':   return handleBookingCancel(token, payload)

    // Settings (stub — Sprint 9)
    case 'settings.getAll':  return handleSettingsGetAll(token)
    case 'settings.update':  return handleSettingsUpdate(token, payload)

    // User management (stub — Sprint 9)
    case 'user.list':         return handleUserList(token)
    case 'user.create':       return handleUserCreate(token, payload)
    case 'user.update':       return handleUserUpdate(token, payload)
    case 'user.resetPassword': return handleUserResetPassword(token, payload)

    default:
      throw { code: 404, message: 'Unknown action: ' + action }
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

// Settings handlers (minimal for Sprint 1)
function handleSettingsGetAll(token) {
  requireRole(token, ['ADMIN'])
  return settingsRepo.getAll()
}

function handleSettingsUpdate(token, payload) {
  const session = requireRole(token, ['ADMIN'])
  const { key, value } = payload
  if (!key) throw { code: 400, message: 'Key required' }
  settingsRepo.update(key, value)
  logAction(session.userId, 'SETTINGS_CHANGED', 'Settings', key, null, value)
  return { success: true }
}

// User handlers (minimal for Sprint 1)
function handleUserList(token) {
  requireRole(token, ['ADMIN'])
  return batchRead('Users').map(u => ({
    userId: u.userId, name: u.name, email: u.email, role: u.role, active: u.active, createdAt: u.createdAt
  }))
}

function handleUserCreate(token, payload) {
  const session = requireRole(token, ['ADMIN'])
  const { name, email, password, role } = payload
  if (!name || !email || !password || !role) throw { code: 400, message: 'All fields required' }
  const allowedRoles = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING']
  if (!allowedRoles.includes(role)) throw { code: 400, message: 'Invalid role' }

  const existing = batchRead('Users').find(u => u.email === email.toLowerCase())
  if (existing) throw { code: 409, message: 'Email already in use' }

  const salt = Utilities.getUuid()
  const passwordHash = hashPassword(salt, password)
  const user = {
    userId: generateId('USR'),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    salt,
    role,
    active: true,
    createdAt: new Date().toISOString()
  }
  batchWrite('Users', [user])
  logAction(session.userId, 'USER_CREATED', 'User', user.userId, null, { name, email, role })
  return { userId: user.userId, name: user.name, email: user.email, role: user.role }
}

function handleUserUpdate(token, payload) {
  const session = requireRole(token, ['ADMIN'])
  const { userId, name, role, active } = payload
  if (!userId) throw { code: 400, message: 'userId required' }
  const updates = {}
  if (name !== undefined) updates.name = name.trim()
  if (role !== undefined) updates.role = role
  if (active !== undefined) updates.active = active
  updateRow('Users', 'userId', userId, updates)
  logAction(session.userId, 'USER_UPDATED', 'User', userId, null, updates)
  return { success: true }
}

function handleUserResetPassword(token, payload) {
  const session = requireRole(token, ['ADMIN'])
  const { userId, newPassword } = payload
  if (!userId || !newPassword) throw { code: 400, message: 'userId and newPassword required' }
  const user = findRow('Users', 'userId', userId)
  if (!user) throw { code: 404, message: 'User not found' }
  const salt = Utilities.getUuid()
  const passwordHash = hashPassword(salt, newPassword)
  updateRow('Users', 'userId', userId, { salt, passwordHash })
  logAction(session.userId, 'PASSWORD_RESET', 'User', userId, null, null)
  return { success: true }
}
