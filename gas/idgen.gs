// idgen.gs — ID generation

const BOOKING_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateId(prefix) {
  return prefix + '-' + Utilities.getUuid().replace(/-/g, '').substring(0, 6).toUpperCase()
}

function generateBookingId() {
  let id = 'BKG-'
  for (let i = 0; i < 6; i++) {
    id += BOOKING_CHARS[Math.floor(Math.random() * BOOKING_CHARS.length)]
  }
  return id
}

function generateInvoiceNumber() {
  const settings = settingsRepo.getAll()
  const prefix = settings['invoice_prefix'] || 'INV'
  const seq = parseInt(settings['invoice_seq'] || '1')
  const number = prefix + '-' + String(seq).padStart(4, '0')
  settingsRepo.update('invoice_seq', String(seq + 1))
  return number
}
