const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Modelo Usuario
 * Representa a un usuario del sistema.
 */
const Usuario = sequelize.define('Usuario', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El nombre no puede estar vacío.' }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'El email ya está registrado.'
        },
        validate: {
            isEmail: { msg: 'El email no tiene un formato válido.' }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: { args: [6, 255], msg: 'La contraseña debe tener al menos 6 caracteres.' }
        }
    }
}, {
    tableName: 'usuarios',
    timestamps: true
});

module.exports = Usuario;
