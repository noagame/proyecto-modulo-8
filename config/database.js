const { Sequelize } = require('sequelize');

// Instancia de Sequelize con variables de entorno
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: process.env.DB_DIALECT || 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
);

/**
 * Verifica la conexión a la base de datos.
 * Se debe llamar antes de iniciar el servidor.
 */
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente.');
    } catch (error) {
        console.error('❌ Error al conectar con PostgreSQL:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };