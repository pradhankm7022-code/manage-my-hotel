// audit.gs — Audit logging

function logAction(userId, action, entity, entityId, oldValue, newValue) {
  try {
    batchWrite('AuditLog', [{
      logId: generateId('LOG'),
      userId: userId || 'SYSTEM',
      action,
      entity,
      entityId: String(entityId),
      oldValue: oldValue ? JSON.stringify(oldValue) : '',
      newValue: newValue ? JSON.stringify(newValue) : '',
      timestamp: new Date().toISOString()
    }])
  } catch (e) {
    // Never crash the main flow due to audit failure
  }
}
