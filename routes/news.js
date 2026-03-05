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

    // Rute Settings & Struktur (Publik)
    router.get('/settings', (req, res) => {
        db.query("SELECT * FROM settings WHERE id = 1", (err, results) => {
            if (err) return res.status(500).json({});
            res.json(results?.[0] || {});
        });
    });

    router.get('/struktur-semua', (req, res) => {
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

    router.post('/tambah-struktur', cekLogin, upload.single('foto'), (req, res) => {
        const { nama, jabatan } = req.body;
        const foto = req.file ? `/images/${req.file.filename}` : '';
        db.query("INSERT INTO struktur (nama, jabatan, foto) VALUES (?, ?, ?)", [nama, jabatan, foto], (err) => {
            if (err) return res.status(500).send("Gagal tambah struktur");
            res.redirect('/admin-dashboard?status=member_added');
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

    return router;
};