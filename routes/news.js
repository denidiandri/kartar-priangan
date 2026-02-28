import express from 'express';
import path from 'path'; 
import fs from 'fs';   
import { fileURLToPath } from 'url';
import { cekLogin } from '../middleware/authMiddleware.js';

// Setting __dirname untuk ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (db, upload) => {
    const router = express.Router();

    // --- FITUR KRITIK & SARAN ---
    router.post('/kirim-saran', (req, res) => {
        const { nama, isi_saran } = req.body;
        db.query("INSERT INTO saran (nama, isi_saran) VALUES (?, ?)", [nama, isi_saran], (err) => {
            if (err) throw err;
            res.send("<script>alert('Saran sudah kami terima!'); window.location.href='/kritik';</script>");
        });
    });

    router.get('/api/saran', (req, res) => {
        db.query("SELECT * FROM saran ORDER BY tanggal DESC", (err, results) => res.json(results));
    });

    router.get('/hapus-saran/:id', cekLogin, (req, res) => {
        db.query("DELETE FROM saran WHERE id = ?", [req.params.id], () => res.redirect('/admin-dashboard'));
    });

    // --- FITUR BERITA ---
    router.get('/api/berita', (req, res) => {
        db.query("SELECT * FROM berita ORDER BY tanggal DESC", (err, results) => res.json(results));
    });

    router.post('/tambah-berita', cekLogin, upload.single('gambar'), (req, res) => {
        const { judul, isi, kategori, harga } = req.body; 
        const gambar = req.file ? `/images/${req.file.filename}` : '';
        const query = "INSERT INTO berita (judul, isi, gambar, kategori, harga) VALUES (?, ?, ?, ?, ?)";
        
        db.query(query, [judul, isi, gambar, kategori, harga], (err) => {
            if (err) {
                console.error("Error Simpan Berita:", err);
                return res.send("Gagal menambah berita.");
            }
            res.send("<script>alert('Berita berhasil dipublish!'); window.location.href='/admin-dashboard';</script>");
        });
    });

    router.get('/hapus-berita/:id', cekLogin, (req, res) => {
        const id = req.params.id;
        db.query("SELECT gambar FROM berita WHERE id = ?", [id], (err, results) => {
            if (err) return res.redirect('/admin-dashboard?error=db');
            if (results.length > 0) {
                const namaGambar = results[0].gambar; 
                if (namaGambar) {
                    const pathFisik = path.join(__dirname, '..', 'public', namaGambar);
                    if (fs.existsSync(pathFisik)) fs.unlinkSync(pathFisik);
                }
            }
            db.query("DELETE FROM berita WHERE id = ?", [id], () => res.redirect('/admin-dashboard?status=deleted'));
        });
    });

    // --- FITUR STRUKTUR ---
    router.get('/api/struktur', (req, res) => {
        db.query("SELECT * FROM struktur", (err, results) => res.json(results || []));
    });

    router.get('/api/struktur/:id', (req, res) => {
        const id = req.params.id;
        db.query("SELECT * FROM struktur WHERE id = ?", [id], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json(results[0] || {});
        });
    });

    router.put('/api/struktur/edit/:id', cekLogin, (req, res) => {
        const { id } = req.params;
        const { nama, jabatan } = req.body;
        db.query("UPDATE struktur SET nama = ?, jabatan = ? WHERE id = ?", [nama, jabatan, id], (err) => {
            if (err) return res.status(500).json({ error: "Gagal update" });
            res.json({ status: "success" });
        });
    });

    router.post('/tambah-struktur', cekLogin, upload.single('foto'), (req, res) => {
        const { nama, jabatan } = req.body;
        const fotoPath = req.file ? `/img/produk/${req.file.filename}`.trim() : ''; 
        db.query("INSERT INTO struktur (nama, jabatan, foto) VALUES (?, ?, ?)", [nama, jabatan, fotoPath], (err) => {
            if (err) return res.send("Gagal simpan.");
            res.send("<script>alert('Berhasil!'); window.location.href='/admin-dashboard';</script>");
        });
    });

    router.get('/hapus-struktur/:id', cekLogin, (req, res) => {
        const id = req.params.id;
        db.query("SELECT foto FROM struktur WHERE id = ?", [id], (err, results) => {
            if (results.length > 0 && results[0].foto) {
                const pathFisik = path.join(__dirname, '..', 'public', results[0].foto.trim());
                if (fs.existsSync(pathFisik)) fs.unlinkSync(pathFisik);
            }
            db.query("DELETE FROM struktur WHERE id = ?", [id], () => res.redirect('/admin-dashboard?status=deleted'));
        });
    });

    // --- FITUR LAPAK (UMKM & MERCHANDISE) - TAMBAHAN BARU ---
    // API untuk ambil detail produk (Agar deskripsi muncul di modal)
    router.get('/api/produk/detail/:id', (req, res) => {
        db.query("SELECT * FROM produk WHERE id = ?", [req.params.id], (err, results) => {
            if (err) return res.status(500).json({ error: "DB Error" });
            res.json(results[0] || {});
        });
    });

    // Ambil produk berdasarkan kategori (UMKM/Merchandise)
    router.get('/api/produk/kategori/:kat', (req, res) => {
        db.query("SELECT * FROM produk WHERE kategori = ? ORDER BY id DESC", [req.params.kat], (err, results) => {
            res.json(results || []);
        });
    });

    // Proses tambah produk (Mendukung upload sampai 5 foto)
    router.post('/tambah-produk', cekLogin, upload.array('foto', 5), (req, res) => {
        const { nama_produk, kategori, harga, no_wa, deskripsi } = req.body;
        const fotoFiles = req.files ? req.files.map(f => `/img/produk/${f.filename}`).join(',') : '';
        const sql = "INSERT INTO produk (nama_produk, kategori, harga, no_wa, deskripsi, foto) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [nama_produk, kategori, harga, no_wa, deskripsi, fotoFiles], (err) => {
            if (err) return res.send("Gagal menambah produk.");
            res.send("<script>alert('Produk berhasil ditambahkan!'); window.location.href='/admin-dashboard';</script>");
        });
    });

    // --- FITUR SETTINGS ---
    router.get('/api/settings', (req, res) => {
        db.query("SELECT * FROM settings WHERE id = 1", (err, results) => res.json(results[0] || {}));
    });

    router.post('/update-settings', cekLogin, (req, res) => {
        const { alamat, whatsapp, email, sosmed, maps_link, visi, misi } = req.body;
        const sql = "UPDATE settings SET alamat=?, whatsapp=?, email=?, sosmed=?, maps_link=?, visi=?, misi=? WHERE id=1";
        db.query(sql, [alamat, whatsapp, email, sosmed, maps_link, visi, misi], (err) => {
            if (err) throw err;
            res.send("<script>alert('Update Berhasil!'); window.location.href='/admin-dashboard';</script>");
        });
    });

    // --- API BERITA LAINNYA ---
    router.get('/api/berita/:id', (req, res) => {
        db.query("SELECT * FROM berita WHERE id = ?", [req.params.id], (err, results) => res.json(results[0] || {}));
    });

    router.put('/api/berita/edit/:id', cekLogin, (req, res) => {
        const { id } = req.params;
        const { judul, kategori, isi } = req.body;
        db.query("UPDATE berita SET judul = ?, kategori = ?, isi = ? WHERE id = ?", [judul, kategori, isi, id], (err) => {
            if (err) return res.status(500).json({ error: "Gagal update" });
            res.json({ status: "success" });
        });
    });

    return router;
};