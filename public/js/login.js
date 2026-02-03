document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const btnLogin = document.getElementById('btn-login');
    const errorMsg = document.getElementById('error-msg');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Mencegah reload halaman

        // Animasi Loading
        const originalText = btnLogin.innerText;
        btnLogin.innerText = "Mengecek...";
        btnLogin.disabled = true;
        btnLogin.style.opacity = "0.7";
        errorMsg.innerText = "";

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/auth-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok) {
                // Berhasil! Pindah ke dashboard
                window.location.href = '/admin-dashboard';
            } else {
                // Gagal! Tampilkan pesan tanpa pindah halaman
                errorMsg.innerText = result.message || "Username atau Password salah!";
                
                // Kembalikan tombol ke semula
                btnLogin.innerText = originalText;
                btnLogin.disabled = false;
                btnLogin.style.opacity = "1";
            }
        } catch (error) {
            console.error("Error:", error);
            errorMsg.innerText = "Koneksi ke server terputus.";
            btnLogin.innerText = originalText;
            btnLogin.disabled = false;
            btnLogin.style.opacity = "1";
        }
    });
});