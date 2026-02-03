document.addEventListener('DOMContentLoaded', () => {
    // 1. Logika Hamburger Menu
    const btn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('nav-menu');

    if (btn && menu) {
        btn.onclick = () => {
            menu.classList.toggle('active');
            btn.classList.toggle('active');
        };
    }

    // 2. Logika Deteksi Login (Update Navbar)
    fetch('/api/user-status')
        .then(res => res.json())
        .then(user => {
            // KUNCI PERBAIKAN: Cari ID 'menu-admin' ATAU 'menu-auth'
            const authMenu = document.getElementById('menu-admin') || document.getElementById('menu-auth');
            
            if (authMenu && user.isLoggedIn) {
                authMenu.innerHTML = `<a href="/admin-dashboard" style="color: #ff4d4d; font-weight: bold;">DASHBOARD ADMIN</a>`;
            }
        })
        .catch(err => console.error("Gagal cek status login:", err));
});