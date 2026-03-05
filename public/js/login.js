document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const btnLogin = document.getElementById('btn-login');
    const errorMsg = document.getElementById('error-msg');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Mencegah reload halaman

        // Animasi Loading agar user tahu sedang diproses
        const originalText = btnLogin.innerText;
        btnLogin.innerText = "Mengecek...";
        btnLogin.disabled = true;
        btnLogin.style.opacity = "0.7";
        errorMsg.innerText = "";

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // PERBAIKAN: URL diubah ke /auth/auth-login agar sinkron dengan server.js
            const response = await fetch('/auth/auth-login', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            // Mengecek apakah responsnya benar-benar JSON
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new TypeError("Respons server bukan JSON! Pastikan URL benar.");
            }

            const result = await response.json();

            if (response.ok) {
                // Berhasil! Pindah ke dashboard
                window.location.href = '/admin-dashboard';
            } else {
                // Gagal! Tampilkan pesan dari backend (Password salah, dll)
                errorMsg.innerText = result.message || "Username atau Password salah!";
                
                // Kembalikan tombol ke semula
                btnLogin.innerText = originalText;
                btnLogin.disabled = false;
                btnLogin.style.opacity = "1";
            }
        } catch (error) {
            console.error("Error Login:", error);
            // Menampilkan pesan error jika server mati atau salah URL
            errorMsg.innerText = "Gagal terhubung ke server. Pastikan alamat benar.";
            
            btnLogin.innerText = originalText;
            btnLogin.disabled = false;
            btnLogin.style.opacity = "1";
        }
    });
});