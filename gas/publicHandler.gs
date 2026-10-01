// publicHandler.gs — No-auth endpoints for the public booking website

function handlePublicRoomTypes() {
  const types = roomRepo.getAllRoomTypes(false)
  return types.map(t => ({
    roomTypeId: t.roomTypeId,
    name: t.name,
    description: t.description,
    maxGuests: t.maxGuests,
    basePrice: t.basePrice,
    amenities: t.amenities,
  }))
}

function handlePublicCheckAvailability(payload) {
  const { checkIn, checkOut } = payload
  if (!checkIn || !checkOut) throw { code: 400, message: 'checkIn and checkOut are required' }

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  if (checkOutDate <= checkInDate) throw { code: 400, message: 'Check-out must be after check-in' }

  const rooms = roomRepo.getAllRooms(false).filter(r =>
    r.status !== 'OUT_OF_ORDER' && r.status !== 'MAINTENANCE'
  )

  const bookedRoomIds = new Set(
    bookingRepo.getAllBookings()
      .filter(b => ['CONFIRMED', 'CHECKED_IN'].includes(b.status))
      .filter(b => {
        const bIn = new Date(b.checkIn)
        const bOut = new Date(b.checkOut)
        return checkInDate < bOut && checkOutDate > bIn
      })
      .map(b => b.roomId)
  )

  const types = roomRepo.getAllRoomTypes(false)
  const typeMap = {}
  types.forEach(t => { typeMap[t.roomTypeId] = t })

  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))

  return rooms
    .filter(r => !bookedRoomIds.has(r.roomId))
    .map(r => {
      const t = typeMap[r.roomTypeId] || {}
      return {
        roomId: r.roomId,
        roomNumber: r.roomNumber,
        roomTypeId: r.roomTypeId,
        name: t.name || '',
        description: t.description || '',
        maxGuests: t.maxGuests || r.maxOccupancy,
        amenities: t.amenities || '',
        currentRate: r.currentRate,
        totalAmount: nights * Number(r.currentRate),
        nights,
      }
    })
    .sort((a, b) => Number(a.currentRate) - Number(b.currentRate))
}

function handlePublicBook(payload) {
  const { guestName, guestPhone, roomId, checkIn, checkOut, adults, children, notes } = payload

  if (!guestName || !guestPhone || !roomId || !checkIn || !checkOut || !adults) {
    throw { code: 400, message: 'guestName, guestPhone, roomId, checkIn, checkOut and adults are required' }
  }

  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  if (checkOutDate <= checkInDate) throw { code: 400, message: 'Check-out must be after check-in' }

  const room = roomRepo.getRoomById(roomId)
  if (!room) throw { code: 404, message: 'Room not found' }
  if (['OUT_OF_ORDER', 'MAINTENANCE'].includes(room.status)) {
    throw { code: 400, message: 'Room is not available' }
  }

  const conflict = bookingRepo.getAllBookings()
    .filter(b => b.roomId === roomId && ['CONFIRMED', 'CHECKED_IN'].includes(b.status))
    .find(b => {
      const bIn = new Date(b.checkIn)
      const bOut = new Date(b.checkOut)
      return checkInDate < bOut && checkOutDate > bIn
    })
  if (conflict) throw { code: 409, message: 'Room is no longer available for those dates' }

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
  return {
    bookingId: booking.bookingId,
    guestName: booking.guestName,
    roomNumber: room.roomNumber,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    totalAmount: booking.totalAmount,
    nights,
  }
}
