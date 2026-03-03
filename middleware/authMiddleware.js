// middleware/authMiddleware.js

export const cekLogin = (req, res, next) => {
    // 1. Cek apakah ada session admin
    if (req.session && req.session.isAdmin) {
        return next(); // Jika OK, lanjut!
    }

    // 2. Jika sesi habis, cek jenis permintaannya
    const isApiRequest = req.xhr || (req.headers.accept && req.headers.accept.includes('json'));

    if (isApiRequest) {
        // Jika script yang minta data, kirim status 401 biar dashboard lo gak crash
        return res.status(401).json({ 
            success: false, 
            message: "Sesi habis, silakan login kembali." 
        });
    } else {
        // Jika buka halaman langsung, lempar ke halaman login
        return res.redirect('/login');
    }
};