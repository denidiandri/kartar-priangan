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

// --- KONFIGURASI MULTER DINAMIS ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'public/img/produk/'; 
        if (file.fieldname === 'gambar') {
            dir = 'public/images/';
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const prefix = file.fieldname === 'gambar' ? 'news-' : 'produk-';
        cb(null, prefix + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- MIDDLEWARE ---
app.set('trust proxy', 1); // Wajib di hosting/cPanel agar session stabil
app.use(session({
    secret: process.env.SESSION_SECRET || 'kartar-priangan-rahasia',
    resave: false,
    saveUninitialized: false, 
    proxy: true,
    cookie: { 
        maxAge: 3600000,
        secure: false, // Set ke true hanya jika sudah pakai HTTPS/SSL
        httpOnly: true,
        sameSite: 'lax'
    }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

// --- DATABASE CONNECTION ---
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306, 
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Check database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Koneksi Database Gagal: ' + err.message);
    } else {
        console.log('✅ Database Terhubung!');
        connection.release();
    }
});

// --- PENGGUNAAN ROUTES (URUTAN DIPERBAIKI) ---

// 1. Auth Dulu (Biar rute login gak ketutup/404)
app.use('/', authRoutes(db));

// 2. Web Routes (API Settings/Struktur)
app.use('/', webRoutes(db)); 

// 3. News Routes (Berita & Upload)
app.use('/', newsRoutes(db, upload)); 

// --- JARING PENGAMAN 404 ---
app.use((req, res) => {
    res.status(404).send(`Halaman tidak ketemu!`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server meluncur di port http://localhost:${PORT}`);
}); 