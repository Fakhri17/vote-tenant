<template>
  <div class="container py-5 vote-page">
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card shadow h-100">
          <div class="card-body p-4">
            <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
              <div>
                <p class="section-label text-uppercase mb-1">Voting Tenant</p>
                <h2 class="title mb-0">Berikan dukungan terbaikmu</h2>
              </div>
              <div class="badge bg-light text-dark px-3 py-2">
                Total tenant: {{ tenantDataset.length }}
              </div>
            </div>

            <div v-if="selectedTenant" class="tenant-summary mb-4">
              <div class="tenant-chip">
                <span>Tenant ID</span>
                <strong>{{ selectedTenant.tenant_id }}</strong>
              </div>
              <div class="tenant-summary__content">
                <div>
                  <p class="text-muted mb-1">Nama tenant</p>
                  <h4 class="mb-0">{{ selectedTenant.nama_tenant }}</h4>
                </div>
                <div class="tenant-booth">
                  <p class="text-muted mb-1">Booth</p>
                  <span class="booth">{{ selectedTenant.booth || 'Segera diumumkan' }}</span>
                </div>
              </div>
            </div>

            <div v-else-if="tenantNotFound" class="alert alert-warning mb-4" role="alert">
              <strong>Tenant belum terdaftar.</strong> Kode QR <code>{{ tenantId }}</code> tidak ditemukan di dataset.
              Silakan pastikan kamu memindai QR yang benar atau hubungi panitia.
            </div>

            <div v-else class="alert alert-info mb-4" role="alert">
              <strong>Scan QR tenant terlebih dahulu.</strong> Setelah QR dipindai, informasi tenant akan muncul di
              sini.
            </div>

            <div v-if="!currentUser" class="mb-4 text-center">
              <h5 class="mb-3">Masuk untuk memulai voting</h5>
              <p class="text-muted small mb-4">
                Kami hanya menyimpan nama, email, dan tenant pilihanmu. Voting hanya bisa dilakukan 1 kali.
              </p>
              <div class="d-flex justify-content-center">
                <GoogleLogin :callback="handleGoogleCredential" type="standard" shape="rectangular" theme="outline"
                  size="large" text="signin_with" />
              </div>
            </div>

            <div v-else class="mb-4">
              <div class="alert alert-success" role="alert">
                <strong>Login sebagai:</strong> {{ currentUser.name }} ({{ currentUser.email }})
              </div>
            </div>

            <div class="progress-card mb-4">
              <div v-for="step in progressSteps" :key="step.id" class="progress-step"
                :class="{ completed: step.completed, active: step.active }">
                <div class="step-indicator">
                  <span>{{ step.id }}</span>
                </div>
                <div>
                  <p class="mb-0 fw-semibold">{{ step.title }}</p>
                  <small class="text-muted">{{ step.description }}</small>
                </div>
              </div>
            </div>

            <div class="d-grid gap-2 mb-3">
              <button type="button" class="btn btn-primary btn-lg"
                :disabled="!currentUser || !selectedTenant || isVoting || voteSuccess" @click="handleVote">
                <span v-if="isVoting" class="spinner-border spinner-border-sm me-2" role="status"
                  aria-hidden="true"></span>
                {{ isVoting ? 'Sedang memproses...' : 'Vote Tenant Ini' }}
              </button>
            </div>

            <div v-if="resultMessage" class="alert" :class="resultMessageClass" role="alert">
              {{ resultMessage }}
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="info-panel mb-4">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <p class="section-label text-uppercase mb-1">
                {{ isPreviewingTenant ? 'Preview tenant' : 'Tenant dari QR' }}
              </p>
              <h4 class="mb-0">
                {{ activeInfoTenant?.nama_tenant || 'Belum ada tenant' }}
              </h4>
              <small v-if="activeInfoTenant" class="text-muted">ID: {{ activeInfoTenant.tenant_id }}</small>
            </div>
            <span v-if="activeInfoTenant" class="tenant-chip small">
              Booth <strong>{{ activeInfoTenant.booth || 'TBA' }}</strong>
            </span>
          </div>

          <p v-if="!activeInfoTenant" class="text-muted mb-0">
            Gunakan pencarian di bawah untuk melihat profil tenant dan booth sebelum voting.
          </p>

          <div v-else class="tenant-highlights">
            <div class="highlight">
              <span class="highlight-label">Status voting</span>
              <span class="highlight-value">{{ voteSuccess ? 'Sudah tercatat' : 'Belum voting' }}</span>
            </div>
            <div class="highlight">
              <span class="highlight-label">Booth</span>
              <span class="highlight-value">{{ activeInfoTenant.booth || 'Segera diumumkan' }}</span>
            </div>
            <div class="highlight">
              <span class="highlight-label">QR Code</span>
              <span class="highlight-value">{{ activeInfoTenant.tenant_id }}</span>
            </div>
          </div>

          <button v-if="isPreviewingTenant" type="button" class="btn btn-outline-secondary w-100 mt-3"
            @click="resetPreview">
            Kembali ke tenant dari QR
          </button>
        </div>

        <div class="info-panel mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p class="section-label text-uppercase mb-1">Cari tenant lain</p>
              <h5 class="mb-0">Eksplor Booth</h5>
            </div>
            <span class="text-muted small">{{ filteredTenants.length }} ditampilkan</span>
          </div>
          <input v-model="tenantSearch" type="search" class="form-control form-control-lg mb-3"
            placeholder="Cari nama tenant atau booth (mis. PAWTRAIT, T001)">
          <div class="tenant-list">
            <button v-for="tenant in filteredTenants" :key="tenant.tenant_id" type="button"
              class="tenant-list__item btn btn-light w-100 text-start mb-2"
              :class="{ active: tenant.tenant_id === activeInfoTenant?.tenant_id }"
              @click="handleTenantPreview(tenant.tenant_id)">
              <div class="d-flex justify-content-between align-items-center w-100">
                <div>
                  <p class="mb-0 fw-semibold">{{ tenant.nama_tenant }}</p>
                  <small class="text-muted">ID {{ tenant.tenant_id }} · Booth {{ tenant.booth || 'TBA' }}</small>
                </div>
                <span class="badge text-bg-primary">Lihat</span>
              </div>
            </button>
          </div>
          <small class="text-muted d-block mt-2">
            Data tenant bersumber langsung dari `dataset-tenant.csv`. Klik salah satu untuk melihat info tanpa
            mengganti target voting.
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { GoogleLogin, decodeCredential } from 'vue3-google-login'
import tenantsCsv from '../../dataset-tenant.csv?raw'

