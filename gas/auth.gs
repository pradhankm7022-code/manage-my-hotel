// auth.gs — Authentication and authorization

const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000 // 8 hours

function hashPassword(salt, password) {
  const raw = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    salt + password
  )
  return raw.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('')
}

function validateToken(token) {
  if (!token) throw { code: 401, message: 'Not authenticated' }
  const raw = PropertiesService.getScriptProperties().getProperty('token_' + token)
  if (!raw) throw { code: 401, message: 'Invalid session' }
  const session = JSON.parse(raw)
  if (new Date().getTime() > session.expiry) {
    PropertiesService.getScriptProperties().deleteProperty('token_' + token)
    throw { code: 401, message: 'Session expired' }
  }
  return session
}

function requireRole(token, allowedRoles) {
  const session = validateToken(token)
  if (!allowedRoles.includes(session.role)) throw { code: 403, message: 'Forbidden' }
  return session
}

function handleLogin(payload) {
  const { email, password } = payload
  if (!email || !password) throw { code: 400, message: 'Email and password required' }

  const users = batchRead('Users')
  const user = users.find(u => u.email === email.trim().toLowerCase() && u.active)
  if (!user) throw { code: 401, message: 'Invalid email or password' }

  const hash = hashPassword(user.salt, password)
  if (hash !== user.passwordHash) throw { code: 401, message: 'Invalid email or password' }

  const token = Utilities.getUuid()
  PropertiesService.getScriptProperties().setProperty('token_' + token, JSON.stringify({
    userId: user.userId,
    name: user.name,
    role: user.role,
    expiry: new Date().getTime() + TOKEN_EXPIRY_MS
  }))

  logAction(user.userId, 'LOGIN', 'User', user.userId, null, null)
  return { token, user: { userId: user.userId, name: user.name, role: user.role } }
}

function handleLogout(token) {
  if (token) {
    try {
      const session = validateToken(token)
      logAction(session.userId, 'LOGOUT', 'User', session.userId, null, null)
    } catch (e) {}
    PropertiesService.getScriptProperties().deleteProperty('token_' + token)
  }
  return { success: true }
}

function handleMe(token) {
  const session = validateToken(token)
  return { user: { userId: session.userId, name: session.name, role: session.role } }
}
