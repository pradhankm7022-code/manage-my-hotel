// dashboardHandler.gs — Summary stats for the dashboard

function handleDashboardSummary(token) {
  requireRole(token, ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'])

  const today = new Date().toISOString().slice(0, 10)

  const rooms = roomRepo.getAllRooms(false)
  const bookings = bookingRepo.getAllBookings()

  // Room counts
  const roomCounts = { AVAILABLE: 0, OCCUPIED: 0, DIRTY: 0, MAINTENANCE: 0, OUT_OF_ORDER: 0 }
  rooms.forEach(r => { if (roomCounts[r.status] !== undefined) roomCounts[r.status]++ })

  // Today's check-ins (CONFIRMED bookings with checkIn = today)
  const checkInsToday = bookings.filter(b =>
    b.status === 'CONFIRMED' && String(b.checkIn).slice(0, 10) === today
  ).length

  // Today's check-outs (CHECKED_IN bookings with checkOut = today)
  const checkOutsToday = bookings.filter(b =>
    b.status === 'CHECKED_IN' && String(b.checkOut).slice(0, 10) === today
  ).length

  // Today's revenue: bookings checked out today
  const revenueToday = bookings
    .filter(b => b.status === 'CHECKED_OUT' && String(b.updatedAt).slice(0, 10) === today)
    .reduce((sum, b) => sum + Number(b.totalAmount), 0)

  // Current in-house guests
  const inHouse = bookings.filter(b => b.status === 'CHECKED_IN').length

  // Recent bookings (last 5)
  const recent = bookings
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 5)
    .map(b => {
      const room = roomRepo.getRoomById(b.roomId)
      return { ...b, roomNumber: room ? room.roomNumber : b.roomId }
    })

  return {
    rooms: roomCounts,
    totalRooms: rooms.length,
    checkInsToday,
    checkOutsToday,
    revenueToday,
    inHouse,
    recent,
  }
}
