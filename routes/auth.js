import express from 'express';
const router = express.Router();

export default (db) => {

    // --- Rute Proses Login ---
    router.post('/auth-login', (req, res) => {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Isi semua bidang!" });
        }

        db.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Terjadi kesalahan database." });
            }
            
            if (results.length > 0) {
                // Simpan sesi dengan identitas lebih kuat
                req.session.isAdmin = true;
                req.session.userId = results[0].id; // Menyimpan ID user agar sesi lebih stabil
                
                // Paksa save session sebelum kirim response agar tidak mental di hosting
                req.session.save((err) => {
                    if (err) {
                        console.error("Session Save Error:", err);
                        return res.status(500).json({ success: false, message: "Gagal menyimpan sesi." });
                    }
                    res.json({ success: true, message: "Login Berhasil!" });
                });
            } else {
                res.status(401).json({ success: false, message: "Username atau Password Salah!" });
            }
        });
    });

    // --- Rute Logout ---
    router.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) console.error("Logout Error:", err);
            res.clearCookie('kartar_sid'); // Membersihkan cookie saat logout
            res.redirect('/login');
        });
    });

    // --- Rute Cek Status Login (API) ---
    router.get('/api/user-status', (req, res) => {
        // Tambahkan header anti-cache biar statusnya real-time
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.json({ 
            isLoggedIn: !!(req.session && req.session.isAdmin) 
        });
    });

    return router;
};