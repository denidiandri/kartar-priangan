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

// 1. MIDDLEWARE DASAR (Hanya Sekali)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 2. SESSION (Pake settingan paling stabil buat cPanel)
app.set('trust proxy', 1); // Tambahan agar session stabil di hosting
app.use(session({
    secret: process.env.SESSION_SECRET || 'kartar-priangan-rahasia',
    resave: true, 
    saveUninitialized: true,
    cookie: { 
        maxAge: 3600000, 
        secure: false, // Wajib false kalau belum HTTPS
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

// 4. DATABASE
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

// 5. ROUTES (Prioritaskan API sebelum Static File)
app.use('/', authRoutes(db));
app.use('/', newsRoutes(db, upload)); 

// File Statis ditaruh di sini agar tidak memblokir rute API
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', webRoutes(db)); 

// 6. 404
app.use((req, res) => {
    res.status(404).send(`Halaman tidak ketemu!`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server meluncur di port ${PORT}`);
});