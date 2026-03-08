import express from 'express';
import path from 'path'; 
import fs from 'fs';   
import { fileURLToPath } from 'url';
import { cekLogin } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (db, upload) => {
    const router = express.Router();

    // ==========================================
    // 1. RUTE PUBLIK (Taruh Paling Atas)
    // ==========================================

    // Ambil Berita Terbaru (Home - Limit 6)
    router.get('/berita-terbaru', (req, res) => {
        db.query("SELECT * FROM berita ORDER BY id DESC LIMIT 6", (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
        });
    });

    // Ambil Semua Berita
    router.get('/berita-semua', (req, res) => {
        db.query("SELECT * FROM berita ORDER BY id DESC", (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
        });
    });

    // Ambil Kategori Spesifik
    router.get('/berita/kategori/:slug', (req, res) => {
        const slug = req.params.slug;
        db.query("SELECT * FROM berita WHERE kategori = ? ORDER BY id DESC", [slug], (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
        });
    });

    // Ambil Info Kos
    router.get('/kos', (req, res) => {
        db.query("SELECT * FROM berita WHERE kategori = 'kos' ORDER BY id DESC", (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
        });
    });

    // Ambil Detail Berita Pakai ID
    router.get('/berita/:id', (req, res) => {
        const id = req.params.id;
        db.query("SELECT * FROM berita WHERE id = ?", [id], (err, results) => {
            if (err || results.length === 0) return res.status(404).json({ error: "Berita tidak ditemukan" });
            res.json(results[0]);
        });
    });

router.get('/settings', (req, res) => { // Pastikan 'settings' bukan 'Settings'
    db.query("SELECT * FROM settings WHERE id = 1", (err, results) => {
        if (err) return res.status(500).json({});
        if (results && results.length > 0) {
            res.json(results[0]);
        } else {
            res.json({});
        }
    });
});

router.get('/saran-semua', (req, res) => {
    db.query("SELECT * FROM saran ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results || []);
    });
});

    router.get('/struktur', (req, res) => {
        db.query("SELECT * FROM struktur ORDER BY id", (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
        });
    });

    router.get('/produk-semua', (req, res) => {
        const query = "SELECT * FROM produk ORDER BY id DESC";
        db.query(query, (err, results) => {
            if (err) {
                console.error("Gagal ambil produk:", err);
                return res.status(500).json([]);
            }
            res.json(results);
        });
    });

    // Rute Kategori Produk
    router.get('/produk/kategori/:kat', (req, res) => {
        const query = "SELECT * FROM produk WHERE kategori = ? ORDER BY id DESC";
        db.query(query, [req.params.kat], (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results);
        });
    });

    // ==========================================
    // 2. RUTE ADMIN (Pakai cekLogin)
    // ==========================================

    router.get('/saran', cekLogin, (req, res) => {
        db.query("SELECT * FROM saran ORDER BY id DESC", (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
        });
    });

    router.post('/tambah-berita', cekLogin, upload.single('gambar'), (req, res) => {
        const { judul, isi, kategori } = req.body; 
        // Konsisten gunakan path /images/
        const gambar = req.file ? `/images/${req.file.filename}` : '';
        db.query("INSERT INTO berita (judul, isi, gambar, kategori) VALUES (?, ?, ?, ?)", [judul, isi, gambar, kategori], (err) => {
            if (err) return res.status(500).send("Gagal tambah berita");
            res.redirect('/admin-dashboard?status=published');
        });
    });

    router.post('/berita/:id', cekLogin, (req, res) => {
        const { judul, kategori, isi } = req.body;
        db.query("UPDATE berita SET judul=?, kategori=?, isi=? WHERE id=?", [judul, kategori, isi, req.params.id], (err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true });
        });
    });

    router.get('/hapus-berita/:id', cekLogin, (req, res) => {
        db.query("DELETE FROM berita WHERE id = ?", [req.params.id], (err) => {
            res.redirect('/admin-dashboard?status=deleted');
        });
    });

    // Produk & Struktur Admin
    router.post('/tambah-produk', cekLogin, upload.array('foto', 5), (req, res) => {
        const { nama_produk, kategori, harga, no_wa, deskripsi } = req.body;
        // Gunakan path /images/ agar seragam di semua rute
        const fotoPaths = req.files ? req.files.map(f => `/images/${f.filename}`).join(',') : '';
        db.query("INSERT INTO produk (nama_produk, kategori, harga, no_wa, foto, deskripsi) VALUES (?, ?, ?, ?, ?, ?)", 
        [nama_produk, kategori, harga, no_wa, fotoPaths, deskripsi], (err) => {
            if (err) return res.status(500).send("Gagal tambah produk");
            res.redirect('/admin-dashboard?status=product_added');
        });
    });

    router.get('/hapus-produk/:id', cekLogin, (req, res) => {
        db.query("DELETE FROM produk WHERE id = ?", [req.params.id], (err) => {
            res.redirect('/admin-dashboard?status=deleted');
        });
    });

    // 1. Ambil data satuan berdasarkan ID (Biar modal edit terisi otomatis)
