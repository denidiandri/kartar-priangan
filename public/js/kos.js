// --- 2. AMBIL DATA KOS ---
        fetch('/api/kos')
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById('kos-list');
                if(data.length === 0) {
                    container.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 50px;">Belum ada info kos di kategori ini.</p>';
                    return;
                }
                container.innerHTML = '';
                data.forEach(item => {
                    container.innerHTML += `
                        <div style="background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: 1px solid #ddd; display: flex; flex-direction: column;">
                            <div style="position: relative; height: 180px;">
                                <img src="${item.gambar}" style="width: 100%; height: 100%; object-fit: cover;">
                                <div style="position: absolute; top: 10px; right: 10px; background: #e74c3c; color: #fff; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;">
                                    ${item.harga || 'Nego'}
                                </div>
                            </div>
                            <div style="padding: 15px; flex-grow: 1; display: flex; flex-direction: column;">
                                <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; color: #333;">${item.judul}</h3>
                                <p style="font-size: 0.9rem; color: #555; line-height: 1.4; height: 40px; overflow: hidden; margin-bottom: 15px;">
                                    ${item.isi.substring(0, 80)}...
                                </p>
                                
                                <div style="margin-top: auto;">
                                    <a href="/baca-berita/${item.id}" 
                                       style="display: block; text-align: center; background: #3498db; color: white; padding: 10px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-bottom: 8px; font-size: 0.9rem;">
                                       🔍 Lihat Detail & Fasilitas
                                    </a>

                                    <a href="https://wa.me/6281564643711?text=Halo%20Admin,%20saya%20tertarik%20dengan%20kos:%20${encodeURIComponent(item.judul)}" 
                                       target="_blank" 
                                       style="display: block; text-align: center; background: #25d366; color: white; padding: 10px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 0.9rem;">
                                       <i class="fab fa-whatsapp"></i> Tanya via WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                });
            });