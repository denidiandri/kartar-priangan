document.addEventListener('DOMContentLoaded', () => {
    // --- 1. KODE NAVIGASI & DROPDOWN ---
    const hamburger = document.getElementById('hamburger-btn');
    const nav = document.getElementById('nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    document.addEventListener('click', () => {
        if (nav) nav.classList.remove('active');
        dropdowns.forEach(dd => dd.classList.remove('show'));
    });

    // --- 2. KODE BERITA ASLI (LOGIKA API KATEGORI) ---
    const path = window.location.pathname;
    let slug = path.split('/').pop(); 
    const container = document.getElementById('konten-berita');

    if (!slug || path === '/kos') {
        slug = 'kos';
    }

    if (path.includes('baca-berita')) {
        // MODE BACA BERITA (DETAIL)
        fetch(`/api/berita/${slug}`)
            .then(res => res.json())
            .then(i => {
                const judulKat = document.getElementById('judul-kategori');
                if(judulKat) judulKat.style.display = 'none'; 

                if(container) {
                    container.style.display = 'block'; 
                    container.style.width = '100%';

                    // Cek apakah kategori loker untuk memunculkan tombol WA di detail
                    const tombolWA = (i.kategori.toLowerCase() === 'loker') ? `
                        <div style="margin: 20px 0;">
                            <a href="https://wa.me/6282315483006?text=Halo%20Admin%20Kartar%2C%20saya%20ingin%20melamar%3A%20*${i.judul}*" 
                               class="btn-wa-loker" target="_blank" style="display: inline-flex; align-items: center; background: #25d366; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                               <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="20" style="margin-right: 10px;"> 
                               Kirim CV Ke Admin via WhatsApp
                            </a>
                        </div>
                    ` : '';

                    container.innerHTML = `
                        <div class="read-news-wrapper">
                            <article class="news-detail-full">
                                <h1 class="news-main-title">${i.judul}</h1>
                                
                                <div class="news-meta-info">
                                    <span class="badge-kat">${i.kategori.toUpperCase()}</span>
                                    <span class="news-date">${new Date(i.tanggal).toLocaleDateString('id-ID')}</span>
                                </div>

                                <div class="news-image-main">
                                    <img src="${i.gambar}" alt="${i.judul}">
                                </div>

                                <div class="news-body-content">
                                    ${i.isi}
                                </div>

                                ${tombolWA}

                                <hr class="news-divider">
                                <a href="javascript:history.back()" class="btn-back-link">← Kembali ke Berita</a>
                            </article>
                        </div>
                    `;
                }
            });
    } else {
        // MODE DAFTAR KATEGORI
        let judulHeader = "Kategori: " + slug;
        if (slug === 'kos') judulHeader = "Info Kos-kosan";
        if (slug === 'semua') judulHeader = "Semua Berita Terbaru";
        
        const judulKat = document.getElementById('judul-kategori');
        if(judulKat) {
            judulKat.innerText = judulHeader;
            judulKat.style.display = 'block';
        }

        if(container) container.style.display = 'grid'; 
        
        let apiUrl = `/api/berita/kategori/${slug}`;
        if (slug === 'kos') apiUrl = '/api/kos';
        if (slug === 'semua') apiUrl = '/api/berita-semua';
        
        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                if(!container) return;
                if(!data || data.length === 0) {
                    container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 100px 20px; color: #666;'>Belum ada berita untuk ditampilkan.</p>";
                    return;
                }
                container.innerHTML = '';
                data.forEach(i => {
                    // Cek apakah kategori loker untuk tombol di kartu berita
                    const tombolWA = (i.kategori.toLowerCase() === 'loker') ? `
                        <a href="https://wa.me/6282315483006?text=Halo%20Admin%20Kartar%2C%20saya%20tertarik%20melamar%3A%20*${i.judul}*" 
                           class="btn-wa-loker" target="_blank" style="display: flex; align-items: center; justify-content: center; background: #25d366; color: white; padding: 8px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px; font-size: 0.8rem;">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="16" style="margin-right: 8px;"> Kirim CV Ke Admin
                        </a>
                    ` : '';

                    container.innerHTML += `
                        <div class="news-card">
                            <div class="news-img-box">
                                <img src="${i.gambar}" alt="Gambar">
                            </div>
                            <div class="news-info">
                                <small style="color: #e74c3c; font-weight: bold;">${i.kategori.toUpperCase()}</small>
                                ${i.harga ? `<br><small style="color: #27ae60; font-weight: bold;">${i.harga}</small>` : ''}
                                <h3>${i.judul}</h3>
                                <p>${i.isi.substring(0, 100)}...</p>
                                <a href="/baca-berita/${i.id}" class="btn-read-more">Baca Selengkapnya</a>
                                ${tombolWA}
                            </div>
                        </div>
                    `;
                });
            })
            .catch(err => console.error("Error load kategori:", err));
    }
});