<template>
  <div class="results-page container py-5">
    <div class="mb-4">
      <button class="btn btn-primary mb-3">Kembali</button>
      <p class="section-label text-uppercase mb-1">Sistem Deteksi Anomali</p>
      <h1 class="fw-bold mb-2">Hasil Deteksi Anomali Access Log</h1>
      <p class="text-muted mb-0">
        Halaman ini menampilkan ringkasan hasil deteksi anomali menggunakan model Isolation Forest, termasuk
        jumlah total data yang dianalisis, jumlah data normal, dan jumlah data yang teridentifikasi sebagai anomali.
      </p>
    </div>


    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card shadow-sm border-1">
          <div class="card-body">
            <p class="text-uppercase text-muted small mb-1">Total Data Dianalisis</p>
            <h2 class="text-dark mb-0">6</h2>
            <p class="text-muted small mb-0">Jumlah baris log yang diproses oleh model.</p>
          </div>

        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm border-1">
          <div class="card-body">
            <p class="text-uppercase text-muted small mb-1">Data Normal</p>
            <h2 class="text-success mb-0">3</h2>
            <p class="text-muted small mb-0">Permintaan yang dianggap wajar oleh model.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card shadow-sm border-1">
          <div class="card-body">
            <p class="text-uppercase text-muted small mb-1">Data Anomali</p>
            <h2 class="text-danger mb-0">3</h2>
            <p class="text-muted small mb-0">Permintaan yang teridentifikasi sebagai anomali.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm border-0">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <h5 class="mb-0">Detail Hasil Deteksi</h5>
          <span class="text-muted small">
            Menampilkan contoh baris log dengan informasi IP, waktu akses, URL, dan label prediksi.
          </span>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Alamat IP</th>
                <th scope="col">Waktu Akses</th>
                <th scope="col">Metode &amp; URL</th>
                <th scope="col">Status</th>
                <th scope="col">Label Prediksi</th>
              </tr>
            </thead>
            <tbody>
              <!-- Dummy row 1 (Normal) -->
              <tr>
                <td>1</td>
                <td><code>192.168.1.10</code></td>
                <td>2025-12-04 10:15:23</td>
                <td><span class="badge bg-light text-dark me-2">GET</span>/index.html</td>
                <td>200</td>
                <td><span class="badge bg-success-subtle text-success fw-semibold">Normal</span></td>
              </tr>
              <!-- Dummy row 2 (Normal) -->
              <tr>
                <td>2</td>
                <td><code>192.168.1.11</code></td>
                <td>2025-12-04 10:16:02</td>
                <td><span class="badge bg-light text-dark me-2">GET</span>/assets/style.css</td>
                <td>200</td>
                <td><span class="badge bg-success-subtle text-success fw-semibold">Normal</span></td>
              </tr>
              <!-- Dummy row 3 (SQL Injection) -->
              <tr>
                <td>3</td>
                <td><code>203.0.113.21</code></td>
                <td>2025-12-04 10:17:30</td>
                <td>
                  <span class="badge bg-light text-dark me-2">GET</span>/login.php?username=admin'--&amp;password=
                </td>
                <td>200</td>
                <td><span class="badge bg-danger-subtle text-danger fw-semibold">Anomali</span></td>
              </tr>
              <!-- Dummy row 4 (XSS) -->
              <tr>
                <td>4</td>
                <td><code>198.51.100.11</code></td>
                <td>2025-12-04 10:18:15</td>
                <td>
                  <span
                    class="badge bg-light text-dark me-2">GET</span>/search?q=%3Cscript%3Ealert('XSS')%3C%2Fscript%3E
                </td>
                <td>200</td>
                <td><span class="badge bg-danger-subtle text-danger fw-semibold">Anomali</span></td>
              </tr>
              <!-- Dummy row 5 (Normal) -->
              <tr>
                <td>5</td>
                <td><code>10.0.0.5</code></td>
                <td>2025-12-04 10:18:54</td>
                <td><span class="badge bg-light text-dark me-2">POST</span>/login</td>
                <td>401</td>
                <td><span class="badge bg-success-subtle text-success fw-semibold">Normal</span></td>
              </tr>
              <!-- Dummy row 6 (Path Traversal) -->
              <tr>
                <td>6</td>
                <td><code>203.0.113.45</code></td>
                <td>2025-12-04 10:19:21</td>
                <td>
                  <span class="badge bg-light text-dark me-2">GET</span>/download?file=../../etc/passwd
                </td>
                <td>403</td>
                <td><span class="badge bg-danger-subtle text-danger fw-semibold">Anomali</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.results-page {
  min-height: 100vh;
}
</style>
