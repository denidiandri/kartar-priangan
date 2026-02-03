import express from 'express';
const router = express.Router();
import { cekLogin } from '../middleware/authMiddleware.js';

export default (db, upload) => {

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
        // 1. Tangkap 'harga' dari form dashboard
        const { judul, isi, kategori, harga } = req.body; 
        const gambar = req.file ? `/images/${req.file.filename}` : '';
        
        // 2. Masukkan 'harga' ke dalam Query SQL
        // Kita tambahkan 'harga' di kolom dan tambahkan satu tanda tanya (?) di values
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
        db.query("DELETE FROM berita WHERE id = ?", [req.params.id], () => res.redirect('/admin-dashboard'));
    });

    // --- FITUR STRUKTUR ---
    router.get('/api/struktur', (req, res) => {
        db.query("SELECT * FROM struktur", (err, results) => res.json(results));
    });

    router.post('/tambah-struktur', cekLogin, upload.single('foto'), (req, res) => {
        const { nama, jabatan } = req.body;
        const foto = req.file ? `/images/${req.file.filename}` : ''; 
        db.query("INSERT INTO struktur (nama, jabatan, foto) VALUES (?, ?, ?)", [nama, jabatan, foto], (err) => {
            if (err) throw err;
            res.send("<script>alert('Pengurus berhasil ditambahkan!'); window.location.href='/admin-dashboard';</script>");
        });
    });

    router.get('/hapus-struktur/:id', cekLogin, (req, res) => {
        db.query("DELETE FROM struktur WHERE id = ?", [req.params.id], () => res.redirect('/admin-dashboard'));
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

    // --- PERBAIKAN ROUTE BERITA & KATEGORI & KOS ---
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
// API khusus ambil data kos
    router.get('/api/kos', (req, res) => {
        // Gunakan LOWER supaya tidak masalah kalau di DB nulisnya 'Kos' (huruf besar)
        const query = "SELECT * FROM berita WHERE LOWER(kategori) = 'kos' OR LOWER(kategori) = 'kos-kosan' ORDER BY tanggal DESC";
        db.query(query, (err, results) => {
            if (err) {
                console.error("EROR DATABASE KOS:", err);
                return res.json([]);
            }
            // --- INI UNTUK CEK DI TERMINAL ---
            console.log("Jumlah data kos yang ditemukan di DB:", results.length);
            // ---------------------------------
            res.json(results);
        });
    });

    return router;
};