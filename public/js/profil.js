// --- LOAD VISI & MISI DARI DATABASE ---
async function loadVisiMisi() {
    try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data) {
            const visi = document.getElementById('tampil-visi');
            const misi = document.getElementById('tampil-misi');
            if(visi) visi.innerText = data.visi || "Visi belum diatur.";
            if(misi) misi.innerText = data.misi || "Misi belum diatur.";
        }
    } catch (error) {
        console.error('Gagal memuat visi misi:', error);
    }
}

// --- LOAD STRUKTUR ORGANISASI ---
async function loadStruktur() {
    try {
        const response = await fetch('/api/struktur');
        const data = await response.json();
        const container = document.getElementById('struktur-grid');
        
        if (!container) return;
        if (data.length === 0) {
            container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Data pengurus belum tersedia.</p>';
            return;
        }

        container.innerHTML = ''; 
        data.forEach(person => {
            // 1. Ambil data foto dan bersihkan spasi (trim)
            let rawPath = person.foto ? person.foto.trim() : '';
            
            // 2. LOGIC FIX: Ganti '/images/' menjadi '/img/produk/' 
            // karena file kamu masuknya ke folder 'img/produk'
            let fotoPath = rawPath.replace('/images/', '/img/produk/');

            // 3. Jika path tidak diawali '/', tambahkan folder yang benar
            if (fotoPath && !fotoPath.startsWith('/')) {
                fotoPath = '/img/produk/' + fotoPath;
            }

            container.innerHTML += `
                <div class="member-card">
                    <div class="member-img">
                        <img src="${fotoPath || '/img/produk/default.png'}" 
                             alt="${person.nama}"
                             onerror="this.onerror=null;this.src='/images/default-avatar.png';">
                    </div>
                    <div class="member-info">
                        <h4 style="font-weight: bold; color: #333;">${person.nama}</h4>
                        <p style="color: #e74c3c; font-weight: 600;">${person.jabatan}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Gagal memuat struktur:', error);
        const container = document.getElementById('struktur-grid');
        if(container) container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Gagal memuat data.</p>';
    }
}
// Jalankan fungsi saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
    loadVisiMisi();
    loadStruktur();
});