// setup.gs — Run this ONCE to create the first admin user
// After running, delete or comment out this function.

function createFirstAdmin() {
  const name = 'Admin'
  const email = 'admin@theparadise.com'  // change this
  const password = 'ChangeMe123!'         // change this immediately after first login

  const salt = Utilities.getUuid()
  const raw = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + password
  )
  const passwordHash = raw.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('')

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Users')
  sheet.appendRow([
    'USR-000001',
    name,
    email,
    passwordHash,
    salt,
    'ADMIN',
    true,
    new Date().toISOString()
  ])

  Logger.log('Admin user created: ' + email)
}
