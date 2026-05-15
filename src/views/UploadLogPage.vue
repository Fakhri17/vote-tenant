<template>
  <div class="container min-vh-100 py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <div class="card shadow-sm border-2">
          <div class="card-body p-4 p-md-5">
            <p class="text-uppercase text-muted small mb-1">Sistem Deteksi Anomali</p>
            <h1 class="fw-bold mb-3">Unggah Access Log Nginx</h1>
            <p class="text-muted mb-4">
              Halaman ini digunakan untuk mengunggah berkas access log web server Nginx yang akan dianalisis
              oleh sistem deteksi anomali. Pilih berkas log yang sesuai kemudian tekan tombol untuk memulai proses.
            </p>

            <div class="mb-4">
              <label for="logFile" class="form-label fw-semibold">Pilih berkas access log</label>
              <input id="logFile" type="file" class="form-control" accept=".log,.txt,.csv" />
              <small class="text-muted d-block mt-2">
                Contoh: <code>access.log</code> atau berkas log lain yang diekspor dari web server Nginx.
              </small>
            </div>

            <div class="d-grid gap-2 mb-4">
              <button type="button" class="btn btn-primary">
                Mulai Proses Deteksi
              </button>

            </div>

            <div class="row g-3">
              <div class="col-md-4">
                <div class="border rounded-3 p-3 h-100 bg-light">
                  <p class="text-uppercase text-muted small mb-1">Langkah 1</p>
                  <h6 class="mb-1">Unggah berkas log</h6>
                  <p class="text-muted small mb-0">
                    Pilih berkas access log yang akan dianalisis dari penyimpanan lokal.
                  </p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="border rounded-3 p-3 h-100 bg-light">
                  <p class="text-uppercase text-muted small mb-1">Langkah 2</p>
                  <h6 class="mb-1">Proses dengan model</h6>
                  <p class="text-muted small mb-0">
                    Sistem akan menjalankan model Isolation Forest terhadap data log yang diunggah.
                  </p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="border rounded-3 p-3 h-100 bg-light">
                  <p class="text-uppercase text-muted small mb-1">Langkah 3</p>
                  <h6 class="mb-1">Tinjau hasil deteksi</h6>
                  <p class="text-muted small mb-0">
                    Ringkasan statistik dan tabel detail anomali dapat dilihat pada halaman hasil.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
