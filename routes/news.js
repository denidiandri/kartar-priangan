import express from 'express';
import path from 'path'; 
import fs from 'fs';   
import { fileURLToPath } from 'url';
import { cekLogin } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (db, upload) => {
    const router = express.Router();

    // --- FITUR KRITIK & SARAN ---
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

    // --- FITUR BERITA ---
    // Ambil semua berita
    router.get('/api/berita', (req, res) => {
        db.query("SELECT * FROM berita ORDER BY id DESC", (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        });
    });

    // Ambil satu berita (untuk modal edit)
    router.get('/api/berita/:id', (req, res) => {
        const id = req.params.id;
        db.query("SELECT * FROM berita WHERE id = ?", [id], (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results[0] || {});
        });
    });

    // Proses Tambah Berita
    router.post('/tambah-berita', cekLogin, upload.single('gambar'), (req, res) => {
        const { judul, isi, kategori } = req.body; 
        const gambar = req.file ? `/images/${req.file.filename}` : '';
        const query = "INSERT INTO berita (judul, isi, gambar, kategori) VALUES (?, ?, ?, ?)";
        
        db.query(query, [judul, isi, gambar, kategori], (err) => {
            if (err) return res.status(500).send("Gagal menambah berita.");
            res.send("<script>alert('Berita berhasil dipublish!'); window.location.href='/admin-dashboard';</script>");
        });
    });

    // Proses Update Berita (Diubah ke POST & URL disingkat agar sinkron)
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