router.get('/struktur/:id', (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM struktur WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Gagal Ambil Struktur ID:", err);
            return res.status(500).json({ error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }
        res.json(result[0]);
    });
});

// 2. Proses Update Data Struktur (Ke /api/struktur/update)
router.post('/struktur/update', (req, res) => {
    const { id, nama, jabatan } = req.body;
    const query = "UPDATE struktur SET nama = ?, jabatan = ? WHERE id = ?";
    
    db.query(query, [nama, jabatan, id], (err, result) => {
        if (err) {
            console.error("Gagal Update Struktur:", err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: "Struktur berhasil diperbarui!" });
    });
});

    router.get('/hapus-struktur/:id', cekLogin, (req, res) => {
        db.query("DELETE FROM struktur WHERE id = ?", [req.params.id], (err) => {
            res.redirect('/admin-dashboard?status=deleted');
        });
    });

    router.post('/update-settings', cekLogin, (req, res) => {
        const { visi, misi, alamat, whatsapp, email, maps_link, sosmed } = req.body;
        db.query("UPDATE settings SET visi=?, misi=?, alamat=?, whatsapp=?, email=?, maps_link=?, sosmed=? WHERE id=1", 
        [visi, misi, alamat, whatsapp, email, maps_link, sosmed], (err) => {
            if (err) return res.status(500).send("Gagal update settings");
            res.redirect('/admin-dashboard?status=settings_updated');
        });
    });

   router.post('/kirim-saran', (req, res) => {
    // Ambil data dari atribut 'name' di form HTML
    const { nama, isi_saran } = req.body;

    // Pastikan kolom 'id' di DB adalah AUTO_INCREMENT
    const sql = "INSERT INTO saran (nama, isi_saran, tanggal) VALUES (?, ?, NOW())";
    
    db.query(sql, [nama, isi_saran], (err) => {
        if (err) {
            console.error("Gagal simpan:", err);
            return res.status(500).json({ success: false });
        }
        // Respon sukses dalam bentuk JSON untuk dibaca oleh JavaScript
        res.json({ success: true });
    });
});


// Rute untuk menghapus saran
router.get('/hapus-saran/:id', (req, res) => {
    const idSaran = req.params.id;

    const sql = "DELETE FROM saran WHERE id = ?";
    
    db.query(sql, [idSaran], (err, result) => {
        if (err) {
            console.error("Gagal hapus saran:", err);
            return res.status(500).send("Gagal menghapus data.");
        }
        
        // Setelah hapus, arahkan balik ke dashboard admin
        res.send("<script>alert('Saran berhasil dihapus!'); window.location.href='/admin-dashboard';</script>");
    });
});

    return router;
};