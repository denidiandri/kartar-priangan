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

// --- KONFIGURASI MULTER (Wajib Ada Buat Upload Gambar) ---
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

// --- MIDDLEWARE UTAMA ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- SESSION CONFIG ---
app.set('trust proxy', 1); 
app.use(session({
    secret: process.env.SESSION_SECRET || 'kartar-priangan-rahasia',
    resave: false,
    saveUninitialized: false, 
    proxy: true,
    name: 'kartar_sid',
    cookie: { 
        maxAge: 3600000,
        secure: false,
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// --- DATABASE CONNECTION ---
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

// --- PENGGUNAAN ROUTES (URUTAN TERBAIK) ---

// 1. News & API Dulu (Sertakan 'upload' agar bisa post gambar)
app.use('/', newsRoutes(db, upload)); 
app.use('/', authRoutes(db));

// 2. File Statis (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// 3. Web Routes (Halaman HTML)
app.use('/', webRoutes(db)); 

// --- JARING PENGAMAN 404 ---
app.use((req, res) => {
    res.status(404).send(`Halaman tidak ketemu!`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server meluncur di port ${PORT}`);
});