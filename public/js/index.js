

        // --- Kodingan Asli Kamu (Tetap Sama) ---
        async function fetchHomeNews() {
            try {
                const response = await fetch('/api/berita');
                const data = await response.json();
                const container = document.getElementById('home-news-grid');
                
                if (data.length === 0) {
                    container.innerHTML = '<p>Belum ada berita untuk ditampilkan.</p>';
                    return;
                }

                container.innerHTML = ''; 
                const limitNews = data.slice(0, 3);

                limitNews.forEach(item => {
                    container.innerHTML += `
                        <div class="news-card">
                            <div class="news-img-box">
                                <img src="${item.gambar || '/images/default-news.jpg'}" alt="Berita">
                            </div>
                            <div class="news-info">
                                <small>${new Date(item.tanggal).toLocaleDateString('id-ID')}</small>
                                <h4>${item.judul}</h4>
                                <p>${item.isi.substring(0, 80)}...</p>
                            </div>
                        </div>
                    `;
                });
            } catch (err) {
                console.error("Gagal load berita:", err);
            }
        }

        fetchHomeNews();

      
  