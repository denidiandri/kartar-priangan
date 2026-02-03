
        // --- Kodingan Asli Kamu (Memuat Data Kontak) ---
        async function loadContactInfo() {
            try {
                const response = await fetch('/api/settings');
                const data = await response.json();

                if (data) {
                    document.getElementById('info-alamat').innerText = data.alamat || '-';
                    document.getElementById('info-wa').innerText = data.whatsapp || '-';
                    document.getElementById('info-email').innerText = data.email || '-';
                    
                    const sosmedElement = document.getElementById('info-ig'); 
                    if (sosmedElement) {
                        sosmedElement.innerText = data.sosmed || '-';
                        sosmedElement.style.whiteSpace = "pre-line"; 
                    }
                    
                    if(data.maps_link) {
                        const mapsIframe = document.getElementById('info-maps');
                        if(data.maps_link.includes('src="')) {
                            const match = data.maps_link.match(/src="([^"]+)"/);
                            mapsIframe.src = match[1];
                        } else {
                            mapsIframe.src = data.maps_link;
                        }
                    }
                }
            } catch (error) {
                console.error('Gagal memuat data kontak:', error);
            }
        }

        loadContactInfo();

       