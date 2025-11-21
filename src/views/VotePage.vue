<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card shadow">
          <div class="card-body p-4">
            <!-- Judul -->
            <h2 class="card-title text-center mb-4">Voting Tenant</h2>

            <!-- Info Tenant -->
            <div v-if="tenantId" class="alert alert-info mb-4" role="alert">
              <strong>Kamu akan memberikan suara untuk tenant:</strong> {{ tenantId }}
            </div>

            <!-- Error: Tenant tidak ditemukan -->
            <div v-else class="alert alert-danger mb-4" role="alert">
              <strong>Error:</strong> Tenant tidak ditemukan dari QR
            </div>

            <!-- Bagian Login -->
            <div v-if="!currentUser" class="mb-4 text-center">
              <h5 class="mb-3">Silakan login dengan Google</h5>
              <div class="d-flex justify-content-center">
                <GoogleLogin :callback="handleGoogleCredential" type="standard" shape="rectangular" theme="outline"
                  size="large" text="signin_with" />
              </div>
            </div>

            <!-- Info User yang sudah login -->
            <div v-else class="mb-4">
              <div class="alert alert-success" role="alert">
                <strong>Login sebagai:</strong> {{ currentUser.name }} ({{ currentUser.email }})
              </div>
            </div>

            <!-- Tombol Vote -->
            <div class="d-grid gap-2 mb-3">
              <button type="button" class="btn btn-primary btn-lg"
                :disabled="!currentUser || !tenantId || isVoting || voteSuccess" @click="handleVote">
                <span v-if="isVoting" class="spinner-border spinner-border-sm me-2" role="status"
                  aria-hidden="true"></span>
                {{ isVoting ? 'Sedang memproses...' : 'Vote Tenant Ini' }}
              </button>
            </div>

            <!-- Pesan Result -->
            <div v-if="resultMessage" class="alert" :class="resultMessageClass" role="alert">
              {{ resultMessage }}
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

// State
const route = useRoute()
const tenantId = ref(route.query.tenant || null)
const currentUser = ref(null)
const resultMessage = ref('')
const isVoting = ref(false)
const voteSuccess = ref(false)

watch(
  () => route.query.tenant,
  (newTenant) => {
    tenantId.value = newTenant || null
  }
)

// Computed
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

// Callback untuk Google Sign In
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

// Fungsi untuk vote
async function handleVote() {
  // Validasi
  if (!currentUser.value) {
    resultMessage.value = 'Silakan login dengan Google terlebih dahulu.'
    return
  }

  if (!tenantId.value) {
    resultMessage.value = 'Tenant tidak valid.'
    return
  }

  // Set state voting
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
          tenantId: tenantId.value
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
.card {
  border: none;
  border-radius: 10px;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
