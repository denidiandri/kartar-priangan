document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container-produk');
    const judulHalaman = document.getElementById('judul-halaman');

    const urlParams = new URLSearchParams(window.location.search);
    const kategori = urlParams.get('kategori');

    if (kategori) {
        judulHalaman.innerText = `🛍️ Lapak Warga - ${kategori}`;
    }

    let apiUrl = '/api/produk';
    if (kategori) {
        apiUrl += `?kategori=${encodeURIComponent(kategori)}`;
    }

    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) {
                container.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 40px;">Belum ada produk untuk kategori ${kategori || ''}.</p>`;
                return;
            }

            container.innerHTML = data.map(p => {
                const fotoArray = p.foto.split(',');
                const fotoUtama = fotoArray[0];
                const sisaFoto = fotoArray.length > 1 ? `<span class="badge-foto">+${fotoArray.length - 1} Gambar</span>` : '';

                return `
                <div class="produk-card" onclick="bukaDetail(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                    <div class="img-wrapper">
                        <img src="/img/produk/${fotoUtama}" alt="${p.nama_produk}" class="produk-img">
                        ${sisaFoto}
                    </div>
                    <div class="info">
                        <h3>${p.nama_produk}</h3>
                        <p class="harga">Rp ${parseInt(p.harga).toLocaleString('id-ID')}</p>
                        <p class="desc">${p.deskripsi.substring(0, 50)}${p.deskripsi.length > 50 ? '...' : ''}</p>
                        
                        <div class="btn-wrapper">
                            <a href="https://wa.me/${p.no_wa}?text=Halo, saya tertarik dengan produk ${p.nama_produk}" 
                               class="button-beli" target="_blank" onclick="event.stopPropagation()">
                                Beli via WA
                            </a>
                        </div>
                    </div>
                </div>
            `}).join('');
        })
        .catch(err => console.error('Gagal memuat produk:', err));
});

// FUNGSI UNTUK MODAL DETAIL
function bukaDetail(p) {
    const fotoArray = p.foto.split(',');
    
    // Buat elemen modal
    const modal = document.createElement('div');
    modal.className = 'modal-detail';
    modal.onclick = () => modal.remove(); // Klik luar untuk tutup

    modal.innerHTML = `
        <div class="modal-content" onclick="event.stopPropagation()">
            <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <div class="modal-body">
                <div class="modal-galeri">
                    <img src="/img/produk/${fotoArray[0]}" id="mainImg" class="main-modal-img">
                    <div class="thumbnail-list">
                        ${fotoArray.map(f => `<img src="/img/produk/${f}" onclick="document.getElementById('mainImg').src=this.src">`).join('')}
                    </div>
                </div>
                <div class="modal-info">
                    <h2>${p.nama_produk}</h2>
                    <p class="modal-harga">Rp ${parseInt(p.harga).toLocaleString('id-ID')}</p>
                    <hr>
                    <p class="modal-desc">${p.deskripsi}</p>
                    <a href="https://wa.me/${p.no_wa}" class="button-beli">Pesan Sekarang via WhatsApp</a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}