const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');

// POST   /api/posts   — Crear post (protegida con JWT)
router.post('/', authMiddleware, postController.crear);

// GET    /api/posts   — Listar todos los posts
router.get('/', postController.listar);

// GET    /api/posts/:id
router.get('/:id', postController.obtenerPorId);

// PUT    /api/posts/:id  — Protegida con JWT
router.put('/:id', authMiddleware, postController.actualizar);

// DELETE /api/posts/:id — Protegida con JWT
router.delete('/:id', authMiddleware, postController.eliminar);

module.exports = router;
