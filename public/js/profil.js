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
            container.innerHTML += `
                <div class="member-card">
                    <div class="member-img">
                        <img src="${person.foto || '/images/default-avatar.png'}" alt="${person.nama}">
                    </div>
                    <div class="member-info">
                        <h4>${person.nama}</h4>
                        <p>${person.jabatan}</p>
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