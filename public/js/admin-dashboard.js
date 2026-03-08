// admin-dashboard.js

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. LOGIC INPUT HARGA (Hanya jika kategori KOS) ---
    const katPilihan = document.getElementById('kat-pilihan');
    const groupHarga = document.getElementById('group-harga');
    
    if (katPilihan && groupHarga) {
        katPilihan.onchange = function() {
            groupHarga.style.display = (this.value === 'kos') ? 'block' : 'none';
        };
    }

    // --- 2. FUNGSI LOAD DATA (TABEL) ---

    // Load Produk
    window.muatProdukAdmin = function() {
        fetch('/api/produk')
            .then(res => res.json())
            .then(data => {
                const t = document.getElementById('tabel-produk'); 
                if (!t) return;
                t.innerHTML = data.map(i => `
                    <tr>
                        <td><strong>${i.nama_produk}</strong></td>
                        <td><span style="background: #eee; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${i.kategori}</span></td>
                        <td>
                            <button onclick="hapusProduk(${i.id})" style="background:none; border:none; color: red; cursor: pointer; font-weight: bold;">Hapus</button>
                        </td>
                    </tr>`).join('');
            })
            .catch(err => console.error("Gagal muat produk:", err));
    };

    // Load Berita
    window.muatBeritaAdmin = function() {
        fetch('/api/berita-semua')
            .then(res => res.json())
            .then(data => {
                const t = document.getElementById('tabel-berita');
                if(!t) return;
                t.innerHTML = data.map(i => `
                    <tr>
                        <td>${i.judul}</td>
                        <td><span style="background: #eee; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${i.kategori}</span></td>
                        <td>
                            <button onclick="bukaModalEdit(${i.id})" style="background:none; border:none; color: #f39c12; cursor: pointer; font-weight:bold; margin-right:10px;">Edit</button>
                            <button onclick="hapusBerita(${i.id})" style="background:none; border:none; color: red; cursor: pointer;">Hapus</button>
                        </td>
                    </tr>`).join('');
            }).catch(err => console.error("Gagal muat berita:", err));
    };

    // Load Struktur
    window.muatStrukturAdmin = function() {
        fetch('/api/struktur')
            .then(res => res.json())
            .then(data => {
                const t = document.getElementById('tabel-struktur');
                if(!t) return;
                t.innerHTML = data.map(i => `
                    <tr>
                        <td><strong>${i.nama}</strong><br><small>${i.jabatan}</small></td>
                        <td>
                            <button onclick="bukaModalEditStruktur(${i.id})" style="background:none; border:none; color: #f39c12; cursor: pointer; font-weight:bold; margin-right:10px;">Edit</button>
                            <button onclick="hapusStruktur(${i.id})" style="background:none; border:none; color: red; cursor: pointer;">Hapus</button>
                        </td>
                    </tr>`).join('');
            });
    };

    // --- 3. FUNGSI MODAL & AMBIL DATA EDIT ---

    // Modal Berita
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
            .catch(err => alert("Gagal mengambil data: " + err.message));
    };

    window.tutupModalEdit = function() {
        document.getElementById('modalEditBerita').style.display = 'none';
    };

    // Modal Struktur
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
            .catch(err => alert("Gagal mengambil data: " + err.message));
    };

    window.tutupModalEditStruktur = function() {
        document.getElementById('modalEditStruktur').style.display = 'none';
    };

    // --- 4. FUNGSI HAPUS (Gunakan fetch agar tidak pindah halaman) ---

    window.hapusProduk = function(id) {
        if(confirm('Hapus produk ini?')) {
            fetch(`/api/hapus-produk/${id}`).then(() => location.reload());
        }
    };

    window.hapusBerita = function(id) {
        if(confirm('Hapus berita ini?')) {
            fetch(`/api/hapus-berita/${id}`).then(() => location.reload());
        }
    };

    window.hapusStruktur = function(id) {
        if(confirm('Hapus pengurus ini?')) {
            fetch(`/api/hapus-struktur/${id}`).then(() => location.reload());
        }
    };

    window.hapusSaran = function(id) {
        if(confirm('Hapus pesan ini?')) {
            fetch(`/api/hapus-saran/${id}`).then(() => location.reload());
        }
    };

    // --- 5. HANDLE SUBMIT FORM EDIT ---

    // Submit Edit Berita
    const formEditBerita = document.getElementById('form-edit-berita');
    if(formEditBerita) {
        formEditBerita.onsubmit = function(e) {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const payload = {
                judul: document.getElementById('edit-judul').value,
                kategori: document.getElementById('edit-kategori').value,
                isi: document.getElementById('edit-isi').value
            };
            fetch(`/api/berita/${id}`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(() => { alert('Update Berhasil!'); location.reload(); })
            .catch(() => alert("Gagal update berita"));
        };
    }

    // Submit Edit Struktur (VERSI FIX)
    const formEditStruktur = document.getElementById('form-edit-struktur');
    if(formEditStruktur) {
        formEditStruktur.onsubmit = function(e) {
            e.preventDefault();
            const payload = {
                id: document.getElementById('edit-struktur-id').value,
                nama: document.getElementById('edit-struktur-nama').value,
                jabatan: document.getElementById('edit-struktur-jabatan').value
            };
            
            fetch('/api/struktur/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(result => { 
                if(result.success || result.message) {
                    alert('✅ Update Struktur Berhasil!'); 
                    location.reload(); 
                } else {
                    alert('❌ Gagal: ' + (result.error || 'Terjadi kesalahan'));
                }
            })
            .catch(err => {
                console.error(err);
                alert("❌ Gagal koneksi ke server");
            });
        };
    }

    // --- 6. INITIAL LOAD & LAIN-LAIN ---
    muatProdukAdmin();
    muatBeritaAdmin();
    muatStrukturAdmin();

    // Load Settings
    fetch('/api/settings').then(res => res.json()).then(data => {
        if(data) {
            const fields = {
                'set-alamat': data.alamat,
                'set-wa': data.whatsapp,
                'set-email': data.email,
                'set-sosmed': data.sosmed,
                'set-maps': data.maps_link,
                'set-visi': data.visi,
                'set-misi': data.misi
            };
            for (let id in fields) {
                const el = document.getElementById(id);
                if(el) el.value = fields[id] || '';
            }
        }
    });

    // Load Saran
    fetch('/api/saran').then(res => res.json()).then(data => {
        const t = document.getElementById('tabel-saran');
        if(t) {
            t.innerHTML = data.map(i => `
                <tr>
                    <td>${i.nama}</td>
                    <td>${i.isi_saran}</td>
                    <td><button onclick="hapusSaran(${i.id})" style="background:none; border:none; color: red; cursor: pointer;">Hapus</button></td>
                </tr>`).join('');
        }
    });
});