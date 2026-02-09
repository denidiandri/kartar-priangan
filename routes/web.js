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
    console.log("✅ Sistem Rute Lapak & Upload Berhasil Dimuat");

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

    // --- API DATA PRODUK (Update dengan Filter Kategori) ---
router.get('/api/produk', (req, res) => {
    const kategori = req.query.kategori; // Menangkap kategori dari URL (misal: ?kategori=UMKM)

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

    // --- RUTE KATEGORI & BERITA ---
    router.get(['/kategori/:nama', '/berita-:nama', '/baca-berita/:id'], (req, res) => {
        res.sendFile(path.join(__dirname, '../views/kategori.html'));
    });

    // --- ADMIN AREA ---
    router.get('/admin-dashboard', cekLogin, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/admin-dashboard.html'));
    });

    // PROSES TAMBAH PRODUK
    router.post('/tambah-produk', cekLogin, upload.array('foto', 5), (req, res) => {
        const { nama_produk, kategori, harga, no_wa, deskripsi } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).send("Gagal: Mohon unggah minimal satu foto produk.");
        }

        const daftarFoto = req.files.map(file => file.filename).join(',');
        const sql = "INSERT INTO produk (nama_produk, kategori, harga, no_wa, foto, deskripsi) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [nama_produk, kategori, parseInt(harga), no_wa, daftarFoto, deskripsi];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("❌ Error Database:", err);
                return res.status(500).send("Gagal menyimpan ke database.");
            }
            res.redirect('/admin-dashboard?status=success'); 
        });
    });

    // --- RUTE HAPUS PRODUK (TAMBAHAN BARU) ---
    router.delete('/api/produk/:id', cekLogin, (req, res) => {
        const id = req.params.id;

        // 1. Ambil nama file foto dari DB
        db.query("SELECT foto FROM produk WHERE id = ?", [id], (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0) return res.status(404).send("Produk tidak ditemukan");

            // 2. Hapus file fisik di folder public/img/produk
            if (results[0].foto) {
                const fotoArray = results[0].foto.split(',');
                fotoArray.forEach(namaFile => {
                    const pathFoto = path.join(process.cwd(), 'public/img/produk', namaFile.trim());
                    if (fs.existsSync(pathFoto)) {
                        fs.unlinkSync(pathFoto);
                    }
                });
            }

            // 3. Hapus data dari database
            db.query("DELETE FROM produk WHERE id = ?", [id], (err) => {
                if (err) return res.status(500).json(err);
                console.log(`✅ Produk ID ${id} berhasil dihapus.`);
                res.status(200).send("Berhasil dihapus");
            });
        });
    });

    return router;
};