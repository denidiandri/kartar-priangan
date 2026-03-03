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
                req.session.isAdmin = true;
                req.session.userId = results[0].id;
                
                req.session.save((err) => {
                    if (err) return res.status(500).json({ success: false, message: "Gagal menyimpan sesi." });
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
            res.clearCookie('connect.sid'); // Nama default cookie express-session
            res.redirect('/login');
        });
    });

    return router;
};