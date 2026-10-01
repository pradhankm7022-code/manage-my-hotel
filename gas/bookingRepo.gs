// bookingRepo.gs — All Sheets access for Bookings

const bookingRepo = {

  getAllBookings() {
    return batchRead('Bookings')
  },

  getBookingById(bookingId) {
    return findRow('Bookings', 'bookingId', bookingId)
  },

  getBookingsByRoom(roomId) {
    return findRows('Bookings', b => b.roomId === roomId)
  },

  getActiveBookingForRoom(roomId) {
    return findRows('Bookings', b =>
      b.roomId === roomId &&
      (b.status === 'CONFIRMED' || b.status === 'CHECKED_IN')
    )[0] || null
  },

  createBooking(data) {
    batchWrite('Bookings', [data])
    return data
  },

  updateBooking(bookingId, updates) {
    updates.updatedAt = new Date().toISOString()
    return updateRow('Bookings', 'bookingId', bookingId, updates)
  }
}
