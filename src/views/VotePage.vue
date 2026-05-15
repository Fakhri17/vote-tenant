<template>
  <div class="vote-page">
    <div class="vote-bg container py-4 py-md-5">
      <header class="vote-header">
        <RouterLink class="back-link" to="/">Lihat Semua Tenant</RouterLink>
        <p class="event-tag mb-0">The Market Day 2026</p>
      </header>

      <main class="vote-shell">
        <section class="title-panel">
          <p class="kicker">Voting Tenant</p>
          <h1>The Market Day 2026</h1>
          <p class="subtitle">Satu akun hanya bisa vote sekali per tenant.</p>
          <span class="tenant-count">{{ tenantDataset.length }} tenant aktif</span>
        </section>

        <section class="content-panel">
          <div v-if="selectedTenant" class="tenant-focus">
            <div class="focus-id">{{ selectedTenant.tenant_id }}</div>
            <div>
              <p class="focus-label">Nama tenant</p>
              <h2>{{ selectedTenant.nama_tenant }}</h2>
            </div>
            <div class="focus-booth">
              <p class="focus-label">Booth</p>
              <strong>{{ selectedTenant.booth || 'Segera diumumkan' }}</strong>
            </div>
          </div>

          <div v-else-if="tenantNotFound" class="notice warning">
            Tenant untuk kode <code>{{ tenantId }}</code> tidak ditemukan.
          </div>
          <div v-else class="notice info">Scan QR tenant dulu untuk mulai voting.</div>

          <template v-if="selectedTenant">
            <div v-if="!currentUser" class="login-panel">
              <h3>Login Google Dulu</h3>
              <p>
                Data yang dipakai hanya nama, email, dan tenant pilihan.
              </p>
              <GoogleLogin
                :callback="handleGoogleCredential"
                type="standard"
                shape="pill"
                theme="filled_blue"
                size="large"
                text="signin_with"
              />
            </div>

            <div v-else class="user-panel">
              <div>
                <strong>{{ currentUser.name }}</strong>
                <p class="mb-0">{{ currentUser.email }}</p>
              </div>
              <button type="button" class="logout-btn" @click="handleLogout">Logout</button>
            </div>

            <div class="steps">
              <div v-for="step in progressSteps" :key="step.id" class="step" :class="{ complete: step.completed }">
                <span>{{ step.id }}</span>
                <div>
                  <h4>{{ step.title }}</h4>
                  <p>{{ step.description }}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="vote-btn"
              :disabled="!currentUser || !selectedTenant || isVoting || voteSuccess"
              @click="handleVote"
            >
              <span v-if="isVoting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              {{ isVoting ? 'Memproses vote...' : 'Vote Tenant Ini' }}
            </button>

            <div v-if="resultMessage" class="notice mt-3" :class="messageTone">
              {{ resultMessage }}
            </div>
          </template>

        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
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

onMounted(() => {
  const savedUser = localStorage.getItem('voteUser')
  if (savedUser) {
    try {
      currentUser.value = JSON.parse(savedUser)
    } catch (error) {
      console.error('Gagal memuat data user:', error)
      localStorage.removeItem('voteUser')
    }
  }
})

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

const messageTone = computed(() => {
  if (resultMessage.value.includes('berhasil')) return 'success'
  if (resultMessage.value.includes('sudah pernah')) return 'warning'
  return 'danger'
})

const progressSteps = computed(() => [
  {
    id: 1,
    title: 'Scan QR',
    description: selectedTenant.value ? selectedTenant.value.nama_tenant : 'QR tenant',
    completed: !!selectedTenant.value,
  },
  {
    id: 2,
    title: currentUser.value ? 'Login Berhasil' : 'Login Google',
    description: currentUser.value ? currentUser.value.email : 'Gunakan akun aktif',
    completed: !!currentUser.value,
  },
  {
    id: 3,
    title: voteSuccess.value ? 'Vote Tersimpan' : 'Kirim Vote',
    description: voteSuccess.value ? 'Terima kasih sudah voting' : 'Klik tombol vote',
    completed: voteSuccess.value,
  },
])

function handleGoogleCredential(response) {
  if (!response || !response.credential) {
    resultMessage.value = 'Gagal memproses login. Silakan coba lagi.'
    return
  }

  const payload = decodeCredential(response.credential)
  if (!payload) {
    resultMessage.value = 'Gagal memproses login. Silakan coba lagi.'
    return
  }

  currentUser.value = {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email?.split('@')[0] || 'Pengguna',
  }
  localStorage.setItem('voteUser', JSON.stringify(currentUser.value))
  resultMessage.value = ''
}

