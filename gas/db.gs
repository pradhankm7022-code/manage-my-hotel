// db.gs — All Google Sheets access goes through here

const SPREADSHEET_ID = '1pkGxG0HDVIcH2rXA3Er_yPgGLYRC04cDaTyX-oQf5hU' // replace after creating the sheet

function getSheet(name) {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name)
}

function batchRead(sheetName) {
  const sheet = getSheet(sheetName)
  const data = sheet.getDataRange().getValues()
  if (data.length < 2) return []
  const headers = data[0]
  return data.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] })
    return obj
  })
}

function batchWrite(sheetName, rows) {
  const sheet = getSheet(sheetName)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const values = rows.map(row => headers.map(h => row[h] ?? ''))
  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values)
}

function updateRow(sheetName, pkColumn, pkValue, updates) {
  const sheet = getSheet(sheetName)
  const data = sheet.getDataRange().getValues()
  const headers = data[0]
  const pkIndex = headers.indexOf(pkColumn)
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][pkIndex]) === String(pkValue)) {
      Object.keys(updates).forEach(key => {
        const colIndex = headers.indexOf(key)
        if (colIndex >= 0) sheet.getRange(i + 1, colIndex + 1).setValue(updates[key])
      })
      return true
    }
  }
  return false
}

function findRow(sheetName, pkColumn, pkValue) {
  const rows = batchRead(sheetName)
  return rows.find(r => String(r[pkColumn]) === String(pkValue)) || null
}

function findRows(sheetName, filterFn) {
  return batchRead(sheetName).filter(filterFn)
}
