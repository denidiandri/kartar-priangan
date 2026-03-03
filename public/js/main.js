document.addEventListener('DOMContentLoaded', () => {
    // --- 1. LOGIKA NAVIGASI (HAMBURGER & DROPDOWN) ---
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');

    // Fungsi untuk menutup semua menu (Reset)
    const closeAllMenus = () => {
        if (menu) menu.classList.remove('active');
        if (btn) btn.classList.remove('active');
        dropdowns.forEach(dd => dd.classList.remove('show'));
    };

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
                // Jika klik pada menu induk yang href="#"
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

    // Reset menu saat link tujuan diklik (Biar gak macet saat pindah halaman)
    const navLinks = document.querySelectorAll('#nav-menu a');
    navLinks.forEach(link => {
        link.onclick = () => {
            if (link.getAttribute('href') !== '#') {
                closeAllMenus();
            }
        };
    });

    // Klik luar untuk tutup menu
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
            closeAllMenus();
        }
    });

    // --- 2. LOGIKA DETEKSI LOGIN ---
    fetch('/api/user-status')
    .then(res => res.json())
    .then(data => {
        const authMenu = document.getElementById('menu-admin') || document.getElementById('menu-auth');
        if (authMenu && data.isLoggedIn) {
    authMenu.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.1); padding: 5px 15px; border-radius: 20px; border: 1px solid #ffcc00;">
            <a href="/admin-dashboard" style="color: #ffcc00; font-weight: bold; text-decoration: none; font-size: 0.9rem;">ADMIN</a>
            <span style="color: #ccc;">|</span>
            <a href="/logout" style="color: #ff4d4d; text-decoration: none; font-size: 0.8rem; font-weight: bold;">LOGOUT</a>
        </div>
    `;
}   })
    .catch(err => console.error("Gagal cek status login:", err));
});