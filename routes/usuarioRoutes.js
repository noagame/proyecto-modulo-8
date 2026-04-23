const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST   /api/usuarios   — Crear usuario + perfil (transacción)
router.post('/', usuarioController.crear);

// GET    /api/usuarios   — Listar todos los usuarios
router.get('/', usuarioController.listar);

// GET    /api/usuarios/:id
router.get('/:id', usuarioController.obtenerPorId);

// PUT    /api/usuarios/:id  — Protegida con JWT
router.put('/:id', authMiddleware, usuarioController.actualizar);

// DELETE /api/usuarios/:id — Protegida con JWT
router.delete('/:id', authMiddleware, usuarioController.eliminar);

module.exports = router;
