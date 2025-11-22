<template>
  <div class="generator-page container py-5">
    <!-- Spinner Overlay -->
    <Teleport to="body">
      <div v-if="isGenerating" class="spinner-overlay">
        <div class="spinner-container">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 mb-0 fw-semibold">Sedang memproses generate booth...</p>
        </div>
      </div>
    </Teleport>

    <div class="mb-4">
      <h1 class="fw-bold mb-2">Generator Booth & QR</h1>
      <p class="text-muted mb-0">
        Gunakan halaman ini untuk mengacak ulang penempatan booth dan membuat QR unik tiap tenant sebelum
        presentasi.
      </p>
    </div>

    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Base URL</label>
            <input v-model.trim="baseUrl" type="text" class="form-control" placeholder="https://example.com/vote" />
            <small class="text-muted">Parameter `?tenant=ID` akan ditambahkan otomatis.</small>
          </div>
          <div class="col-md-2">
            <label class="form-label">Prefix Booth</label>
            <input v-model="boothPrefix" type="text" class="form-control" maxlength="6" />
          </div>
          <div class="col-md-2">
            <label class="form-label">Digit Booth</label>
            <input v-model.number="boothDigits" type="number" class="form-control" min="1" max="4" />
          </div>
          <div class="col-md-2">
            <label class="form-label">Start No.</label>
            <input v-model.number="startNumber" type="number" class="form-control" min="1" />
          </div>
          <div class="col-md-2">
            <label class="form-label">Penomoran</label>
            <select v-model="shuffleStrategy" class="form-select">
              <option value="shuffle">Acak penuh</option>
              <option value="sort">Urut Tenant ID</option>
            </select>
          </div>
        </div>
        <div class="d-flex gap-3 align-items-center mt-4 flex-wrap">
          <button class="btn btn-primary btn-lg" :disabled="isGenerating" @click="generateAssignments">
            <span v-if="isGenerating" class="spinner-border spinner-border-sm me-2" role="status" />
            {{ isGenerating ? 'Sedang memproses...' : 'Generate Booth & QR' }}
          </button>
          <button class="btn btn-secondary" :disabled="!assignments.length" @click="downloadCsv">
            Unduh CSV terbaru
          </button>
          <button class="btn btn-secondary" :disabled="!assignments.length" @click="downloadAllQr">
            Unduh semua QR (.zip)
          </button>
          <span v-if="generatedAt" class="text-muted small">
            Terakhir generate: {{ generatedAt?.toLocaleString() }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="assignments.length" class="card shadow-sm">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 class="mb-0">Total tenant: {{ assignments.length }}</h5>
          <input v-model="searchTerm" type="search" class="form-control w-auto" placeholder="Cari tenant / booth" />
        </div>
        <div class="table-responsive">
          <table class="table align-middle table-enhanced">
            <thead>
              <tr>
                <th>Tenant ID</th>
                <th>Nama</th>
                <th>Booth</th>
                <th>QR Preview</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tenant in filteredAssignments" :key="tenant.tenant_id">
                <td class="tenant-id-cell"><code>{{ tenant.tenant_id }}</code></td>
                <td class="tenant-name-cell">{{ tenant.nama_tenant }}</td>
                <td class="booth-cell"><span class="badge text-bg-primary booth-badge">{{ tenant.booth }}</span></td>
                <td>
                  <img :src="tenant.qrDataUrl" :alt="`QR ${tenant.tenant_id}`" class="qr-preview" />
                </td>
                <td>
                  <a :href="tenant.qrDataUrl" class="btn btn-outline-primary"
                    :download="`${tenant.tenant_id}-${tenant.booth}.png`">
                    Download QR
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import QRCode from 'qrcode'
import tenantsCsv from '../../dataset-tenant.csv?raw'
import { parseTenantCsv } from '../utils/tenantCsv'

const tenantDataset = parseTenantCsv(tenantsCsv)

const baseUrl = ref('https://vote-tenant-tmd2025.netlify.app/vote')
const boothPrefix = ref('B')
const boothDigits = ref(3)
const startNumber = ref(1)
const shuffleStrategy = ref('shuffle')
const assignments = ref([])
const isGenerating = ref(false)
const generatedAt = ref(null)
const searchTerm = ref('')

const filteredAssignments = computed(() => {
  if (!searchTerm.value) return assignments.value
  const term = searchTerm.value.toLowerCase()
  return assignments.value.filter((tenant) => {
    return (
      tenant.tenant_id.toLowerCase().includes(term) ||
      tenant.nama_tenant.toLowerCase().includes(term) ||
      tenant.booth.toLowerCase().includes(term)
    )
  })
})

async function generateAssignments() {
  isGenerating.value = true
  assignments.value = []

  // Pastikan DOM terupdate dulu sebelum memulai proses
  await nextTick()

  // Tambahkan delay kecil untuk memastikan spinner terlihat
  await new Promise(resolve => setTimeout(resolve, 100))

  try {
    const datasetCopy = [...tenantDataset]
    if (shuffleStrategy.value === 'shuffle') {
      shuffleArray(datasetCopy)
    } else {
      datasetCopy.sort((a, b) => a.tenant_id.localeCompare(b.tenant_id))
    }

    const results = []
    for (let i = 0; i < datasetCopy.length; i += 1) {
      const boothNumber = String(startNumber.value + i).padStart(boothDigits.value, '0')
      const boothCode = `${boothPrefix.value}${boothNumber}`
      const tenant = datasetCopy[i]
      const qrUrl = `${baseUrl.value}?tenant=${tenant.tenant_id}`
      const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 256, margin: 1 })

      results.push({
        ...tenant,
        booth: boothCode,
        qrUrl,
        qrDataUrl
      })
    }

    assignments.value = results
    generatedAt.value = new Date()
  } catch (error) {
    console.error('Gagal membuat QR:', error)
    alert('Terjadi kesalahan saat membuat QR. Silakan cek console.')
  } finally {
    isGenerating.value = false
  }
}

