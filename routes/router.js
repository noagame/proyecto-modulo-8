const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// ── Rutas existentes ─────────────────────────────────────────────────────────
router.get('/', homeController.getHome);
router.get('/status', homeController.getStatus);

// ── Rutas de la API ──────────────────────────────────────────────────────────
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const postRoutes = require('./postRoutes');
const uploadRoutes = require('./uploadRoutes');

router.use('/api/auth', authRoutes);
router.use('/api/usuarios', usuarioRoutes);
router.use('/api/posts', postRoutes);
router.use('/api/upload', uploadRoutes);

module.exports = router;

