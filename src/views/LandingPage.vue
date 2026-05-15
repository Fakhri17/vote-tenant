<template>
  <div class="landing-page">
    <div class="hero-wrap">
      <div class="hero-card container">
        <p class="hero-kicker">Voting Experience</p>
        <h1>The Market Day 2026</h1>
        <p class="hero-copy">Pilih tenant favoritmu dan dukung booth terbaik di event tahun ini.</p>
      </div>
    </div>

    <section class="tenant-section container">
      <div class="tenant-head">
        <h2>Daftar Tenant</h2>
        <span>{{ tenantDataset.length }} Booth Aktif</span>
      </div>

      <div class="tenant-grid">
        <article v-for="tenant in tenantDataset" :key="tenant.tenant_id" class="tenant-card">
          <div class="tenant-card__top">
            <span class="tenant-id">{{ tenant.tenant_id }}</span>
            <span class="tenant-booth">{{ tenant.booth || 'TBA' }}</span>
          </div>
          <h3>{{ tenant.nama_tenant }}</h3>
          <p>{{ tenant.kategori_tenant || 'Tenant Market Day' }}</p>
          <RouterLink class="vote-link" :to="`/vote?tenant=${tenant.tenant_id}`">Pilih Tenant Ini</RouterLink>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import tenantsCsv from '../../dataset-tenant.csv?raw'
import { parseTenantCsv } from '../utils/tenantCsv'

const tenantDataset = parseTenantCsv(tenantsCsv)
</script>

<style scoped>
.landing-page {
  --teal: #0d6b6b;
  --teal-dark: #064f51;
  --mustard: #f6c22a;
  --cream: #f8efd8;
  --red: #a11d27;
  min-height: 100vh;
  background:
    radial-gradient(circle at 8% 15%, #f9d881 0, #f9d881 8px, transparent 8px),
    radial-gradient(circle at 92% 74%, #f0a52a 0, #f0a52a 7px, transparent 7px),
    repeating-linear-gradient(150deg, #f4e8ce, #f4e8ce 22px, #efe0c2 22px, #efe0c2 44px);
  padding-bottom: 3rem;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.hero-wrap {
  border-top: 10px solid var(--teal);
  border-bottom: 10px solid var(--teal);
  background: linear-gradient(120deg, #f3dfb7 0%, #f8eed9 100%);
}

.hero-card {
  padding: 3.5rem 1rem;
  text-align: center;
}

.hero-kicker {
  display: inline-block;
  background: var(--teal);
  color: #fff6df;
  border-radius: 999px;
  padding: 0.45rem 0.95rem;
  letter-spacing: 0.06em;
  font-weight: 700;
}

h1 {
  margin-top: 1rem;
  color: var(--red);
  font-family: 'Bungee', cursive;
  letter-spacing: 0.03em;
  font-weight: 400;
  font-size: clamp(2.2rem, 5.2vw, 4.2rem);
  text-shadow:
    -2px -2px 0 #ffedbb,
    2px -2px 0 #ffedbb,
    -2px 2px 0 #ffedbb,
    2px 2px 0 #ffedbb,
    0 6px 0 #7f141d;
}

.hero-copy {
  max-width: 680px;
  margin: 1rem auto 0;
  color: #5b4d30;
  font-size: 1.1rem;
}

.tenant-section {
  margin-top: 2rem;
}

.tenant-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tenant-head h2 {
  margin: 0;
  color: var(--teal-dark);
  font-weight: 900;
}

.tenant-head span {
  background: #fff6df;
  border: 2px solid #e9ca76;
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  font-weight: 700;
  color: #6d541c;
}

.tenant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.tenant-card {
  background: #fff9eb;
  border: 2px solid #ead6a6;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 8px 0 rgba(13, 107, 107, 0.13);
  transition: transform 0.2s ease;
}

.tenant-card:hover {
  transform: translateY(-4px);
}

.tenant-card__top {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}

.tenant-id {
  font-weight: 800;
  color: var(--red);
}

.tenant-booth {
  font-size: 0.85rem;
  background: var(--mustard);
  color: #5a3e00;
  border-radius: 999px;
  padding: 0.25rem 0.65rem;
  font-weight: 800;
}

.tenant-card h3 {
  margin: 0.9rem 0 0.4rem;
  font-size: 1.2rem;
  color: #3b2f16;
  font-weight: 800;
}

.tenant-card p {
  margin: 0 0 1rem;
  color: #7b6640;
}

.vote-link {
  display: inline-block;
  text-decoration: none;
  background: var(--red);
  color: #fff;
  border-radius: 10px;
  padding: 0.42rem 0.75rem;
  font-weight: 700;
}

.vote-link:hover {
  background: #7f141d;
}

@media (max-width: 768px) {
  .hero-card {
    padding: 2.3rem 1rem;
  }

  .tenant-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
