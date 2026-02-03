// 1. Ambil URL Path
const path = window.location.pathname;
const slug = path.split('/').pop(); // Bisa jadi 'umum' atau angka '3'
const container = document.getElementById('konten-berita');

// 2. CEK: Apakah ini halaman baca berita atau daftar kategori?
if (path.includes('baca-berita')) {
    // --- MODE BACA BERITA (DETAIL) ---
    fetch(`/api/berita/${slug}`)
        .then(res => res.json())
        .then(i => {
            document.getElementById('judul-kategori').innerText = i.judul;
            container.innerHTML = `
                <div style="max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <img src="${i.gambar}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">
                    <div style="margin-bottom: 10px;">
                        <small style="color: #e74c3c; font-weight: bold;">${i.kategori.toUpperCase()}</small>
                        <small style="color: #666; margin-left: 10px;">${new Date(i.tanggal).toLocaleDateString('id-ID')}</small>
                    </div>
                    <div style="line-height: 1.8; color: #333; font-size: 1.1rem; white-space: pre-line;">
                        ${i.isi}
                    </div>
                    <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
                    <a href="javascript:history.back()" style="color: #3498db; text-decoration: none; font-weight: bold;">← Kembali</a>
                </div>
            `;
        });
} else {
    // --- MODE DAFTAR KATEGORI ---
    document.getElementById('judul-kategori').innerText = "Kategori: " + slug;
    
    fetch(`/api/berita/kategori/${slug}`)
        .then(res => res.json())
        .then(data => {
            if(data.length === 0) {
                container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 100px 20px; color: #666;'>Belum ada berita di kategori ini.</p>";
                return;
            }
            container.innerHTML = '';
            data.forEach(i => {
                container.innerHTML += `
                    <div class="news-card">
                        <div class="news-img-box">
                            <img src="${i.gambar}" alt="Gambar">
                        </div>
                        <div class="news-info">
                            <small style="color: #e74c3c; font-weight: bold;">${i.kategori.toUpperCase()}</small>
                            <h3>${i.judul}</h3>
                            <p>${i.isi.substring(0, 100)}...</p>
                            <a href="/baca-berita/${i.id}" class="btn-read-more">Baca Selengkapnya</a>
                        </div>
                    </div>
                `;
            });
        });
}