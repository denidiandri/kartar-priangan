document.addEventListener('DOMContentLoaded', () => {
    // 1. Logika Hamburger Menu (TETAP & SUDAH BENER)
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    if (btn && menu) {
        btn.onclick = (e) => {
            e.stopPropagation(); // Mencegah klik tembus ke bawah
            menu.classList.toggle('active');
            btn.classList.toggle('active');
        };
    }

    // --- TAMBAHAN KHUSUS DROPDOWN (AGAR BISA DIKLIK DI HP) ---
    dropdowns.forEach(dd => {
        dd.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                const linkUtama = this.querySelector('a');
                
                // Jika klik pada menu yang punya sub-menu (href="#")
                if (e.target === linkUtama && linkUtama.getAttribute('href') === '#') {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Tutup dropdown lain yang sedang terbuka
                    dropdowns.forEach(other => {
                        if (other !== this) other.classList.remove('show');
                    });

                    // Buka/tutup dropdown yang diklik
                    this.classList.toggle('show');
                }
            }
        });
    });

    // Klik di mana saja untuk menutup menu yang sedang terbuka
    document.addEventListener('click', () => {
        if (menu) menu.classList.remove('active');
        if (btn) btn.classList.remove('active');
        dropdowns.forEach(dd => dd.classList.remove('show'));
    });
    // --- AKHIR TAMBAHAN DROPDOWN ---

    // 2. Logika Deteksi Login (TETAP & SUDAH BENER)
    fetch('/api/user-status')
        .then(res => res.json())
        .then(user => {
            const authMenu = document.getElementById('menu-admin') || document.getElementById('menu-auth');
            
            if (authMenu && user.isLoggedIn) {
                authMenu.innerHTML = `<a href="/admin-dashboard" style="color: #ff4d4d; font-weight: bold;">DASHBOARD ADMIN</a>`;
            }
        })
        .catch(err => console.error("Gagal cek status login:", err));
});