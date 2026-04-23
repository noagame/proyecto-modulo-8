/**
 * controllers/authController.js
 * Sub-tarea 8.1 — Registro y Login con JWT
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, Usuario, Perfil } = require('../models');
const apiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Genera un JWT firmado con el id y email del usuario.
 * @param {object} usuario - Instancia Sequelize de Usuario.
 * @returns {string} token JWT.
 */
const generarToken = (usuario) =>
    jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Hashea la contraseña, crea el usuario + perfil en transacción y devuelve un JWT.
 */
exports.register = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { nombre, email, password, bio, avatarUrl } = req.body;

        // Verificar que el email no esté registrado
        const existe = await Usuario.findOne({ where: { email } });
        if (existe) {
            await t.rollback();
            return apiResponse.error(res, 'El email ya está registrado.', null, 409);
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Crear usuario
        const usuario = await Usuario.create(
            { nombre, email, password: passwordHash },
            { transaction: t }
        );

        // Crear perfil vacío asociado
        await Perfil.create(
            { bio: bio || null, avatarUrl: avatarUrl || null, usuarioId: usuario.id },
            { transaction: t }
        );

        await t.commit();

        const token = generarToken(usuario);

        logger.registrarAcceso(`Nuevo usuario registrado: ${email}`);

        return apiResponse.success(
            res,
            'Usuario registrado correctamente.',
            { token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } },
            201
        );
    } catch (error) {
        await t.rollback();
        logger.registrarError(`Error en register: ${error.message}`);
        next(error);
    }
};

/**
 * POST /api/auth/login
 * Verifica credenciales y firma un JWT.
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return apiResponse.error(res, 'Credenciales inválidas.', null, 401);
        }

        // Comparar contraseña
        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return apiResponse.error(res, 'Credenciales inválidas.', null, 401);
        }

        const token = generarToken(usuario);

        logger.registrarAcceso(`Login exitoso: ${email}`);

        return apiResponse.success(res, 'Login exitoso.', {
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
        });
    } catch (error) {
        logger.registrarError(`Error en login: ${error.message}`);
        next(error);
    }
};
