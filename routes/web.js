import express from 'express';
const router = express.Router();
import path from 'path';
import { fileURLToPath } from 'url';
import { cekLogin } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (db) => {

    // --- RUTE PUBLIK ---
    router.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../views/index.html'));
    });

    router.get('/profil', (req, res) => {
        res.sendFile(path.join(__dirname, '../views/profil.html'));
    });

    router.get('/kontak', (req, res) => {
        res.sendFile(path.join(__dirname, '../views/kontak.html'));
    });

    router.get('/kritik', (req, res) => {
        res.sendFile(path.join(__dirname, '../views/kritik.html'));
    });

    router.get('/login', (req, res) => {
        res.sendFile(path.join(__dirname, '../views/login.html'));
    });

    // --- RUTE HALALAN KOS ---
    router.get('/kos', (req, res) => {
        res.sendFile(path.join(__dirname, '../views/kos.html'));
    });

    // --- RUTE UNTUK KATEGORI BERITA & DETAIL BERITA ---
    // Ini yang tadi hilang, supaya kategori.html bisa kebuka
    router.get(['/kategori/:nama', '/berita-:nama', '/baca-berita/:id'], (req, res) => {
        res.sendFile(path.join(__dirname, '../views/kategori.html'));
    });

    // --- RUTE ADMIN (DIJAGA SATPAM) ---
    router.get('/admin-dashboard', cekLogin, (req, res) => {
        res.sendFile(path.join(__dirname, '../views/admin-dashboard.html'));
    });

    return router;
};