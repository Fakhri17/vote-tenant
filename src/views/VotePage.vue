<template>
  <div class="container py-5 vote-page">
    <div class="row justify-content-center">
      <div class="col-lg-8">
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

            <template v-if="selectedTenant">
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
            </template>

            <!-- Informasi Form Alternatif -->
            <div class="alert alert-warning border-warning mt-4 mb-0 alternative-form-info" role="alert">
              <div class="d-flex align-items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                  class="bi bi-exclamation-triangle-fill mt-1" viewBox="0 0 16 16">
                  <path
                    d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
                <div class="flex-grow-1">
                  <strong class="d-block mb-2">Mengalami kendala?</strong>
                  <p class="mb-2">Jika terjadi kendala saat voting melalui QR code, Anda dapat melakukan voting melalui
                    form alternatif berikut:</p>
                  <a href="https://forms.gle/RAKLzF8nMU36fb5s8" target="_blank" rel="noopener noreferrer"
                    class="btn btn-warning btn-sm fw-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                      class="bi bi-box-arrow-up-right me-1" viewBox="0 0 16 16">
                      <path fill-rule="evenodd"
                        d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z" />
                      <path fill-rule="evenodd"
                        d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z" />
                    </svg>
                    Buka Form Voting Alternatif
                  </a>
                </div>
              </div>
            </div>
          </div>
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
import { parseTenantCsv } from '../utils/tenantCsv'

const route = useRoute()
const tenantId = ref(route.query.tenant || null)
const currentUser = ref(null)
const resultMessage = ref('')
const isVoting = ref(false)
const voteSuccess = ref(false)

const tenantDataset = parseTenantCsv(tenantsCsv)

watch(
  () => route.query.tenant,
  (newTenant) => {
    tenantId.value = newTenant || null
  }
)

watch(
  () => tenantId.value,
  () => {
    if (!tenantId.value) {
      resultMessage.value = ''
    }
    voteSuccess.value = false
  }
)

const selectedTenant = computed(() => {
  if (!tenantId.value) return null
  return tenantDataset.find(
    (tenant) => tenant.tenant_id.toLowerCase() === String(tenantId.value).toLowerCase()
  )
})

const tenantNotFound = computed(() => !!tenantId.value && !selectedTenant.value)

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

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.alternative-form-info {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.15);
}

.alternative-form-info strong {
  color: #856404;
  font-size: 1.1rem;
}

.alternative-form-info p {
  color: #856404;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.alternative-form-info .btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
  font-weight: 600;
  padding: 0.5rem 1.25rem;
  transition: all 0.2s;
}

.alternative-form-info .btn-warning:hover {
  background-color: #ffca2c;
  border-color: #ffca2c;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
}

.alternative-form-info svg {
  flex-shrink: 0;
}

@media (max-width: 991px) {
  .tenant-summary__content {
    flex-direction: column;
    align-items: flex-start;
  }

  .alternative-form-info {
    font-size: 0.9rem;
  }

  .alternative-form-info .btn-warning {
    width: 100%;
    justify-content: center;
  }
}
</style>
