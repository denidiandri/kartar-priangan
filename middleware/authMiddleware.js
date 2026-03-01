// middleware/authMiddleware.js

export const cekLogin = (req, res, next) => {
    if (req.session && req.session.isAdmin) {
        next(); // Jika sudah login, lanjut ke halaman tujuan
    } else {
        // Gunakan res.redirect (Server-side redirect) 
        // Ini jauh lebih stabil untuk menjaga session di hosting cPanel
        res.redirect('/login');
    }
};