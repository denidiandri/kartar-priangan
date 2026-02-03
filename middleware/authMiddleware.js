// middleware/authMiddleware.js

export const cekLogin = (req, res, next) => {
    if (req.session.isAdmin) {
        next(); // Jika sudah login, lanjut ke halaman tujuan
    } else {
        // Jika belum login, tampilkan alert dan tendang balik ke halaman login
        res.send("<script>alert('Sesi habis atau belum login!'); window.location.href='/login';</script>");
    }
};