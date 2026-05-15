import fs from 'node:fs/promises'
import path from 'node:path'
import QRCode from 'qrcode'
import { PNG } from 'pngjs'

const ROOT_DIR = process.cwd()
const INPUT_CSV = path.join(ROOT_DIR, 'dataset-tenant.csv')
const OUTPUT_DIR = path.join(ROOT_DIR, 'public', 'qr_booth')

const WIDTH = 1240
const HEIGHT = 1754
const BLACK = [0, 0, 0, 255]
const WHITE = [255, 255, 255, 255]

const FONT = {
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '&': ['01110', '10001', '01010', '00100', '01010', '10001', '01111'],
  "'": ['00100', '00100', '00000', '00000', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00110', '00110'],
  '0': ['01110', '10011', '10101', '11001', '10001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00001', '00001', '00001', '00001', '00001', '10001', '01110'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10001', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
}

function parseCsv(rawCsv) {
  const lines = rawCsv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const header = lines.shift()?.split(',').map((item) => item.trim())
  if (!header || header.length < 2) return []

  return lines.map((line) => {
    const values = []
    let current = ''
    let insideQuotes = false

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i]
      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === ',' && !insideQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const record = {}
    header.forEach((key, index) => {
      record[key] = values[index]?.replace(/^"|"$/g, '')?.trim() || ''
    })
    return record
  })
}

function setPixel(png, x, y, color) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return
  const idx = (png.width * y + x) << 2
  png.data[idx] = color[0]
  png.data[idx + 1] = color[1]
  png.data[idx + 2] = color[2]
  png.data[idx + 3] = color[3]
}

function fillRect(png, x, y, w, h, color) {
  for (let j = y; j < y + h; j += 1) {
    for (let i = x; i < x + w; i += 1) setPixel(png, i, j, color)
  }
}

function sanitizeText(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9 &'\-.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function textWidth(text, scale, gap = 1) {
  return text.length * ((5 * scale) + gap * scale) - gap * scale
}

function drawText(png, text, x, y, scale = 4, color = BLACK) {
  let cursorX = x
  for (const char of text) {
    const glyph = FONT[char] || FONT[' ']
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyph[row].length; col += 1) {
        if (glyph[row][col] === '1') {
          fillRect(png, cursorX + col * scale, y + row * scale, scale, scale, color)
        }
      }
    }
    cursorX += 6 * scale
  }
}

function drawCenteredText(png, text, y, scale = 4, color = BLACK) {
  const safeText = sanitizeText(text)
  const w = textWidth(safeText, scale)
  const x = Math.floor((png.width - w) / 2)
  drawText(png, safeText, x, y, scale, color)
}

function wrapText(text, maxChars) {
  const words = sanitizeText(text).split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    if (!word) continue
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars) {
      current = candidate
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.slice(0, 2)
}

function drawMonoCard({ tenantId, tenantName, booth, qrUrl }) {
  const png = new PNG({ width: WIDTH, height: HEIGHT, colorType: 6 })
  fillRect(png, 0, 0, WIDTH, HEIGHT, WHITE)

  for (let x = 0; x < WIDTH; x += 40) {
    fillRect(png, x, 0, 20, 40, BLACK)
    fillRect(png, x + 20, HEIGHT - 40, 20, 40, BLACK)
  }

  fillRect(png, 30, 30, WIDTH - 60, HEIGHT - 60, WHITE)
  fillRect(png, 30, 30, WIDTH - 60, 8, BLACK)
  fillRect(png, 30, HEIGHT - 38, WIDTH - 60, 8, BLACK)
  fillRect(png, 30, 30, 8, HEIGHT - 60, BLACK)
  fillRect(png, WIDTH - 38, 30, 8, HEIGHT - 60, BLACK)

  drawCenteredText(png, 'THE MARKET DAY 2026', 84, 5, BLACK)
  drawCenteredText(png, 'SCAN QR TO VOTE THIS TENANT', 146, 3, BLACK)

  const qr = QRCode.create(qrUrl, { errorCorrectionLevel: 'M' })
  const moduleCount = qr.modules.size
  const moduleSize = 18
  const marginModules = 3
  const qrPixels = (moduleCount + marginModules * 2) * moduleSize
  const qrX = Math.floor((WIDTH - qrPixels) / 2)
  const qrY = 250

  fillRect(png, qrX - 18, qrY - 18, qrPixels + 36, qrPixels + 36, BLACK)
  fillRect(png, qrX - 12, qrY - 12, qrPixels + 24, qrPixels + 24, WHITE)
  fillRect(png, qrX, qrY, qrPixels, qrPixels, WHITE)

  for (let r = 0; r < moduleCount; r += 1) {
    for (let c = 0; c < moduleCount; c += 1) {
      if (qr.modules.get(c, r)) {
        fillRect(
          png,
          qrX + (c + marginModules) * moduleSize,
          qrY + (r + marginModules) * moduleSize,
          moduleSize,
          moduleSize,
          BLACK
        )
      }
    }
  }

  const nameLines = wrapText(tenantName, 22)
  const nameStartY = 1020
  for (let i = 0; i < nameLines.length; i += 1) {
    drawCenteredText(png, nameLines[i], nameStartY + i * 54, 5, BLACK)
  }

  drawCenteredText(png, booth || 'TBA', 1145, 6, BLACK)
  drawCenteredText(png, tenantId, 1238, 5, BLACK)
  drawCenteredText(png, qrUrl.replace(/^https?:\/\//, ''), 1360, 2, BLACK)

  return PNG.sync.write(png)
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function cleanOutputDir() {
  const entries = await fs.readdir(OUTPUT_DIR, { withFileTypes: true })
  const targets = entries.filter((entry) => entry.isFile() && (entry.name.endsWith('.png') || entry.name.endsWith('.svg')))
  await Promise.all(targets.map((entry) => fs.unlink(path.join(OUTPUT_DIR, entry.name))))
}

async function run() {
  const rawCsv = await fs.readFile(INPUT_CSV, 'utf8')
  const rows = parseCsv(rawCsv).filter((row) => row.tenant_id && row.qr_url)

  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  await cleanOutputDir()

  const manifest = []
  for (const row of rows) {
    const filename = `${row.tenant_id}-${slugify(row.booth || 'booth')}.png`
    const filePath = path.join(OUTPUT_DIR, filename)
    const pngBuffer = drawMonoCard({
      tenantId: row.tenant_id,
      tenantName: row.nama_tenant || row.tenant_id,
      booth: row.booth || 'TBA',
      qrUrl: row.qr_url,
    })
    await fs.writeFile(filePath, pngBuffer)
    manifest.push({
      tenant_id: row.tenant_id,
      nama_tenant: row.nama_tenant || '',
      booth: row.booth || '',
      qr_url: row.qr_url,
      file: filename,
    })
  }

  await fs.writeFile(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
  console.log(`Generated ${manifest.length} PNG QR booth cards in public/qr_booth`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
