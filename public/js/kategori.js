document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LOGIKA NAVIGASI (HAMBURGER & DROPDOWN) ---
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (btn && menu) {
        btn.onclick = (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
            btn.classList.toggle('active');
        };
    }

    // Logika Dropdown klik di Mobile
    dropdowns.forEach(dd => {
        dd.onclick = function(e) {
            if (window.innerWidth <= 768) {
                const linkUtama = this.querySelector('a');
                // Jika yang diklik adalah link "Berita" atau "Lapak Warga" (href="#")
                if (e.target === linkUtama && linkUtama.getAttribute('href') === '#') {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Tutup dropdown lain
                    dropdowns.forEach(other => {
                        if (other !== this) other.classList.remove('show');
                    });

                    this.classList.toggle('show');
                }
            }
        };
    });

    // Klik luar untuk tutup menu
    document.onclick = () => {
        if(menu) menu.classList.remove('active');
        if(btn) btn.classList.remove('active');
        dropdowns.forEach(dd => dd.classList.remove('show'));
    };

    // --- 2. LOGIKA DETEKSI LOGIN ---
    fetch('/api/user-status')
        .then(res => res.json())
        .then(user => {
            const authMenu = document.getElementById('menu-admin') || document.getElementById('menu-auth');
            if (authMenu && user.isLoggedIn) {
                authMenu.innerHTML = `<a href="/admin-dashboard" style="color: #ff4d4d; font-weight: bold;">DASHBOARD ADMIN</a>`;
            }
        })
        .catch(err => console.error("Gagal cek status login:", err));

    // --- 3. LOGIKA BERITA ASLI (API) ---
    const path = window.location.pathname;
    let slug = path.split('/').pop(); 
    const container = document.getElementById('konten-berita');

    if (!slug || path === '/kos') slug = 'kos';

    if (path.includes('baca-berita')) {
        fetch(`/api/berita/${slug}`)
            .then(res => res.json())
            .then(i => {
                const judulKat = document.getElementById('judul-kategori');
                if(judulKat) judulKat.innerText = i.judul;
                if(container) {
                    container.innerHTML = `
                        <div style="max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            <img src="${i.gambar}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">
                            <div style="margin-bottom: 10px;">
                                <small style="color: #e74c3c; font-weight: bold;">${i.kategori.toUpperCase()}</small>
                                <small style="color: #666; margin-left: 10px;">${new Date(i.tanggal).toLocaleDateString('id-ID')}</small>
                            </div>
                            <div style="line-height: 1.8; color: #333; font-size: 1.1rem; white-space: pre-line;">${i.isi}</div>
                            <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
                            <a href="javascript:history.back()" style="color: #3498db; text-decoration: none; font-weight: bold;">← Kembali</a>
                        </div>`;
                }
            });
    } else {
        let judulHeader = (slug === 'kos') ? "Info Kos-kosan" : (slug === 'semua') ? "Semua Berita Terbaru" : "Kategori: " + slug;
        const judulKat = document.getElementById('judul-kategori');
        if(judulKat) judulKat.innerText = judulHeader;
        
        let apiUrl = (slug === 'kos') ? '/api/kos' : (slug === 'semua') ? '/api/berita-semua' : `/api/berita/kategori/${slug}`;
        
        fetch(apiUrl).then(res => res.json()).then(data => {
            if(!container) return;
            if(!data || data.length === 0) {
                container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 100px 20px; color: #666;'>Belum ada berita.</p>";
                return;
            }
            container.innerHTML = '';
            data.forEach(i => {
                container.innerHTML += `
                    <div class="news-card">
                        <div class="news-img-box"><img src="${i.gambar}" alt="Gambar"></div>
                        <div class="news-info">
                            <small style="color: #e74c3c; font-weight: bold;">${i.kategori.toUpperCase()}</small>
                            <h3>${i.judul}</h3>
                            <p>${i.isi.substring(0, 100)}...</p>
                            <a href="/baca-berita/${i.id}" class="btn-read-more">Baca Selengkapnya</a>
                        </div>
                    </div>`;
            });
        });
    }
});