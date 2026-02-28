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
    console.log("✅ Sistem Rute Berhasil Dimuat");

    // --- RUTE HALAMAN STATIS ---
    router.get('/', (req, res) => res.sendFile(path.join(__dirname, '../views/index.html')));
    router.get('/profil', (req, res) => res.sendFile(path.join(__dirname, '../views/profil.html')));
    router.get('/kontak', (req, res) => res.sendFile(path.join(__dirname, '../views/kontak.html')));
    router.get('/kritik', (req, res) => res.sendFile(path.join(__dirname, '../views/kritik.html')));
    router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../views/login.html')));
    router.get('/kos', (req, res) => res.sendFile(path.join(__dirname, '../views/kos.html')));

    // --- RUTE LAPAK ---
    router.get('/lapak', (req, res) => {
        res.sendFile(path.join(__dirname, '../views/lapak.html'), (err) => {
            if (err) res.status(404).send("File lapak.html tidak ditemukan!");
        });
    });

    // --- API DATA PRODUK ---
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

    // --- API STRUKTUR (FIX 404 & UPDATE) ---
    router.get('/api/struktur', (req, res) => {
        db.query("SELECT * FROM struktur ORDER BY id ASC", (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        });
    });

    router.get('/api/struktur/:id', (req, res) => {
        const id = req.params.id;
        db.query("SELECT * FROM struktur WHERE id = ?", [id], (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0) return res.status(404).json({ message: "Data tidak ada" });
            res.json(results[0]);
        });
    });

    // RUTE PROSES UPDATE STRUKTUR (DIUBAH KE POST AGAR TIDAK DIBLOKIR HOSTING)
    router.post('/api/struktur/:id', cekLogin, (req, res) => {
        const id = req.params.id;
        const { nama, jabatan } = req.body;
        const sql = "UPDATE struktur SET nama = ?, jabatan = ? WHERE id = ?";
        db.query(sql, [nama, jabatan, id], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Data struktur berhasil diperbarui" });
        });
    });

    // --- RUTE KATEGORI & BERITA ---
    router.get(['/kategori/:nama', '/berita-:nama', '/baca-berita/:id'], (req, res) => {
        res.sendFile(path.join(__dirname, '../views/kategori.html'));
    });

    // --- API BERITA (UNTUK EDIT) ---
    router.get('/api/berita/:id', (req, res) => {
        const id = req.params.id;
        db.query("SELECT * FROM berita WHERE id = ?", [id], (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0) return res.status(404).json({ message: "Berita tidak ada" });
            res.json(results[0]);
        });
    });

    // PROSES UPDATE BERITA (DIUBAH KE POST AGAR TIDAK DIBLOKIR HOSTING)
    router.post('/api/berita/:id', cekLogin, (req, res) => {
        const id = req.params.id;
        const { judul, isi, kategori } = req.body;
        const sql = "UPDATE berita SET judul = ?, isi = ?, kategori = ? WHERE id = ?";
        db.query(sql, [judul, isi, kategori, id], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Berita berhasil diperbarui" });
        });
    });

    // --- ADMIN AREA ---
    router.get('/admin-dashboard', cekLogin, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/admin-dashboard.html'));
    });

    // PROSES TAMBAH PRODUK
    router.post('/tambah-produk', cekLogin, upload.array('foto', 5), (req, res) => {
        const { nama_produk, kategori, harga, no_wa, deskripsi } = req.body;
        if (!req.files || req.files.length === 0) return res.status(400).send("Mohon unggah foto.");
        const daftarFoto = req.files.map(file => file.filename).join(',');
        const sql = "INSERT INTO produk (nama_produk, kategori, harga, no_wa, foto, deskripsi) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(sql, [nama_produk, kategori, parseInt(harga), no_wa, daftarFoto, deskripsi], (err) => {
            if (err) return res.status(500).send("Gagal menyimpan.");
            res.redirect('/admin-dashboard?status=success'); 
        });
    });

    // --- RUTE HAPUS PRODUK ---
    router.delete('/api/produk/:id', cekLogin, (req, res) => {
        const id = req.params.id;
        db.query("SELECT foto FROM produk WHERE id = ?", [id], (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length > 0 && results[0].foto) {
                results[0].foto.split(',').forEach(f => {
                    const p = path.join(process.cwd(), 'public/img/produk', f.trim());
                    if (fs.existsSync(p)) {
                        try { fs.unlinkSync(p); } catch(e) { console.log("Gagal hapus file:", p); }
                    }
                });
            }
            db.query("DELETE FROM produk WHERE id = ?", [id], (err) => {
                if (err) return res.status(500).json(err);
                res.status(200).send("Berhasil dihapus");
            });
        });
    });

    return router;
};