import express from 'express';
import 'dotenv/config'; 
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import multer from 'multer';
import fs from 'fs';

// --- IMPORT ROUTES ---
import authRoutes from './routes/auth.js'; 
import webRoutes from './routes/web.js'; 
import newsRoutes from './routes/news.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. MIDDLEWARE DASAR
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 2. SESSION
app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET || 'kartar-priangan-rahasia',
    resave: false, // DIUBAH ke false agar tidak boros resource/bentrok di cPanel
    saveUninitialized: false, // DIUBAH agar session hanya dibuat saat user login
    cookie: { 
        maxAge: 3600000, 
        secure: false, 
        httpOnly: true
    }
}));

// 3. KONFIGURASI MULTER
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = file.fieldname === 'gambar' ? 'public/images/' : 'public/img/produk/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const prefix = file.fieldname === 'gambar' ? 'news-' : 'produk-';
        cb(null, prefix + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 4. DATABASE (Gue tambahin handle error biar gak crash kalau DB mati)
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

// TEST KONEKSI (Biar lo tau di terminal kalau DB gagal)
db.getConnection((err, connection) => {
    if (err) console.error("❌ DB Konek Gagal:", err.message);
    else {
        console.log("✅ DB Terkoneksi!");
        connection.release();
    }
});

// Taruh di server.js
app.get('/api/user-status', (req, res) => {
    // Kita cek isAdmin sesuai yang lo set di auth.js
    if (req.session && req.session.isAdmin) {
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});

// 5. ROUTES 
// Urutan SANGAT PENTING: API dulu, baru Static Files, baru Web Routes
app.use('/', authRoutes(db)); // Seba iknya kasih prefix /auth biar gak bentrok
app.use('/api', newsRoutes(db, upload)); // Kasih prefix /api biar rapi

// 6. FILE STATIS (Folder public)
app.use(express.static(path.join(__dirname, 'public')));

// 7. WEB ROUTES (Isinya yang render HTML/Halaman)
app.use('/', webRoutes(db)); 

// 8. 404
app.use((req, res) => {
    res.status(404).send(`Halaman tidak ketemu!`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server meluncur di port ${PORT}`);
});