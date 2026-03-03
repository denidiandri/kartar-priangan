document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container-produk');
    const judulHalaman = document.getElementById('judul-halaman');

    const urlParams = new URLSearchParams(window.location.search);
    const kategori = urlParams.get('kategori');

    if (kategori && judulHalaman) {
        judulHalaman.innerText = `🛍️ Lapak Warga - ${kategori}`;
    }

    let apiUrl = '/api/produk-semua'; 
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
    let namaFile = fotoArray[0] ? fotoArray[0].trim() : '';

    // Karena folder lo adalah public/img/produk/
    // Dan database lo mungkin nyimpen path lengkap, kita bersihkan:
    let fotoUtama = namaFile.replace('public/', '/');
    
    // Kalau database cuma nyimpen nama file (misal: produk-xxx.png)
    if (!fotoUtama.startsWith('/')) {
        fotoUtama = `/img/produk/${fotoUtama}`;
    }

    return `
    <div class="produk-card" onclick="bukaDetail(${index})">
        <div class="img-wrapper">
            <img src="${fotoUtama}" alt="${p.nama_produk}" class="produk-img" onerror="this.src='/images/logokartar.png'">
        </div>
        <div class="info">
            <h3>${p.nama_produk}</h3>
            <p class="harga">Rp ${parseInt(p.harga).toLocaleString('id-ID')}</p>
            <button class="button-beli">Lihat Detail</button>
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
    if (!img) return '/images/logokartar.png';
    let path = img.trim();

    // 1. Buang "public/" kalau ada
    path = path.replace('public/', '/');

    // 2. Kalau path tidak diawali "/" atau "http", tambahkan folder produk
    if (!path.startsWith('/') && !path.startsWith('http')) {
        return `/img/produk/${path}`;
    }

    return path;
};
    const modal = document.createElement('div');
    modal.className = 'modal-detail-overlay'; 
    
    modal.innerHTML = `
        <div class="modal-detail-content">
            <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div class="modal-detail-grid">
                <div class="modal-galeri">
                    <img src="${getPath(fotoArray[0])}" id="mainImg" class="main-modal-img" onerror="this.src='/images/logokartar.png'">
                    
                    <div class="thumbnail-list">
                        ${fotoArray.length > 1 ? fotoArray.map(f => `
                            <img src="${getPath(f)}" 
                                 onclick="document.getElementById('mainImg').src=this.src" 
                                 onerror="this.src='/images/logokartar.png'">
                        `).join('') : ''}
                    </div>
                </div>
                <div class="modal-info">
                    <small style="color: #e74c3c; font-weight: bold; text-transform: uppercase;">${p.kategori || 'Produk'}</small>
                    <h2 style="margin-top: 5px;">${p.nama_produk}</h2>
                    <p class="modal-harga" style="font-size: 1.5rem; color: #2c3e50; font-weight: bold;">
                        Rp ${parseInt(p.harga).toLocaleString('id-ID')}
                    </p>
                    <hr>
                    <div class="modal-desc-scroll">
                        <p style="white-space: pre-line;">${p.deskripsi}</p>
                    </div>
                    <a href="https://wa.me/${p.no_wa}?text=Halo, saya tertarik dengan produk *${p.nama_produk}*" 
                       target="_blank" class="btn-wa-modal" 
                       style="display: block; text-align: center; background: #25d366; color: white; padding: 15px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
                       Pesan via WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}