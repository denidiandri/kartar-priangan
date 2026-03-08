async function loadContactInfo() {
    try {
        const response = await fetch('/api/settings');
        const data = await response.json();

        if (data) {
            // Pastiin elemennya ada dulu baru diisi (biar gak macet)
            const elAlamat = document.getElementById('info-alamat');
            const elWa = document.getElementById('info-wa');
            const elEmail = document.getElementById('info-email');
            const elIg = document.getElementById('info-ig');
            const mapsIframe = document.getElementById('info-maps');

            if(elAlamat) elAlamat.innerText = data.alamat || '-';
            if(elWa) elWa.innerText = data.whatsapp || '-';
            if(elEmail) elEmail.innerText = data.email || '-';
            
            if (elIg) {
                elIg.innerText = data.sosmed || '-';
                elIg.style.whiteSpace = "pre-line"; 
            }
            
            // Logika Maps yang lebih galak
            if(mapsIframe && data.maps_link) {
                if(data.maps_link.includes('src="')) {
                    const match = data.maps_link.match(/src="([^"]+)"/);
                    if(match) mapsIframe.src = match[1];
                } else {
                    mapsIframe.src = data.maps_link;
                }
            }
        }
    } catch (error) {
        console.error('Gagal memuat data kontak:', error);
    }
}

// --- KODE BARU: KIRIM FORM KONTAK KE DATABASE ---
const formSaran = document.getElementById('contact-form'); // Pastikan ID form di HTML lo adalah 'contact-form'

if (formSaran) {
    formSaran.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Ambil data dari input
        const formData = {
            nama: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subjek: document.getElementById('subject').value,
            pesan: document.getElementById('message').value
        };

        try {
            const response = await fetch('/api/kirim-saran', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                alert('Pesan Anda berhasil dikirim!');
                formSaran.reset(); // Kosongkan form setelah sukses
            } else {
                alert('Gagal mengirim pesan: ' + (result.error || 'Server error'));
            }
        } catch (error) {
            console.error('Error saat kirim saran:', error);
            alert('Terjadi kesalahan koneksi ke server.');
        }
    });
}

loadContactInfo();