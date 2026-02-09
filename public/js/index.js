// --- Kodingan Update (Lebih Efisien & Bisa Diklik) ---
async function fetchHomeNews() {
    try {
        // Panggil API yang sudah kita batasi 5 berita di backend tadi
        const response = await fetch('/api/berita-terbaru');
        const data = await response.json();
        const container = document.getElementById('home-news-grid');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p>Belum ada berita untuk ditampilkan.</p>';
            return;
        }

        container.innerHTML = ''; 
        
        // Kita pakai data langsung karena di backend sudah di-limit 5
        data.forEach(item => {
            container.innerHTML += `
                <div class="news-card">
                    <div class="news-img-box">
                        <img src="${item.gambar || '/images/default-news.jpg'}" alt="Berita">
                    </div>
                    <div class="news-info">
                        <small style="color: #e74c3c; font-weight: bold;">${item.kategori.toUpperCase()}</small>
                        <small> | ${new Date(item.tanggal).toLocaleDateString('id-ID')}</small>
                        <h4>${item.judul}</h4>
                        <p>${item.isi.substring(0, 80)}...</p>
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