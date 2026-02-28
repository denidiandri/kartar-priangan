import express from 'express';
const router = express.Router();
import path from 'path';
import { fileURLToPath } from 'url';
import { cekLogin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- KONFIGURASI MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/img/produk/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'produk-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } 
});

export default (db) => {

    // --- 1. RUTE HALAMAN STATIS (DEPAN) ---
    router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../views/index.html')));
    router.get('/profil', (req, res) => res.sendFile(path.join(__dirname, '../views/profil.html')));
    router.get('/kontak', (req, res) => res.sendFile(path.join(__dirname, '../views/kontak.html')));
    router.get('/kritik', (req, res) => res.sendFile(path.join(__dirname, '../views/kritik.html')));
    router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../views/login.html')));
    router.get('/kos', (req, res) => res.sendFile(path.join(__dirname, '../views/kos.html')));
    router.get('/lapak', (req, res) => res.sendFile(path.join(__dirname, '../views/lapak.html')));

    // --- 2. RUTE ADMIN (WAJIB PAKAI cekLogin) ---
    // Pastikan file admin-dashboard.html ada di folder /views/
    router.get('/admin-dashboard', cekLogin, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/admin-dashboard.html'));
    });

    // --- 3. API DATA (SETTINGS, STRUKTUR, PRODUK) ---
    router.get('/api/settings', (req, res) => {
        db.query("SELECT * FROM settings LIMIT 1", (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results[0] || {});
        });
    });

    router.get('/api/struktur', (req, res) => {
        db.query("SELECT * FROM struktur ORDER BY id ASC", (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        });
    });

    router.get('/api/produk', (req, res) => {
        const kategori = req.query.kategori;
        let sql = "SELECT * FROM produk";
        let params = [];
        if (kategori && kategori !== 'undefined') {
            sql += " WHERE kategori = ? ORDER BY id DESC";
            params.push(kategori);
        } else {
            sql += " ORDER BY id DESC";
        }
        db.query(sql, params, (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        });
    });

    // --- 4. RUTE BERITA & KATEGORI (Catch-all rute ditaruh di bawah) ---
    router.get('/kategori/:nama', (req, res) => res.sendFile(path.join(__dirname, '../views/kategori.html')));
    router.get('/baca-berita/:id', (req, res) => res.sendFile(path.join(__dirname, '../views/kategori.html')));

    // --- 5. PROSES CRUD (TAMBAH/HAPUS/UPDATE) ---
    router.post('/tambah-produk', cekLogin, upload.array('foto', 5), (req, res) => {
        const { nama_produk, kategori, harga, no_wa, deskripsi } = req.body;
        const daftarFoto = req.files ? req.files.map(file => file.filename).join(',') : '';
        const sql = "INSERT INTO produk (nama_produk, kategori, harga, no_wa, foto, deskripsi) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [nama_produk, kategori, parseInt(harga), no_wa, daftarFoto, deskripsi], (err) => {
            if (err) return res.status(500).send("Gagal menyimpan.");
            res.redirect('/admin-dashboard?status=success'); 
        });
    });

    router.delete('/api/produk/:id', cekLogin, (req, res) => {
        const id = req.params.id;
        db.query("DELETE FROM produk WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json(err);
            res.status(200).send("Berhasil dihapus");
        });
    });

    return router;
};