const route = useRoute()
const tenantId = ref(route.query.tenant || null)
const currentUser = ref(null)
const resultMessage = ref('')
const isVoting = ref(false)
const voteSuccess = ref(false)
const tenantSearch = ref('')
const previewTenantId = ref(null)

const tenantDataset = parseTenantCsv(tenantsCsv)

watch(
  () => route.query.tenant,
  (newTenant) => {
    tenantId.value = newTenant || null
  }
)

const selectedTenant = computed(() => {
  if (!tenantId.value) return null
  return tenantDataset.find(
    (tenant) => tenant.tenant_id.toLowerCase() === String(tenantId.value).toLowerCase()
  )
})

watch(
  () => tenantId.value,
  () => {
    previewTenantId.value = null
    tenantSearch.value = selectedTenant.value?.nama_tenant || ''
  },
  { immediate: true }
)

const tenantNotFound = computed(() => !!tenantId.value && !selectedTenant.value)

const activeInfoTenant = computed(() => {
  if (previewTenantId.value) {
    return tenantDataset.find((tenant) => tenant.tenant_id === previewTenantId.value) || null
  }
  return selectedTenant.value || null
})

const isPreviewingTenant = computed(
  () => !!previewTenantId.value && previewTenantId.value !== selectedTenant.value?.tenant_id
)

const filteredTenants = computed(() => {
  const term = tenantSearch.value.trim().toLowerCase()
  if (!term) {
    return tenantDataset.slice(0, 6)
  }

  return tenantDataset
    .filter((tenant) => {
      return (
        tenant.tenant_id.toLowerCase().includes(term) ||
        tenant.nama_tenant.toLowerCase().includes(term) ||
        (tenant.booth || '').toLowerCase().includes(term)
      )
    })
    .slice(0, 6)
})

const resultMessageClass = computed(() => {
  if (resultMessage.value.includes('berhasil')) {
    return 'alert-success'
  } else if (resultMessage.value.includes('sudah pernah')) {
    return 'alert-warning'
  } else if (resultMessage.value) {
    return 'alert-danger'
  }
  return ''
})

const progressSteps = computed(() => [
  {
    id: 1,
    title: 'Scan QR tenant',
    description: selectedTenant.value
      ? `${selectedTenant.value.nama_tenant}`
      : 'Pastikan QR terbaca jelas',
    completed: !!selectedTenant.value,
    active: !currentUser.value
  },
  {
    id: 2,
    title: currentUser.value ? 'Login berhasil' : 'Login Google',
    description: currentUser.value ? currentUser.value.email : 'Gunakan akun Google aktif',
    completed: !!currentUser.value,
    active: !!currentUser.value && !voteSuccess.value
  },
  {
    id: 3,
    title: voteSuccess.value ? 'Vote tersimpan' : 'Kirim vote',
    description: voteSuccess.value ? 'Terima kasih!' : 'Pastikan pilihanmu sudah benar',
    completed: voteSuccess.value,
    active: !!currentUser.value && !!selectedTenant.value && !voteSuccess.value
  }
])

