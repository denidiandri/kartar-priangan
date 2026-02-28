// --- 1. FUNGSI LOAD VISI & MISI ---
async function loadVisiMisi() {
    try {
        console.log("Memulai load Visi Misi..."); // Cek di console
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data) {
            const visi = document.getElementById('tampil-visi');
            const misi = document.getElementById('tampil-misi');
            if(visi) visi.innerText = data.visi || "Visi belum diatur.";
            if(misi) misi.innerText = data.misi || "Misi belum diatur.";
            console.log("Visi Misi Berhasil!");
        }
    } catch (error) {
        console.error('Gagal memuat visi misi:', error);
    }
}

// --- 2. FUNGSI LOAD STRUKTUR ---
async function loadStruktur() {
    try {
        console.log("Memulai load Struktur...");
        const response = await fetch('/api/struktur');
        const data = await response.json();
        const container = document.getElementById('struktur-grid');
        
        if (!container) return;
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Data pengurus belum tersedia.</p>';
            return;
        }

        container.innerHTML = ''; 
        data.forEach(person => {
            // Perbaikan path foto: pastikan mengarah ke /img/produk/ karena itu folder upload lo
            let fotoPath = person.foto ? person.foto.trim() : '';
            if (fotoPath.includes('/images/')) {
                fotoPath = fotoPath.replace('/images/', '/img/produk/');
            }
            if (fotoPath && !fotoPath.startsWith('/')) {
                fotoPath = '/' + fotoPath;
            }

            container.innerHTML += `
                <div class="member-card">
                    <div class="member-img">
                        <img src="${fotoPath || '/img/produk/default.png'}" 
                             alt="${person.nama}"
                             onerror="this.src='/images/default-avatar.png';">
                    </div>
                    <div class="member-info">
                        <h4 style="font-weight: bold; color: #333;">${person.nama}</h4>
                        <p style="color: #e74c3c; font-weight: 600;">${person.jabatan}</p>
                    </div>
                </div>
            `;
        });
        console.log("Struktur Berhasil!");
    } catch (error) {
        console.error('Gagal memuat struktur:', error);
    }
}

// --- 3. EKSEKUSI LANGSUNG ---
// Tanpa nunggu DOMContentLoaded yang ribet, langsung panggil fungsinya
loadVisiMisi();
loadStruktur();