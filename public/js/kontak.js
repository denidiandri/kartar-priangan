async function loadContactInfo() {
    try {
        const response = await fetch('/api/settings');
        const data = await response.json();

        if (data) {
            // Pastiin elemennya ada dulu baru diisi (biar gak macet)
            const elAlamat = document.getElementById('info-alamat');
            const elWa = document.getElementById('info-wa');
            const elEmail = document.getElementById('info-email');
            const elIg = document.getElementById('info-ig');
            const mapsIframe = document.getElementById('info-maps');

            if(elAlamat) elAlamat.innerText = data.alamat || '-';
            if(elWa) elWa.innerText = data.whatsapp || '-';
            if(elEmail) elEmail.innerText = data.email || '-';
            
            if (elIg) {
                elIg.innerText = data.sosmed || '-';
                elIg.style.whiteSpace = "pre-line"; 
            }
            
            // Logika Maps yang lebih galak
            if(mapsIframe && data.maps_link) {
                if(data.maps_link.includes('src="')) {
                    const match = data.maps_link.match(/src="([^"]+)"/);
                    if(match) mapsIframe.src = match[1];
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