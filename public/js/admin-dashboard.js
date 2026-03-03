// admin-dashboard.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LOGIC MUNCULKAN INPUT HARGA (Hanya jika kategori KOS) ---
    const katPilihan = document.getElementById('kat-pilihan');
    const groupHarga = document.getElementById('group-harga');
    
    if (katPilihan) {
        katPilihan.onchange = function() {
            groupHarga.style.display = (this.value === 'kos') ? 'block' : 'none';
        };
    }

    // --- 2. FUNGSI LOAD DATA (Tabel) ---

    // Load Produk
    window.muatProdukAdmin = function() {
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
    };

    // Load Berita (DIPERBAIKI: URL diganti ke /api/berita-semua)
    window.muatBeritaAdmin = function() {
        fetch('/api/berita-semua').then(res => res.json()).then(data => {
            const t = document.getElementById('tabel-berita');
            if(!t) return;
            t.innerHTML = '';
            data.forEach(i => {
                t.innerHTML += `
                <tr>
                    <td>${i.judul}</td>
                    <td><span style="background: #eee; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${i.kategori}</span></td>
                    <td>
                        <button onclick="bukaModalEdit(${i.id})" style="background:none; border:none; color: #f39c12; cursor: pointer; font-weight:bold; margin-right:10px;">Edit</button>
                        <button onclick="hapusBerita(${i.id})" style="background:none; border:none; color: red; cursor: pointer;">Hapus</button>
                    </td>
                </tr>`;
            });
        }).catch(err => console.error("Gagal muat berita:", err));
    };

    // Load Struktur
    window.muatStrukturAdmin = function() {
        fetch('/api/struktur').then(res => res.json()).then(data => {
            const t = document.getElementById('tabel-struktur');
            if(!t) return;
            t.innerHTML = '';
            data.forEach(i => {
                t.innerHTML += `
                <tr>
                    <td><strong>${i.nama}</strong><br><small>${i.jabatan}</small></td>
                    <td>
                        <button onclick="bukaModalEditStruktur(${i.id})" style="background:none; border:none; color: #f39c12; cursor: pointer; font-weight:bold; margin-right:10px;">Edit</button>
                        <button onclick="hapusStruktur(${i.id})" style="background:none; border:none; color: red; cursor: pointer;">Hapus</button>
                    </td>
                </tr>`;
            });
        });
    };

    // --- 3. FUNGSI MODAL & EDIT ---

    // Edit Berita
    window.bukaModalEdit = function(id) {
        fetch(`/api/berita/${id}`)
            .then(res => {
                if(!res.ok) throw new Error("Data tidak ditemukan");
                return res.json();
            })
            .then(data => {
                document.getElementById('edit-id').value = data.id;
                document.getElementById('edit-judul').value = data.judul;
                document.getElementById('edit-kategori').value = data.kategori;
                document.getElementById('edit-isi').value = data.isi;
                document.getElementById('modalEditBerita').style.display = 'block';
            })
            .catch(err => alert("Gagal mengambil data berita: " + err.message));
    };

    window.tutupModalEdit = function() {
        document.getElementById('modalEditBerita').style.display = 'none';
    };

    // Edit Struktur
    window.bukaModalEditStruktur = function(id) {
        fetch(`/api/struktur/${id}`)
            .then(res => {
                if(!res.ok) throw new Error("Data tidak ditemukan");
                return res.json();
            })
            .then(data => {
                document.getElementById('edit-struktur-id').value = data.id;
                document.getElementById('edit-struktur-nama').value = data.nama;
                document.getElementById('edit-struktur-jabatan').value = data.jabatan;
                document.getElementById('modalEditStruktur').style.display = 'block';
            })
            .catch(err => alert("Gagal mengambil data struktur: " + err.message));
    };

    window.tutupModalEditStruktur = function() {
        document.getElementById('modalEditStruktur').style.display = 'none';
    };

    // --- 4. FUNGSI HAPUS ---

   window.hapusProduk = function(id) {
    if(confirm('Hapus produk ini?')) {
        window.location.href = `/api/hapus-produk/${id}`;
    }
};

    // DIPERBAIKI: Mengarah ke jalur /api/ sesuai news.js
    window.hapusBerita = function(id) {
        if(confirm('Hapus berita ini?')) window.location.href = `/api/hapus-berita/${id}`;
    };

    window.hapusStruktur = function(id) {
        if(confirm('Hapus anggota pengurus ini?')) window.location.href = `/api/hapus-struktur/${id}`;
    };

    window.hapusSaran = function(id) {
        if(confirm('Hapus pesan saran ini?')) window.location.href = `/api/hapus-saran/${id}`;
    };

    // --- 5. HANDLE SUBMIT FORM EDIT ---

    // Submit Berita
    const formEditBerita = document.getElementById('form-edit-berita');
    if(formEditBerita) {
        formEditBerita.onsubmit = function(e) {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const data = {
                judul: document.getElementById('edit-judul').value,
                kategori: document.getElementById('edit-kategori').value,
                isi: document.getElementById('edit-isi').value
            };
            fetch(`/api/berita/${id}`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(() => { alert('Update Berhasil!'); location.reload(); })
            .catch(err => alert("Gagal update berita"));
        };
    }

    // Submit Struktur
    const formEditStruktur = document.getElementById('form-edit-struktur');
    if(formEditStruktur) {
        formEditStruktur.onsubmit = function(e) {
            e.preventDefault();
            const id = document.getElementById('edit-struktur-id').value;
            const data = {
                nama: document.getElementById('edit-struktur-nama').value,
                jabatan: document.getElementById('edit-struktur-jabatan').value
            };
            fetch(`/api/struktur/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(() => { alert('Update Struktur Berhasil!'); location.reload(); })
            .catch(err => alert("Gagal update struktur"));
        };
    }

    // --- INITIAL LOAD ---
    muatProdukAdmin();
    muatBeritaAdmin();
    muatStrukturAdmin();

    // Load Settings & Saran
    fetch('/api/settings').then(res => res.json()).then(data => {
        if(data) {
            if(document.getElementById('set-alamat')) document.getElementById('set-alamat').value = data.alamat || '';
            if(document.getElementById('set-wa')) document.getElementById('set-wa').value = data.whatsapp || '';
            if(document.getElementById('set-email')) document.getElementById('set-email').value = data.email || '';
            if(document.getElementById('set-sosmed')) document.getElementById('set-sosmed').value = data.sosmed || ''; 
            if(document.getElementById('set-maps')) document.getElementById('set-maps').value = data.maps_link || '';
            if(document.getElementById('set-visi')) document.getElementById('set-visi').value = data.visi || '';
            if(document.getElementById('set-misi')) document.getElementById('set-misi').value = data.misi || '';
        }
    });

    fetch('/api/saran').then(res => res.json()).then(data => {
        const t = document.getElementById('tabel-saran');
        if(t) {
            t.innerHTML = data.map(i => `<tr><td>${i.nama}</td><td>${i.isi_saran}</td><td><button onclick="hapusSaran(${i.id})" style="background:none; border:none; color: red; cursor: pointer;">Hapus</button></td></tr>`).join('');
        }
    });
});