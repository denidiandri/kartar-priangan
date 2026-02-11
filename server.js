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

// --- KONFIGURASI MULTER DINAMIS (SUDAH BENAR) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'public/img/produk/'; 
        
        // Cek fieldname: 'gambar' (Berita) atau 'foto' (Lapak)
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
app.use(session({
    secret: process.env.SESSION_SECRET || 'kartar-priangan-rahasia',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- KONEKSI DATABASE (MENGGUNAKAN POOL) ---
const db = mysql.createPool({
    host: process.env.MYSQLHOST || 'mysql.railway.internal',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD, 
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306, // Pakai 3306 untuk internal
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Tes koneksi Pool
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Koneksi Database Gagal: ' + err.message);
    } else {
        console.log('✅ Database Terhubung (Pool Mode)!');
        connection.release();
    }
});

// --- PENGGUNAAN ROUTES (DIPERBAIKI) ---
app.use('/', authRoutes(db));

// PERHATIKAN: webRoutes sekarang dikirimkan variabel 'upload' juga!
app.use('/', webRoutes(db, upload)); 

app.use('/', newsRoutes(db, upload)); 

// --- JARING PENGAMAN 404 ---
app.use((req, res) => {
    res.status(404).send(`Halaman tidak ketemu!`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server meluncur di port http://localhost:${PORT}`);
});