function handleLogout() {
  currentUser.value = null
  localStorage.removeItem('voteUser')
  resultMessage.value = ''
  voteSuccess.value = false
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
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          googleId: currentUser.value.googleId,
          email: currentUser.value.email,
          name: currentUser.value.name,
          tenantId: selectedTenant.value.tenant_id,
        }),
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
  --teal: #0d6b6b;
  --teal-dark: #064f51;
  --mustard: #f5c128;
  --cream: #f8efd8;
  --red: #a11d27;
  min-height: 100vh;
  background:
    radial-gradient(circle at 88% 12%, #f2be33 0, #f2be33 8px, transparent 8px),
    radial-gradient(circle at 18% 42%, #f5d782 0, #f5d782 6px, transparent 6px),
    repeating-linear-gradient(155deg, #f6ead0, #f6ead0 24px, #f0e2c2 24px, #f0e2c2 48px);
}

.vote-bg {
  position: relative;
}

.vote-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.back-link {
  text-decoration: none;
  font-weight: 700;
  color: var(--teal-dark);
}

.event-tag {
  background: var(--teal);
  color: #fff4d5;
  border-radius: 999px;
  padding: 0.4rem 0.95rem;
  font-weight: 700;
}

.vote-shell {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 1.05fr 1.35fr;
  gap: 1rem;
}

.title-panel,
.content-panel {
  background: var(--cream);
  border: 3px solid #e3c983;
  border-radius: 20px;
  box-shadow: 0 8px 0 rgba(6, 79, 81, 0.18);
  padding: 1.3rem;
}

.kicker {
  color: var(--teal);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 900;
}

h1 {
  margin: 0.25rem 0 0;
  font-size: clamp(2rem, 4vw, 3.4rem);
  color: var(--red);
  font-weight: 900;
  text-shadow: 2px 2px 0 #ffd86e;
}

.subtitle {
  color: #604f2f;
  margin: 0.65rem 0 0;
}

.tenant-count {
  display: inline-block;
  margin-top: 1rem;
  background: #fff7e7;
  border: 2px solid #e4cb8b;
  color: #6b5420;
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  font-weight: 700;
}

.tenant-focus {
  background: #fff9ea;
  border: 2px dashed #d8b25d;
  border-radius: 14px;
  padding: 0.9rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
}

.focus-id {
  background: var(--red);
  color: #fff;
  border-radius: 10px;
  font-weight: 800;
  padding: 0.35rem 0.65rem;
}

.focus-label {
  margin: 0;
  color: #83662b;
  font-size: 0.85rem;
}

.tenant-focus h2 {
  margin: 0;
  font-size: 1.3rem;
  color: #3d2f0f;
}

.focus-booth strong {
  color: var(--teal-dark);
}

.notice {
  margin-top: 1rem;
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  font-weight: 600;
}

.notice.info {
  background: #d9f0ef;
  color: #094f51;
}

.notice.warning {
  background: #fff0cb;
  color: #714f06;
}

.notice.success {
  background: #d7f5dd;
  color: #166129;
}

.notice.danger {
  background: #ffd9de;
  color: #7c1826;
}

.login-panel {
  margin-top: 1rem;
  border: 2px solid #e3ca8f;
  border-radius: 12px;
  background: #fff8e9;
  padding: 1rem;
}

.login-panel h3 {
  margin: 0;
  color: #604111;
  font-size: 1.2rem;
}

.login-panel p {
  margin: 0.4rem 0 0.8rem;
  color: #775f30;
}

.user-panel {
  margin-top: 1rem;
  background: #e0f5f4;
  border: 2px solid #9acccc;
  border-radius: 12px;
  padding: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  border: none;
  border-radius: 9px;
  background: var(--teal-dark);
  color: #fff;
  padding: 0.45rem 0.8rem;
  font-weight: 700;
}

.steps {
  margin-top: 1rem;
  display: grid;
  gap: 0.55rem;
}

.step {
  display: flex;
  gap: 0.75rem;
  border-radius: 12px;
  border: 2px solid #ead7a9;
  background: #fff9ec;
  padding: 0.7rem;
}

.step.complete {
  border-color: #8cc8b8;
  background: #ebfaf7;
}

.step span {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #f2d37e;
  color: #604c1c;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.step h4 {
  margin: 0;
  font-size: 1rem;
  color: #3d3012;
}

.step p {
  margin: 0;
  color: #715c31;
  font-size: 0.9rem;
}

.vote-btn {
  margin-top: 1rem;
  width: 100%;
  border: none;
  border-radius: 12px;
  background: var(--red);
  color: #fff;
  font-weight: 800;
  font-size: 1.05rem;
  padding: 0.8rem 0.95rem;
}

.vote-btn:disabled {
  background: #9b7580;
  cursor: not-allowed;
}

@media (max-width: 992px) {
  .vote-shell {
    grid-template-columns: 1fr;
  }

  .tenant-focus {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }
}
</style>
