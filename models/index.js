const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');
const Perfil = require('./Perfil');
const Post = require('./Post');

// ── Asociaciones ────────────────────────────────────────────────────────────

// Relación 1:1 — Usuario ↔ Perfil
Usuario.hasOne(Perfil, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Perfil.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Relación 1:N — Usuario → Posts
Usuario.hasMany(Post, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Post.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// ── Sincronización (solo en desarrollo) ─────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    sequelize.sync({ alter: true })
        .then(() => console.log('🔄 Modelos sincronizados con la base de datos (alter: true).'))
        .catch(err => console.error('❌ Error al sincronizar modelos:', err.message));
}

module.exports = { sequelize, Usuario, Perfil, Post };
