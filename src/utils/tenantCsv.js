export function parseTenantCsv(rawCsv) {
  if (!rawCsv) return []

  const lines = rawCsv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const header = lines
    .shift()
    ?.split(',')
    .map((h) => h.trim())

  if (!header || header.length < 2) return []

  const records = []

  for (const line of lines) {
    const values = []
    let current = ''
    let insideQuotes = false

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i]

      if (char === '"') {
        insideQuotes = !insideQuotes
        continue
      }

      if (char === ',' && !insideQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    if (current) {
      values.push(current.trim())
    }

    const record = {}
    header.forEach((key, index) => {
      record[key] = values[index]?.replace(/^"|"$/g, '')?.trim() || ''
    })

    if (record.tenant_id) {
      records.push(record)
    }
  }

  return records
}

