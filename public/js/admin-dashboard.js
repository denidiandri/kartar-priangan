// admin-dashboard.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LOGIC MUNCULKAN INPUT HARGA (Hanya jika kategori KOS) ---
    const katPilihan = document.getElementById('kat-pilihan');
    const groupHarga = document.getElementById('group-harga');
    
    if (katPilihan) {
        katPilihan.onchange = function() {
            if(this.value === 'kos') {
                groupHarga.style.display = 'block';
            } else {
                groupHarga.style.display = 'none';
            }
        };
    }

    // --- 2. LOAD DAFTAR PRODUK (LAPAK) ---
    function muatProdukAdmin() {
        fetch('/api/produk')
            .then(res => res.json())
            .then(data => {
                const t = document.getElementById('tabel-produk'); 
                if (!t) return;
                t.innerHTML = ''; 
                data.forEach(i => {
                    t.innerHTML += `
                    <tr>
                        <td><strong>${i.nama_produk}</strong></td>
                        <td><span style="background: #eee; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${i.kategori}</span></td>
                        <td>
                            <button onclick="hapusProduk(${i.id})" style="background:none; border:none; color: red; cursor: pointer; font-weight: bold;">Hapus</button>
                        </td>
                    </tr>`;
                });
            })
            .catch(err => console.error("Gagal muat produk:", err));
    }

    // --- 3. FUNGSI HAPUS GLOBAL ---

// Hapus Produk
window.hapusProduk = function(id) {
    if(confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        fetch(`/api/produk/${id}`, { method: 'DELETE' })
            .then(res => {
                if(res.ok) {
                    alert('Produk berhasil dihapus');
                    // Panggil fungsi muat data lagi biar tabel update otomatis tanpa refresh
                    location.reload(); 
                } else {
                    alert('Gagal menghapus produk');
                }
            })
            .catch(err => console.error("Error:", err));
    }
};

// Hapus Berita / Kos
window.hapusBerita = function(id) {
    if(confirm('Hapus berita ini?')) {
        // Sudah benar: diarahkan ke route GET di news.js
        window.location.href = `/hapus-berita/${id}`;
    }
};

// Hapus Struktur (PERBAIKAN DI SINI)
window.hapusStruktur = function(id) {
    if(confirm('Hapus anggota pengurus ini?')) {
        // Kita ubah dari fetch DELETE menjadi redirect ke route GET yang sudah kita buat
        window.location.href = `/hapus-struktur/${id}`;
    }
};

// Hapus Saran
window.hapusSaran = function(id) {
    if(confirm('Hapus pesan saran ini?')) {
        // Pastikan di backend ada router.get('/hapus-saran/:id') atau sesuaikan
        window.location.href = `/hapus-saran/${id}`;
    }
};
    // --- 4. LOAD DATA LAINNYA ---

    // Load Settings
    fetch('/api/settings').then(res => res.json()).then(data => {
        if(data) {
            document.getElementById('set-alamat').value = data.alamat || '';
            document.getElementById('set-wa').value = data.whatsapp || '';
            document.getElementById('set-email').value = data.email || '';
            document.getElementById('set-sosmed').value = data.sosmed || ''; 
            document.getElementById('set-maps').value = data.maps_link || '';
            document.getElementById('set-visi').value = data.visi || '';
            document.getElementById('set-misi').value = data.misi || '';
        }
    });

    // Load Berita
    fetch('/api/berita').then(res => res.json()).then(data => {
        const t = document.getElementById('tabel-berita');
        if(!t) return;
        t.innerHTML = '';
        data.forEach(i => {
            t.innerHTML += `
            <tr>
                <td>${i.judul}</td>
                <td><span style="background: #eee; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${i.kategori}</span></td>
                <td><button onclick="hapusBerita(${i.id})" style="background:none; border:none; color: red; cursor: pointer;">Hapus</button></td>
            </tr>`;
        });
    });

    // Load Struktur
    fetch('/api/struktur').then(res => res.json()).then(data => {
        const t = document.getElementById('tabel-struktur');
        if(!t) return;
        t.innerHTML = '';
        data.forEach(i => {
            t.innerHTML += `<tr><td>${i.nama} (${i.jabatan})</td><td><button onclick="hapusStruktur(${i.id})" style="background:none; border:none; color: red; cursor: pointer;">Hapus</button></td></tr>`;
        });
    });

    // Load Saran
    fetch('/api/saran').then(res => res.json()).then(data => {
        const t = document.getElementById('tabel-saran');
        if(!t) return;
        t.innerHTML = '';
        data.forEach(i => {
            t.innerHTML += `<tr><td>${i.nama}</td><td>${i.isi_saran}</td><td><button onclick="hapusSaran(${i.id})" style="background:none; border:none; color: red; cursor: pointer;">Hapus</button></td></tr>`;
        });
    });

    // --- 5. VALIDASI FOTO ---
    const uploadField = document.getElementById("input-foto-produk");
    if(uploadField) {
        uploadField.onchange = function() {
            if(this.files.length > 5) {
               alert("Maaf, maksimal hanya boleh upload 5 foto saja.");
               this.value = "";
            }
        };
    }

    // Jalankan pertama kali
    muatProdukAdmin();
});