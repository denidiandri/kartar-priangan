import express from 'express';
import path from 'path'; 
import fs from 'fs';   
import { fileURLToPath } from 'url';
import { cekLogin } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (db, upload) => {
    const router = express.Router();

    // --- 1. FITUR KRITIK & SARAN ---
    router.post('/kirim-saran', (req, res) => {
        const { nama, isi_saran } = req.body;
        db.query("INSERT INTO saran (nama, isi_saran) VALUES (?, ?)", [nama, isi_saran], (err) => {
            if (err) return res.status(500).send("Gagal mengirim saran");
            res.send("<script>alert('Saran sudah kami terima!'); window.location.href='/kritik';</script>");
        });
    });

    router.get('/api/saran', (req, res) => {
        db.query("SELECT * FROM saran ORDER BY id DESC", (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        });
    });

    // --- 2. FITUR BERITA (API UNTUK FRONTEND) ---
    
    // Ambil Berita Terbaru (Limit 5 untuk Home)
    router.get('/api/berita-terbaru', (req, res) => {
        db.query("SELECT * FROM berita ORDER BY id DESC LIMIT 5", (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
        });
    });

    // Ambil Semua Berita (Untuk slug 'semua')
    router.get('/api/berita-semua', (req, res) => {
        db.query("SELECT * FROM berita ORDER BY id DESC", (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
        });
    });

    // Ambil Info Kos (Kategori spesifik kos)
    router.get('/api/kos', (req, res) => {
        db.query("SELECT * FROM berita WHERE kategori = 'kos' ORDER BY id DESC", (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
        });
    });

    // Ambil berita berdasarkan kategori (Loker, Kegiatan, dll)
    router.get('/api/berita/kategori/:kat', (req, res) => {
        const kategori = req.params.kat;
        const sql = "SELECT * FROM berita WHERE kategori = ? ORDER BY id DESC";
        db.query(sql, [kategori], (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
        });
    });

    // Ambil SATU berita detail (Dipakai Edit Admin & Baca Selengkapnya)
    router.get('/api/berita/:id', (req, res) => {
        const id = req.params.id;
        db.query("SELECT * FROM berita WHERE id = ?", [id], (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });
            if (results.length === 0) return res.status(404).json({ message: "Berita tidak ditemukan" });
            res.json(results[0]);
        });
    });

    // --- 3. FITUR ADMIN (TAMBAH, UPDATE, HAPUS) ---

    // Tambah Berita
    router.post('/tambah-berita', cekLogin, upload.single('gambar'), (req, res) => {
        const { judul, isi, kategori } = req.body; 
        const gambar = req.file ? `/images/${req.file.filename}` : '';
        const query = "INSERT INTO berita (judul, isi, gambar, kategori) VALUES (?, ?, ?, ?)";
        
        db.query(query, [judul, isi, gambar, kategori], (err) => {
            if (err) return res.status(500).send("Gagal menambah berita.");
            res.send("<script>alert('Berita berhasil dipublish!'); window.location.href='/admin-dashboard';</script>");
        });
    });

    // Update Berita
    router.post('/api/berita/:id', cekLogin, (req, res) => {
        const { id } = req.params;
        const { judul, kategori, isi } = req.body;
        db.query("UPDATE berita SET judul = ?, kategori = ?, isi = ? WHERE id = ?", [judul, kategori, isi, id], (err) => {
            if (err) return res.status(500).json({ error: "Gagal update" });
            res.json({ status: "success" });
        });
    });

    // Hapus Berita
    router.get('/hapus-berita/:id', cekLogin, (req, res) => {
        const id = req.params.id;
        db.query("SELECT gambar FROM berita WHERE id = ?", [id], (err, results) => {
            if (results.length > 0 && results[0].gambar) {
                const pathFisik = path.join(__dirname, '..', 'public', results[0].gambar);
                if (fs.existsSync(pathFisik)) fs.unlinkSync(pathFisik);
            }
            db.query("DELETE FROM berita WHERE id = ?", [id], () => res.redirect('/admin-dashboard?status=deleted'));
        });
    });

    return router;
};