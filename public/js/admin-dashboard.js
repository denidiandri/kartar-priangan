
       
        // LOGIC MUNCULKAN INPUT HARGA
        const katPilihan = document.getElementById('kat-pilihan');
        const groupHarga = document.getElementById('group-harga');
        
        katPilihan.onchange = function() {
            if(this.value === 'kos') {
                groupHarga.style.display = 'block';
            } else {
                groupHarga.style.display = 'none';
            }
        };

        // Load Data Settings
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

        // Load Berita & Kos
        fetch('/api/berita').then(res => res.json()).then(data => {
            const t = document.getElementById('tabel-berita');
            data.forEach(i => {
                t.innerHTML += `
                <tr>
                    <td>${i.judul}</td>
                    <td><span style="background: #eee; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">${i.kategori}</span></td>
                    <td><a href="/hapus-berita/${i.id}" style="color: red; text-decoration: none;" onclick="return confirm('Hapus data ini?')">Hapus</a></td>
                </tr>`;
            });
        });

        // Load Struktur
        fetch('/api/struktur').then(res => res.json()).then(data => {
            const t = document.getElementById('tabel-struktur');
            data.forEach(i => t.innerHTML += `<tr><td>${i.nama} (${i.jabatan})</td><td><a href="/hapus-struktur/${i.id}" style="color: red; text-decoration: none;" onclick="return confirm('Hapus?')">Hapus</a></td></tr>`);
        });

        // Load Saran
        fetch('/api/saran').then(res => res.json()).then(data => {
            const t = document.getElementById('tabel-saran');
            data.forEach(i => t.innerHTML += `<tr><td>${i.nama}</td><td>${i.isi_saran}</td><td><a href="/hapus-saran/${i.id}" style="color: red; text-decoration: none;" onclick="return confirm('Hapus?')">Hapus</a></td></tr>`);
        });
   