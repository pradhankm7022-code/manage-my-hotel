// settingsRepo.gs

const settingsRepo = {
  getAll() {
    const rows = batchRead('Settings')
    const map = {}
    rows.forEach(r => { map[r.key] = r.value })
    return map
  },

  get(key) {
    const row = findRow('Settings', 'key', key)
    return row ? row.value : null
  },

  update(key, value) {
    const exists = updateRow('Settings', 'key', key, {
      value,
      updatedAt: new Date().toISOString()
    })
    if (!exists) {
      batchWrite('Settings', [{ key, value, updatedAt: new Date().toISOString() }])
    }
  }
}