function downloadCsv() {
  if (!assignments.value.length) return

  const header = ['tenant_id', 'nama_tenant', 'booth', 'qr_url']
  const rows = assignments.value.map((tenant) =>
    [tenant.tenant_id, tenant.nama_tenant, tenant.booth, tenant.qrUrl].map(csvEscape).join(',')
  )

  const csvContent = [header.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, 'dataset-tenant-generated.csv')
}

async function downloadAllQr() {
  if (!assignments.value.length) return

  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()

  assignments.value.forEach((tenant) => {
    const base64Data = tenant.qrDataUrl.split('base64,')[1]
    zip.file(`${tenant.tenant_id}-${tenant.booth}.png`, base64Data, { base64: true })
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, 'qr-tenants.zip')
}

function triggerDownload(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
  }
}

function csvEscape(value) {
  if (value == null) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}
</script>

<style scoped>
.generator-page {
  min-height: 100vh;
  position: relative;
}

.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.spinner-container {
  background: white;
  padding: 2.5rem 3.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
  min-width: 280px;
}

.spinner-container .spinner-border {
  border-width: 4px;
}

.qr-preview {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border: 1px solid #e1e5ec;
  border-radius: 8px;
  background: #fff;
  padding: 4px;
}

.table-enhanced {
  font-size: 1rem;
}

.table-enhanced thead th {
  font-size: 1.05rem;
  font-weight: 600;
  padding: 1rem 0.75rem;
  background-color: #f8f9fa;
}

.table-enhanced tbody td {
  padding: 1rem 0.75rem;
  font-size: 1.2rem;
  vertical-align: middle;
}

.tenant-id-cell code {
  font-size: 1.1rem;
  padding: 0.4rem 0.6rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-weight: 600;
}

.tenant-name-cell {
  font-size: 1.5rem;
  font-weight: 500;
}

.booth-cell {
  text-align: center;
}

.booth-badge {
  font-size: 1.25rem;
  font-weight: 700;
  padding: 0.6rem 1rem;
  letter-spacing: 0.5px;
  min-width: 80px;
  display: inline-block;
  background-color: #0d6efd !important;
  color: white !important;
}
</style>
