document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container-produk');
    const judulHalaman = document.getElementById('judul-halaman');

    const urlParams = new URLSearchParams(window.location.search);
    const kategori = urlParams.get('kategori');

    if (kategori && judulHalaman) {
        judulHalaman.innerText = `🛍️ Lapak Warga - ${kategori}`;
    }

    let apiUrl = '/api/produk';
    if (kategori) {
        apiUrl = `/api/produk/kategori/${encodeURIComponent(kategori)}`;
    }

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            if (!container) return;
            if (data.length === 0) {
                container.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 40px;">Belum ada produk untuk kategori ${kategori || ''}.</p>`;
                return;
            }

            // Simpan ke window agar aman dipanggil fungsi bukaDetail
            window.dataLapak = data;

            container.innerHTML = data.map((p, index) => {
                const fotoArray = p.foto ? p.foto.split(',') : [];
                
                // FIX PATH: Pastikan mengarah ke /img/produk/
                let fotoUtama = fotoArray[0] ? fotoArray[0].trim() : ''; 
                if (fotoUtama && !fotoUtama.startsWith('/img/')) {
                    fotoUtama = `/img/produk/${fotoUtama}`;
                }

                const sisaFoto = fotoArray.length > 1 ? `<span class="badge-foto">+${fotoArray.length - 1}</span>` : '';

                return `
                <div class="produk-card" onclick="bukaDetail(${index})">
                    <div class="img-wrapper">
                        <img src="${fotoUtama}" alt="${p.nama_produk}" class="produk-img" onerror="this.src='/images/no-image.png'">
                        ${sisaFoto}
                    </div>
                    <div class="info">
                        <h3>${p.nama_produk}</h3>
                        <p class="harga">Rp ${parseInt(p.harga).toLocaleString('id-ID')}</p>
                        <p class="desc">${p.deskripsi ? p.deskripsi.substring(0, 50) : ''}...</p>
                        <div class="btn-wrapper">
                            <button class="button-beli">Lihat Detail</button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        })
        .catch(err => console.error('Gagal memuat produk:', err));
});

function bukaDetail(index) {
    const p = window.dataLapak[index];
    const fotoArray = p.foto ? p.foto.split(',') : [];
    
    // Fungsi bantu untuk fix path di dalam modal
    const getPath = (img) => {
        let path = img.trim();
        return path.startsWith('/img/') ? path : `/img/produk/${path}`;
    };

    const modal = document.createElement('div');
    modal.className = 'modal-detail-overlay'; 
    
    modal.innerHTML = `
        <div class="modal-detail-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div class="modal-detail-grid">
                <div class="modal-galeri">
                    <img src="${getPath(fotoArray[0])}" id="mainImg" class="main-modal-img" onerror="this.src='/images/no-image.png'">
                    <div class="thumbnail-list">
                        ${fotoArray.map(f => `<img src="${getPath(f)}" onclick="document.getElementById('mainImg').src=this.src" onerror="this.src='/images/no-image.png'">`).join('')}
                    </div>
                </div>
                <div class="modal-info">
                    <h2>${p.nama_produk}</h2>
                    <p class="modal-harga">Rp ${parseInt(p.harga).toLocaleString('id-ID')}</p>
                    <hr>
                    <div class="modal-desc-scroll">
                        <p>${p.deskripsi}</p>
                    </div>
                    <a href="https://wa.me/${p.no_wa}?text=Halo, saya tertarik dengan produk ${p.nama_produk}" target="_blank" class="btn-wa-modal">Pesan via WhatsApp</a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}