/**
 * routes/uploadRoutes.js
 * Sub-tarea 8.3 — Rutas de subida de archivos.
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const uploadController = require('../controllers/uploadController');

// POST /api/upload/avatar — Protegida; acepta un campo "avatar"
router.post(
    '/avatar',
    authMiddleware,
    upload.single('avatar'),
    uploadController.subirAvatar
);

module.exports = router;
