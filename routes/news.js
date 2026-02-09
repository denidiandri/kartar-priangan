import express from 'express';
import path from 'path'; // WAJIB ADA
import fs from 'fs';   // WAJIB ADA
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

    // PROSES HAPUS BERITA (VERSI BERSIH & FIX)
    router.get('/hapus-berita/:id', cekLogin, (req, res) => {
        const id = req.params.id;

        db.query("SELECT gambar FROM berita WHERE id = ?", [id], (err, results) => {
            if (err) {
                console.error("Gagal cari berita:", err);
                return res.redirect('/admin-dashboard?error=db');
            }

            if (results.length > 0) {
                const namaGambar = results[0].gambar; 
                if (namaGambar) {
                    const pathFisik = path.join(__dirname, '..', 'public', namaGambar);
                    if (fs.existsSync(pathFisik)) {
                        fs.unlinkSync(pathFisik);
                        console.log(`✅ File Berita ${namaGambar} berhasil dihapus.`);
                    }
                }
            }

            db.query("DELETE FROM berita WHERE id = ?", [id], (err) => {
                if (err) {
                    console.error("Gagal hapus data:", err);
                    return res.redirect('/admin-dashboard?error=delete');
                }
                res.redirect('/admin-dashboard?status=deleted');
            });
        });
    });

    // --- FITUR STRUKTUR  ---
    router.get('/api/struktur', (req, res) => {
        db.query("SELECT * FROM struktur", (err, results) => res.json(results || []));
    });

    router.post('/tambah-struktur', cekLogin, upload.single('foto'), (req, res) => {
        const { nama, jabatan } = req.body;
        
        // Sesuaikan dengan folder asli lo
        const fotoPath = req.file ? `/img/produk/${req.file.filename}`.trim() : ''; 
        
        db.query("INSERT INTO struktur (nama, jabatan, foto) VALUES (?, ?, ?)", [nama, jabatan, fotoPath], (err) => {
            if (err) return res.send("Gagal simpan.");
            res.send("<script>alert('Berhasil!'); window.location.href='/admin-dashboard';</script>");
        });
    });

    router.get('/hapus-struktur/:id', cekLogin, (req, res) => {
        const id = req.params.id;
        
        db.query("SELECT foto FROM struktur WHERE id = ?", [id], (err, results) => {
            if (results.length > 0) {
                const fotoDb = results[0].foto ? results[0].foto.trim() : null;
                
                if (fotoDb) {
                    // path.join bakal nyari ke public/img/produk/namafile.png
                    const pathFisik = path.join(__dirname, '..', 'public', fotoDb);
                    
                    if (fs.existsSync(pathFisik)) {
                        fs.unlinkSync(pathFisik);
                    }
                }
            }

            db.query("DELETE FROM struktur WHERE id = ?", [id], () => {
                res.redirect('/admin-dashboard?status=deleted');
            });
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
            res.send("<script>alert('Visi, Misi & Kontak berhasil diperbarui!'); window.location.href='/admin-dashboard';</script>");
        });
    });

    // --- API FILTER ---
    router.get('/api/berita/kategori/:kategori', (req, res) => {
        db.query("SELECT * FROM berita WHERE kategori = ? ORDER BY id DESC", [req.params.kategori], (err, results) => {
            res.json(results || []);
        });
    });

    router.get('/api/berita/:id', (req, res) => {
        db.query("SELECT * FROM berita WHERE id = ?", [req.params.id], (err, results) => {
            res.json(results[0] || {});
        });
    });

    // API khusus ambil data kos
    router.get('/api/kos', (req, res) => {
        const query = "SELECT * FROM berita WHERE kategori LIKE '%kos%' ORDER BY tanggal DESC";
        db.query(query, (err, results) => {
            if (err) return res.json([]);
            res.json(results);
        });
    });

    // API UNTUK HOME (6 TERBARU) & LIHAT SEMUA
    router.get('/api/berita-terbaru', (req, res) => {
        const query = "SELECT * FROM berita ORDER BY tanggal DESC LIMIT 6";
        db.query(query, (err, results) => {
            if (err) return res.json([]);
            res.json(results);
        });
    });

    router.get('/api/berita-semua', (req, res) => {
        const query = "SELECT * FROM berita ORDER BY tanggal DESC";
        db.query(query, (err, results) => {
            if (err) return res.json([]);
            res.json(results);
        });
    });

    return router;
};