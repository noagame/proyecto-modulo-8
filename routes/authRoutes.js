/**
 * routes/authRoutes.js
 * Sub-tarea 8.1 — Rutas de autenticación.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register — Registro de nuevo usuario
router.post('/register', authController.register);

// POST /api/auth/login — Login con credenciales
router.post('/login', authController.login);

module.exports = router;
