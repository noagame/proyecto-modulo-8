/**
 * middlewares/uploadMiddleware.js
 * Sub-tarea 8.3 — Configuración de Multer para subida de imágenes.
 */

const multer = require('multer');
const path = require('path');

// ── Tipos MIME permitidos ─────────────────────────────────────────────────────
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

// ── Configuración de almacenamiento en disco ──────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // usuario_<id>_<timestamp>.<ext>
        const ext = path.extname(file.originalname).toLowerCase();
        const nombreUnico = `usuario_${req.usuario.id}_${Date.now()}${ext}`;
        cb(null, nombreUnico);
    }
});

// ── Filtro de tipo MIME ───────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error(
            `Tipo de archivo no permitido. Solo se aceptan: ${TIPOS_PERMITIDOS.join(', ')}.`
        );
        error.status = 415;
        cb(error, false);
    }
};

// ── Instancia de Multer ───────────────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2 MB
    }
});

module.exports = upload;
