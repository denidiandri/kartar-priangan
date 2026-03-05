import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import multer from 'multer';
import fs from 'fs';
dotenv.config(); //

// --- IMPORT ROUTES ---
import authRoutes from './routes/auth.js'; 
import webRoutes from './routes/web.js'; 
import newsRoutes from './routes/news.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. MIDDLEWARE DASAR ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- 2. SESSION (Optimasi buat Production/cPanel) ---
app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET || 'kartar-priangan-rahasia',
    resave: false, 
    saveUninitialized: false, 
    cookie: { 
        maxAge: 3600000, 
        secure: false, // Set ke true jika lo pakai HTTPS yang valid
        httpOnly: true
    }
}));

// --- 3. KONFIGURASI MULTER (Gunakan path.join agar folder terbaca di cPanel) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = file.fieldname === 'gambar' 
            ? path.join(__dirname, 'public/images/') 
            : path.join(__dirname, 'public/img/produk/');
        
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const prefix = file.fieldname === 'gambar' ? 'news-' : 'produk-';
        cb(null, prefix + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- 4. DATABASE (Gue benerin handle variabel .env-nya) ---
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || process.env.DB_PASS, // Support DB_PASS atau DB_PASSWORD
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// TEST KONEKSI SECARA LIVE
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ DB Konek Gagal:", err.message);
    } else {
        console.log("✅ DB Terkoneksi ke: " + process.env.DB_NAME);
        connection.release();
    }
});

// --- 5. ROUTES API & STATUS ---
// Test Route buat mastiin Node.js nyala
app.get('/api/test', (req, res) => {
    res.json({ message: "Backend Node.js Berhasil Berjalan!", status: "OK" });
});

app.get('/api/user-status', (req, res) => {
    if (req.session && req.session.isAdmin) {
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});

// Mapping Routes
app.use('/auth', authRoutes(db)); // Prefix /auth agar lebih rapi
app.use('/api', newsRoutes(db, upload)); 

// --- 6. FILE STATIS (Kunci supaya Gambar & CSS muncul) ---
app.use(express.static(path.join(__dirname, 'public')));
// Tambahan khusus folder images jika di luar public (opsional)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// --- 7. WEB ROUTES (Render HTML) ---
app.use('/', webRoutes(db)); 

// --- 8. 404 HANDLING ---
app.use((req, res) => {
    res.status(404).send(`Halaman tidak ditemukan di server Kartar!`);
});

// --- 9. SERVER LISTEN (Gunakan Port Dinamis cPanel) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server meluncur di port ${PORT}`);
});