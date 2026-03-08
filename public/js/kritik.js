document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Mencegah halaman refresh

        const formData = {
            nama: document.querySelector('input[name="nama"]').value,
            isi_saran: document.querySelector('textarea[name="isi_saran"]').value
        };

        try {
            // Jika Anda menggunakan prefix /api di server.js, gunakan /api/kirim-saran
            const response = await fetch('/api/kirim-saran', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                alert('Terima kasih! Saran Anda telah terkirim.');
                form.reset();
            } else {
                alert('Gagal mengirim saran.');
            }
        } catch (error) {
            console.error("Error:", error);
            alert('Terjadi kesalahan koneksi.');
        }
    });
});