// --- Kodingan Update (Lebih Aman & Anti-Crash) ---
async function fetchHomeNews() {
    try {
        const response = await fetch('/api/berita-terbaru');
        const data = await response.json();
        const container = document.getElementById('home-news-grid');
        
        if (!container) return; // Tambahan: Biar gak error kalau element gak ada di page lain

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Belum ada berita untuk ditampilkan.</p>';
            return;
        }

        container.innerHTML = ''; 
        
        data.forEach(item => {
            // FIX: Tambahkan pengaman agar tidak error .toUpperCase() atau .substring() jika data null
            const kategoriSafe = (item.kategori || 'Umum').toUpperCase();
            const isiSafe = (item.isi || '').substring(0, 80);
            const gambarSafe = item.gambar || '/images/default-news.jpg';

            container.innerHTML += `
                <div class="news-card">
                    <div class="news-img-box">
                        <img src="${gambarSafe}" alt="Berita" onerror="this.src='/images/default-news.jpg'">
                    </div>
                    <div class="news-info">
                        <small style="color: #e74c3c; font-weight: bold;">${kategoriSafe}</small>
                        <small> | ${item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'}</small>
                        <h4>${item.judul || 'Tanpa Judul'}</h4>
                        <p>${isiSafe}...</p>
                        <a href="/baca-berita/${item.id}" style="display: inline-block; margin-top: 10px; color: #3498db; text-decoration: none; font-weight: bold; font-size: 0.9rem;">Baca Selengkapnya →</a>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error("Gagal load berita:", err);
    }
}

fetchHomeNews();