import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { cekLogin } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (db) => {
    const router = express.Router(); // Pastikan router didefinisikan di sini

    // --- 1. RUTE HALAMAN STATIS (DEPAN) ---
    // Gunakan path.resolve agar lebih kuat di lingkungan cPanel/Linux
    router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../views/index.html')));
    router.get('/profil', (req, res) => res.sendFile(path.join(__dirname, '../views/profil.html')));
    router.get('/kontak', (req, res) => res.sendFile(path.join(__dirname, '../views/kontak.html')));
    router.get('/kritik', (req, res) => res.sendFile(path.join(__dirname, '../views/kritik.html')));
    router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../views/login.html')));
    router.get('/kos', (req, res) => res.sendFile(path.join(__dirname, '../views/kos.html')));
    router.get('/lapak', (req, res) => res.sendFile(path.join(__dirname, '../views/lapak.html')));

    // --- 2. RUTE ADMIN ---
    router.get('/admin-dashboard', cekLogin, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/admin-dashboard.html'));
    });

    // --- 3. API DATA (SETTINGS, STRUKTUR, PRODUK) ---
    router.get('/api/settings', (req, res) => {
        db.query("SELECT * FROM settings LIMIT 1", (err, results) => {
            if (err) return res.status(500).json({ error: "DB Error" });
            res.json(results[0] || {});
        });
    });

    router.get('/api/struktur', (req, res) => {
        db.query("SELECT * FROM struktur ORDER BY id ASC", (err, results) => {
            if (err) return res.status(500).json([]);
            res.json(results || []);
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
            if (err) {
                console.error("Error Fetch Produk:", err);
                return res.status(500).json([]); // Kirim array kosong biar tabel gak crash
            }
            res.json(results || []);
        });
    });

    // --- 4. RUTE BERITA & KATEGORI ---
    router.get('/kategori/:nama', (req, res) => res.sendFile(path.join(__dirname, '../views/kategori.html')));
    router.get('/baca-berita/:id', (req, res) => res.sendFile(path.join(__dirname, '../views/kategori.html')));

    // --- 5. PROSES CRUD ---
    router.post('/tambah-produk', cekLogin, upload.array('foto', 5), (req, res) => {
        const { nama_produk, kategori, harga, no_wa, deskripsi } = req.body;
        const daftarFoto = req.files ? req.files.map(file => file.filename).join(',') : '';
        
        const sql = "INSERT INTO produk (nama_produk, kategori, harga, no_wa, foto, deskripsi) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [nama_produk, kategori, parseInt(harga) || 0, no_wa, daftarFoto, deskripsi], (err) => {
            if (err) {
                console.error("Error Insert Produk:", err);
                return res.status(500).send("Gagal menyimpan ke database.");
            }
            res.redirect('/admin-dashboard?status=success'); 
        });
    });

    router.delete('/api/produk/:id', cekLogin, (req, res) => {
        const id = req.params.id;
        db.query("DELETE FROM produk WHERE id = ?", [id], (err) => {
            if (err) return res.status(500).json({ success: false });
            res.status(200).json({ success: true });
        });
    });

    return router;
};