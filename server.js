import express from 'express';
import 'dotenv/config'; // Ini sudah otomatis menjalankan dotenv.config()
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import multer from 'multer';

// Import Routes
import authRoutes from './routes/auth.js'; 
import webRoutes from './routes/web.js';
import newsRoutes from './routes/news.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- KONFIGURASI MULTER (UPLOAD GAMBAR) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- KONFIGURASI SESSION ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'kartar-priangan-rahasia',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 3600000 
    }
}));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- KONEKSI DATABASE (Support Railway & Localhost) ---
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kartar_db',
    port: process.env.DB_PORT || 3306, // Railway pakai port khusus
    connectTimeout: 10000
});

db.connect((err) => {
    if (err) {
        console.error('Koneksi gagal: ' + err.stack);
        return;
    }
    console.log('Node.js & MySQL sudah JODOH dan siap beraksi di Railway!');
});

// --- PENGGUNAAN ROUTES ---
app.use('/', authRoutes(db));
app.use('/', webRoutes(db));
app.use('/', newsRoutes(db, upload));

// --- SERVER PORT ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server meluncur di port ${PORT}`);
});