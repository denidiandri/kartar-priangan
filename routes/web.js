import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { cekLogin } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (db) => {
    const router = express.Router(); 

    // --- 1. RUTE HALAMAN (RENDER HTML) ---
    router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../views/index.html')));
    router.get('/profil', (req, res) => res.sendFile(path.join(__dirname, '../views/profil.html')));
    router.get('/kontak', (req, res) => res.sendFile(path.join(__dirname, '../views/kontak.html')));
    router.get('/kritik', (req, res) => res.sendFile(path.join(__dirname, '../views/kritik.html')));
    router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../views/login.html')));
    router.get('/kos', (req, res) => res.sendFile(path.join(__dirname, '../views/kos.html')));
    router.get('/lapak', (req, res) => res.sendFile(path.join(__dirname, '../views/lapak.html')));
    router.get('/admin-dashboard', cekLogin, (req, res) => res.sendFile(path.join(__dirname, '../views/admin-dashboard.html')));

    // --- 2. API KHUSUS PRODUK & SETTINGS ---
    router.get('/api/settings', (req, res) => {
        db.query("SELECT * FROM settings LIMIT 1", (err, results) => {
            if (err) return res.status(500).json({ error: "DB Error" });
            res.json(results[0] || {});
        });
    });

    router.get('/api/produk', (req, res) => {
        const kategori = req.query.kategori;
        let sql = "SELECT * FROM produk";
        let params = [];
        if (kategori && kategori !== 'undefined' && kategori !== '') {
            sql += " WHERE kategori = ? ORDER BY id DESC";
            params.push(kategori);
        } else {
            sql += " ORDER BY id DESC";
        }
        db.query(sql, params, (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
        });
    });

    // --- 3. RUTE BACA BERITA (Halaman) ---
    router.get('/kategori/:nama', (req, res) => res.sendFile(path.join(__dirname, '../views/kategori.html')));
    router.get('/baca-berita/:id', (req, res) => res.sendFile(path.join(__dirname, '../views/kategori.html')));

    // --- 4. PROSES CRUD PRODUK ---
    router.post('/tambah-produk', cekLogin, upload.array('foto', 5), (req, res) => {
        const { nama_produk, kategori, harga, no_wa, deskripsi } = req.body;
        // Simpan hanya nama file agar konsisten dengan tampilan di frontend
        const daftarFoto = req.files ? req.files.map(file => file.filename).join(',') : '';
        
        const sql = "INSERT INTO produk (nama_produk, kategori, harga, no_wa, foto, deskripsi) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [nama_produk, kategori, parseInt(harga) || 0, no_wa, daftarFoto, deskripsi], (err) => {
            if (err) return res.status(500).send("Gagal simpan.");
            res.redirect('/admin-dashboard?status=success'); 
        });
    });

    return router;
};