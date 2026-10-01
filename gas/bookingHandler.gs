// bookingHandler.gs — API handlers for bookings

const VALID_BOOKING_STATUSES = ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED']

function handleBookingList(token, payload) {
  requireRole(token, ['ADMIN', 'MANAGER', 'RECEPTIONIST'])
  const bookings = bookingRepo.getAllBookings()
  const rooms = roomRepo.getAllRooms(true)
  const roomMap = {}
  rooms.forEach(r => { roomMap[r.roomId] = r.roomNumber })

  const { status, date } = payload
  let result = bookings

  if (status && status !== 'ALL') {
    result = result.filter(b => b.status === status)
  }

  if (date === 'TODAY') {
    const today = new Date().toISOString().slice(0, 10)
    result = result.filter(b =>
      String(b.checkIn).slice(0, 10) === today ||
      String(b.checkOut).slice(0, 10) === today ||
      b.status === 'CHECKED_IN'
    )
  }

  return result
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map(b => ({ ...b, roomNumber: roomMap[b.roomId] || b.roomId }))
}

function handleBookingGet(token, payload) {
  requireRole(token, ['ADMIN', 'MANAGER', 'RECEPTIONIST'])
  const booking = bookingRepo.getBookingById(payload.bookingId)
  if (!booking) throw { code: 404, message: 'Booking not found' }
  const room = roomRepo.getRoomById(booking.roomId)
  return { ...booking, roomNumber: room ? room.roomNumber : booking.roomId }
}

function handleBookingCreate(token, payload) {
  const session = requireRole(token, ['ADMIN', 'MANAGER', 'RECEPTIONIST'])
  const { guestName, guestPhone, roomId, checkIn, checkOut, adults, children, notes } = payload

  if (!guestName || !guestPhone || !roomId || !checkIn || !checkOut || !adults) {
    throw { code: 400, message: 'guestName, guestPhone, roomId, checkIn, checkOut and adults are required' }
  }

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  if (checkOutDate <= checkInDate) throw { code: 400, message: 'Check-out must be after check-in' }

  const room = roomRepo.getRoomById(roomId)
  if (!room) throw { code: 404, message: 'Room not found' }
  if (room.status === 'OUT_OF_ORDER') throw { code: 400, message: 'Room is out of order' }

  const conflict = bookingRepo.getActiveBookingForRoom(roomId)
  if (conflict) throw { code: 409, message: 'Room already has an active booking' }

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
  const totalAmount = nights * Number(room.currentRate)

  const booking = {
    bookingId: generateId('BK'),
    guestName: guestName.trim(),
    guestPhone: String(guestPhone).trim(),
    roomId,
    checkIn,
    checkOut,
    adults: Number(adults),
    children: Number(children || 0),
    totalAmount,
    status: 'CONFIRMED',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  bookingRepo.createBooking(booking)
  logAction(session.userId, 'BOOKING_CREATED', 'Booking', booking.bookingId, null, booking)
  return { ...booking, roomNumber: room.roomNumber }
}

function handleBookingCheckIn(token, payload) {
  const session = requireRole(token, ['ADMIN', 'MANAGER', 'RECEPTIONIST'])
  const { bookingId } = payload
  if (!bookingId) throw { code: 400, message: 'bookingId required' }

  const booking = bookingRepo.getBookingById(bookingId)
  if (!booking) throw { code: 404, message: 'Booking not found' }
  if (booking.status !== 'CONFIRMED') throw { code: 400, message: 'Only CONFIRMED bookings can be checked in' }

  bookingRepo.updateBooking(bookingId, { status: 'CHECKED_IN' })
  roomRepo.setStatus(booking.roomId, 'OCCUPIED')
  logAction(session.userId, 'BOOKING_CHECKIN', 'Booking', bookingId, { status: 'CONFIRMED' }, { status: 'CHECKED_IN' })
  return bookingRepo.getBookingById(bookingId)
}

function handleBookingCheckOut(token, payload) {
  const session = requireRole(token, ['ADMIN', 'MANAGER', 'RECEPTIONIST'])
  const { bookingId } = payload
  if (!bookingId) throw { code: 400, message: 'bookingId required' }

  const booking = bookingRepo.getBookingById(bookingId)
  if (!booking) throw { code: 404, message: 'Booking not found' }
  if (booking.status !== 'CHECKED_IN') throw { code: 400, message: 'Only CHECKED_IN bookings can be checked out' }

  bookingRepo.updateBooking(bookingId, { status: 'CHECKED_OUT' })
  roomRepo.setStatus(booking.roomId, 'DIRTY')
  logAction(session.userId, 'BOOKING_CHECKOUT', 'Booking', bookingId, { status: 'CHECKED_IN' }, { status: 'CHECKED_OUT' })
  return bookingRepo.getBookingById(bookingId)
}

function handleBookingCancel(token, payload) {
  const session = requireRole(token, ['ADMIN', 'MANAGER', 'RECEPTIONIST'])
  const { bookingId } = payload
  if (!bookingId) throw { code: 400, message: 'bookingId required' }

  const booking = bookingRepo.getBookingById(bookingId)
  if (!booking) throw { code: 404, message: 'Booking not found' }
  if (!['CONFIRMED', 'CHECKED_IN'].includes(booking.status)) {
    throw { code: 400, message: 'Only CONFIRMED or CHECKED_IN bookings can be cancelled' }
  }

  bookingRepo.updateBooking(bookingId, { status: 'CANCELLED' })
  roomRepo.setStatus(booking.roomId, 'AVAILABLE')
  logAction(session.userId, 'BOOKING_CANCELLED', 'Booking', bookingId, { status: booking.status }, { status: 'CANCELLED' })
  return bookingRepo.getBookingById(bookingId)
}