function handleGoogleCredential(response) {
  if (!response || !response.credential) {
    resultMessage.value = 'Gagal memproses login. Silakan coba lagi.'
    return
  }

  const payload = decodeCredential(response.credential)

  if (payload) {
    currentUser.value = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email?.split('@')[0] || 'Pengguna'
    }
    resultMessage.value = ''
  } else {
    resultMessage.value = 'Gagal memproses login. Silakan coba lagi.'
  }
}

async function handleVote() {
  if (!currentUser.value) {
    resultMessage.value = 'Silakan login dengan Google terlebih dahulu.'
    return
  }

  if (!selectedTenant.value) {
    resultMessage.value = 'Tenant tidak valid atau tidak ditemukan.'
    return
  }

  isVoting.value = true
  resultMessage.value = ''

  try {
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbydP9UMS9WwxrlaMxurlLbrh0gYu6sk-lGRPywHXzNdhoV5A4AwUnYWiW8OmXnM4SsV/exec',
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          googleId: currentUser.value.googleId,
          email: currentUser.value.email,
          name: currentUser.value.name,
          tenantId: selectedTenant.value.tenant_id
        })
      }
    )

    const rawResponse = await response.text()
    let data = null
    if (rawResponse) {
      try {
        data = JSON.parse(rawResponse)
      } catch (parseError) {
        console.error('Gagal parse respons JSON:', parseError)
      }
    }

    if (!response.ok) {
      throw new Error(data?.message || rawResponse || 'Server mengembalikan error.')
    }

    if (data?.success) {
      resultMessage.value = data.message || 'Vote berhasil tercatat.'
      voteSuccess.value = true
    } else {
      resultMessage.value = data?.message || 'Terjadi kesalahan saat melakukan vote.'
    }
  } catch (error) {
    console.error('Error voting:', error)
    resultMessage.value = error?.message || 'Terjadi kesalahan saat mengirim vote. Silakan coba lagi.'
  } finally {
    isVoting.value = false
  }
}

function handleTenantPreview(id) {
  previewTenantId.value = id
}

function resetPreview() {
  previewTenantId.value = null
}

function parseTenantCsv(rawCsv) {
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
</script>

<style scoped>
.vote-page {
  min-height: 100vh;
}

.card {
  border: none;
  border-radius: 16px;
}

.title {
  font-weight: 700;
}

.section-label {
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: #6c757d;
}

.tenant-summary {
  background: linear-gradient(135deg, #f3f6ff, #fef3ff);
  border-radius: 16px;
  padding: 1.5rem;
}

.tenant-summary__content {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
  justify-content: space-between;
}

.tenant-chip {
  border-radius: 999px;
  background: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
}

.tenant-chip.small {
  font-size: 0.75rem;
}

.tenant-booth .booth {
  font-weight: 600;
  font-size: 1.15rem;
}

.progress-card {
  border: 1px solid #eef1f7;
  border-radius: 14px;
  padding: 1rem 1.25rem;
  background-color: #fcfcff;
}

.progress-step {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px dashed #e2e6ee;
  align-items: center;
}

.progress-step:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.progress-step:first-child {
  padding-top: 0;
}

.progress-step.completed .step-indicator {
  background: #0d6efd;
  color: #fff;
}

.progress-step.active .step-indicator {
  border-color: #0d6efd;
  color: #0d6efd;
}

.step-indicator {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 2px solid #d4dae6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.info-panel {
  border: 1px solid #eef1f7;
  border-radius: 16px;
  padding: 1.5rem;
  background: #fff;
  box-shadow: 0 1.25rem 1.5rem rgba(15, 23, 42, 0.05);
}

.tenant-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.highlight {
  background: #f8fafc;
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.highlight-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #6c757d;
  letter-spacing: 0.06em;
}

.highlight-value {
  font-weight: 600;
}

.tenant-list__item {
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.25s ease;
  padding: 0.85rem 1rem;
}

.tenant-list__item.active {
  border-color: #0d6efd;
  background: rgba(13, 110, 253, 0.05);
}

.tenant-list__item:hover {
  border-color: rgba(13, 110, 253, 0.5);
  transform: translateY(-1px);
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 991px) {
  .tenant-summary__content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
