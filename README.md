# Módulo 7 — Persistencia con PostgreSQL y Sequelize

> **Repositorio**: [noagame/proyecto-modulo-7](https://github.com/noagame/proyecto-modulo-7)  
> **Estudiante**: Fabián Del Villar  
> **Stack**: Node.js · Express · Sequelize · PostgreSQL

---

## Tabla de Contenidos

1. [Descripción](#descripción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Instalación](#instalación)
4. [Variables de Entorno](#variables-de-entorno)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Modelos y Relaciones](#modelos-y-relaciones)
7. [Endpoints CRUD](#endpoints-crud)
8. [Transacciones y Rollback](#transacciones-y-rollback)
9. [Manejo de Errores](#manejo-de-errores)
10. [Ejecución](#ejecución)
11. [Ejemplos de Uso (curl / Postman)](#ejemplos-de-uso)
12. [Logs del Sistema](#logs-del-sistema)
13. [Tips y Recomendaciones](#tips-y-recomendaciones)
14. [Posibles Errores y Soluciones](#posibles-errores-y-soluciones)
15. [Observaciones Técnicas](#observaciones-técnicas)

---

## Descripción

El **Módulo 7** extiende la arquitectura del Módulo 6 añadiendo una capa de persistencia real con **PostgreSQL** gestionada a través del ORM **Sequelize**. Se implementan:

- Conexión a base de datos con `sequelize.authenticate()` antes de iniciar el servidor.
- Tres modelos relacionados: `Usuario`, `Perfil` (1:1) y `Post` (1:N).
- CRUD completo para `Usuario` y `Post` a través de una API REST.
- **Transacciones atómicas** con rollback automático al crear Usuario + Perfil.
- Middleware de errores mejorado para capturar errores de Sequelize (validación y unicidad).

---

## Requisitos del Sistema

| Herramienta | Versión mínima |
|---|---|
| Node.js | v18.0.0 |
| npm | v8.0.0 |
| PostgreSQL | v13.0 |
| Sistema Operativo | Linux / macOS / Windows |

### Verificar versiones instaladas

```bash
node --version    # >= v18.0.0
npm --version     # >= v8.0.0
psql --version    # >= 13.0
```

> [!TIP]
> Si no tienes PostgreSQL instalado en Linux, usa:
> ```bash
> sudo apt update && sudo apt install postgresql postgresql-contrib
> sudo systemctl start postgresql
> ```

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/noagame/proyecto-modulo-7
cd proyecto-modulo-7
```

### 2. Instalar dependencias

```bash
npm install
```

**Dependencias instaladas:**

| Paquete | Rol |
|---|---|
| `express` | Framework HTTP |
| `dotenv` | Variables de entorno |
| `sequelize` | ORM para SQL |
| `pg` | Driver de PostgreSQL |
| `pg-hstore` | Serialización de campos hstore |
| `nodemon` *(dev)* | Reinicio automático en desarrollo |

### 3. Crear la base de datos en PostgreSQL

```bash
# Acceder como superusuario de PostgreSQL
sudo -u postgres psql

# Dentro de psql:
CREATE USER modulo7_db WITH PASSWORD 'test1';
CREATE DATABASE modulo7_db OWNER modulo7_db;
GRANT ALL PRIVILEGES ON DATABASE modulo7_db TO modulo7_db;
\q
```

> [!IMPORTANT]
> La base de datos debe existir **antes** de arrancar el servidor.
> Sequelize crea las tablas automáticamente con `sync({ alter: true })` en desarrollo,
> pero no puede crear la base de datos en sí.

---

## Variables de Entorno

Crear el archivo `.env` en la raíz del proyecto (ya incluido en `.gitignore`):

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos PostgreSQL
DB_HOST=localhost
DB_USER=modulo7_db
DB_PASS=test1
DB_NAME=modulo7_db
DB_PORT=5432
DB_DIALECT=postgres
```

> [!TIP]
> Existe un archivo `config/database.js` que lee estas variables.
> Si cambias el nombre de usuario o contraseña en PostgreSQL,
> recuerda actualizar `.env` con los valores correctos.

> [!WARNING]
> Nunca subas el archivo `.env` a GitHub. Verifica que `.gitignore`
> contenga la línea `.env` antes de hacer cualquier commit.

---

## Estructura del Proyecto

```
proyecto-modulo-7/
│
├── index.js                    # Punto de entrada — conecta DB y levanta servidor
├── package.json
├── .env                        # Variables de entorno (gitignored)
├── .gitignore
├── README.md
│
├── config/
│   └── database.js             # Instancia Sequelize + función connectDB()
│
├── models/
│   ├── index.js                # Asociaciones + sequelize.sync()
│   ├── Usuario.js              # Modelo Usuario (nombre, email, password)
│   ├── Perfil.js               # Modelo Perfil — relación 1:1 con Usuario
│   └── Post.js                 # Modelo Post   — relación 1:N con Usuario
│
├── controllers/
│   ├── homeController.js       # Rutas base (/, /status)
│   ├── usuarioController.js    # CRUD Usuario + transacción
│   └── postController.js       # CRUD Post
│
├── routes/
│   ├── router.js               # Router principal (monta /api/*)
│   ├── usuarioRoutes.js        # Rutas /api/usuarios
│   └── postRoutes.js           # Rutas /api/posts
│
├── middlewares/
│   ├── logginMiddleware.js     # Log de cada request HTTP
│   └── errorMiddleware.js      # Manejo global de errores + errores Sequelize
│
├── utils/
│   └── logger.js               # Escritura en archivo de logs
│
├── logs/
│   └── log.txt                 # Registro de accesos y errores
│
└── public/
    └── index.html              # Página estática de bienvenida
```

---

## Modelos y Relaciones

### Diagrama de Relaciones

```
┌─────────────┐         ┌─────────────┐
│   Usuario   │ 1 ──── 1│    Perfil   │
│─────────────│         │─────────────│
│ nombre      │         │ bio         │
│ email       │         │ avatarUrl   │
│ password    │         │ usuarioId   │
└─────────────┘         └─────────────┘
       │
       │ 1 ──── N
       ▼
┌─────────────┐
│    Post     │
│─────────────│
│ titulo      │
│ contenido   │
│ usuarioId   │
└─────────────┘
```

### Descripción de modelos

| Modelo | Tabla | Campos clave | Relación |
|---|---|---|---|
| `Usuario` | `usuarios` | nombre, email (unique), password | — |
| `Perfil` | `perfiles` | bio, avatarUrl, usuarioId | `belongsTo Usuario` (1:1) |
| `Post` | `posts` | titulo, contenido, usuarioId | `belongsTo Usuario` (1:N) |

> [!NOTE]
> `sequelize.sync({ alter: true })` se ejecuta **solo cuando `NODE_ENV=development`**.
> En producción deberías usar migraciones (`sequelize-cli`) en lugar de `sync`.

---

## Endpoints CRUD

### Usuarios — `/api/usuarios`

| Método | Endpoint | Descripción | Body requerido |
|---|---|---|---|
| `POST` | `/api/usuarios` | Crear usuario + perfil (transacción) | `nombre`, `email`, `password` |
| `GET` | `/api/usuarios` | Listar todos los usuarios con perfil | — |
| `GET` | `/api/usuarios/:id` | Obtener usuario por ID | — |
| `PUT` | `/api/usuarios/:id` | Actualizar datos del usuario | campos a modificar |
| `DELETE` | `/api/usuarios/:id` | Eliminar usuario (y perfil por CASCADE) | — |

### Posts — `/api/posts`

| Método | Endpoint | Descripción | Body requerido |
|---|---|---|---|
| `POST` | `/api/posts` | Crear post | `titulo`, `contenido`, `usuarioId` |
| `GET` | `/api/posts` | Listar todos los posts con autor | — |
| `GET` | `/api/posts/:id` | Obtener post por ID | — |
| `PUT` | `/api/posts/:id` | Actualizar post | campos a modificar |
| `DELETE` | `/api/posts/:id` | Eliminar post | — |

### Rutas de sistema

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/` | Página HTML de bienvenida |
| `GET` | `/status` | Estado del servidor en JSON |

---

## Transacciones y Rollback

La creación de un **Usuario** y su **Perfil** se realiza dentro de una única transacción:

```
POST /api/usuarios
         │
         ├── BEGIN TRANSACTION
         │
         ├── INSERT INTO usuarios ...  ✅
         ├── INSERT INTO perfiles ...  ✅
         │
         └── COMMIT ──► 201 Created
                   │
                   └── Si falla cualquier INSERT ──► ROLLBACK automático
                                                        logger.registrarError()
                                                        next(error) → errorMiddleware
```

> [!TIP]
> Si el email ya existe, Sequelize lanzará un `UniqueConstraintError` antes de llegar
> al segundo INSERT. El rollback es inmediato y no queda ningún registro a medias.

---

## Manejo de Errores

El `errorMiddleware.js` intercepta tres categorías:

| Tipo de Error | Status HTTP | Causa |
|---|---|---|
| `ValidationError` (Sequelize) | `400 Bad Request` | Campo requerido vacío, formato inválido |
| `UniqueConstraintError` (Sequelize) | `409 Conflict` | Email ya registrado |
| Error genérico | `500 Internal Server Error` | Error inesperado del servidor |

**Ejemplo de respuesta 400:**
```json
{
  "error": "Error de validación.",
  "detalles": ["El email no tiene un formato válido."],
  "timestamp": "2026-04-23T22:30:00.000Z",
  "path": "/api/usuarios"
}
```

**Ejemplo de respuesta 409:**
```json
{
  "error": "El recurso ya existe.",
  "detalles": ["El email ya está registrado."],
  "timestamp": "2026-04-23T22:30:00.000Z",
  "path": "/api/usuarios"
}
```

---

## Ejecución

### Modo desarrollo (con nodemon)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

**Salida esperada en consola:**

```
🔄 Modelos sincronizados con la base de datos (alter: true).
✅ Conexión a PostgreSQL establecida correctamente.
Servidor en http://localhost:3000
    Rutas disponibles:
        - GET  http://localhost:3000/
        - GET  http://localhost:3000/status
        - POST http://localhost:3000/api/usuarios
        - GET  http://localhost:3000/api/usuarios
        - POST http://localhost:3000/api/posts
        - GET  http://localhost:3000/api/posts
```

---

## Ejemplos de Uso

### Con `curl`

```bash
# Crear usuario (con perfil en transacción)
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana López","email":"ana@mail.com","password":"secret123","bio":"Dev fullstack","avatarUrl":"https://i.pravatar.cc/150"}'

# Listar usuarios
curl http://localhost:3000/api/usuarios | jq

# Obtener usuario por ID
curl http://localhost:3000/api/usuarios/1 | jq

# Actualizar usuario
curl -X PUT http://localhost:3000/api/usuarios/1 \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana García"}'

# Eliminar usuario
curl -X DELETE http://localhost:3000/api/usuarios/1

# Crear post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Mi primer post","contenido":"Hola mundo desde la API","usuarioId":1}'

# Listar posts
curl http://localhost:3000/api/posts | jq
```

### Con Postman

1. Importar colección nueva → **New Request**
2. Seleccionar método (`POST`, `GET`, `PUT`, `DELETE`)
3. URL: `http://localhost:3000/api/usuarios`
4. En `Body` → `raw` → `JSON`, pegar el payload
5. Enviar y revisar la respuesta

> [!TIP]
> Instala la extensión **Thunder Client** en VS Code para probar la API
> directamente desde el editor sin abrir Postman.

---

## Logs del Sistema

Todos los accesos y errores quedan registrados en `logs/log.txt`:

```bash
# Ver todos los logs
cat logs/log.txt

# Últimas 20 líneas en tiempo real
tail -f logs/log.txt

# Filtrar solo errores
grep "ERROR" logs/log.txt

# Filtrar por ruta
grep "/api/usuarios" logs/log.txt
```

---

## Tips y Recomendaciones

> [!TIP]
> **`alter: true` vs migraciones** — En desarrollo, `sync({ alter: true })` modifica
> las tablas para reflejar cambios en los modelos sin borrar datos.
> Para producción, usa `sequelize-cli` con migraciones versionadas:
> ```bash
> npx sequelize-cli migration:generate --name add-campo-usuario
> npx sequelize-cli db:migrate
> ```

> [!TIP]
> **Hashear contraseñas** — El campo `password` actualmente guarda texto plano.
> En un entorno real, instala `bcryptjs` y hashea antes de guardar:
> ```javascript
> const bcrypt = require('bcryptjs');
> const hash = await bcrypt.hash(password, 10);
> await Usuario.create({ ..., password: hash }, { transaction: t });
> ```

> [!TIP]
> **Variables de entorno en producción** — No uses `.env` en producción.
> Configura las variables directamente en el entorno de tu servidor
> (variables de sistema, secretos de Docker, etc.).

> [!TIP]
> **Paginación en listados** — Para bases de datos grandes, agrega paginación
> a los endpoints GET:
> ```javascript
> const { page = 1, limit = 10 } = req.query;
> const offset = (page - 1) * limit;
> const posts = await Post.findAndCountAll({ limit, offset });
> ```

> [!TIP]
> **Logging SQL en producción** — Desactiva el logging de queries de Sequelize
> asegurándote de que `NODE_ENV=production` en `.env`. Ya está configurado en
> `config/database.js` para mostrar queries solo en desarrollo.

---

## Posibles Errores y Soluciones

### ❌ `ECONNREFUSED` al conectar con PostgreSQL

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causa**: PostgreSQL no está corriendo.

**Solución**:
```bash
# Linux / macOS
sudo systemctl start postgresql

# o con pg_ctl
pg_ctl start -D /var/lib/postgresql/data
```

---

### ❌ `password authentication failed for user "modulo7_db"`

**Causa**: Las credenciales en `.env` no coinciden con las configuradas en PostgreSQL.

**Solución**:
```bash
sudo -u postgres psql
ALTER USER modulo7_db WITH PASSWORD 'test1';
\q
```

---

### ❌ `database "modulo7_db" does not exist`

**Causa**: La base de datos no fue creada antes de arrancar el servidor.

**Solución**:
```bash
sudo -u postgres psql -c "CREATE DATABASE modulo7_db OWNER modulo7_db;"
```

---

### ❌ `Cannot find module 'sequelize'`

**Causa**: Los paquetes no están instalados (falta `npm install`).

**Solución**:
```bash
npm install
```

---

### ❌ `UniqueConstraintError` al crear usuario

```json
{ "error": "El recurso ya existe.", "detalles": ["El email ya está registrado."] }
```

**Causa**: Ya existe un usuario con ese email en la base de datos.

**Solución**: Usa un email diferente o limpia la tabla de prueba:
```bash
sudo -u postgres psql -d modulo7_db -c "DELETE FROM usuarios;"
```

---

### ❌ `ValidationError` — campo requerido vacío

```json
{ "error": "Error de validación.", "detalles": ["El nombre no puede estar vacío."] }
```

**Causa**: El body del request no incluye todos los campos requeridos.

**Solución**: Asegúrate de enviar `Content-Type: application/json` y el body completo.

---

### ❌ `Cannot find module './install'` (error al instalar)

**Causa**: El usuario escribió `nstall` en lugar de `npm install` (falta la `i`).

**Solución**:
```bash
npm install sequelize pg pg-hstore
```

---

### ❌ `RollbackError` en transacción

**Causa**: La transacción fue comprometida o revertida antes de que Sequelize pudiera hacer rollback automáticamente (por ejemplo, llamar a `t.commit()` y luego lanzar un error).

**Solución**: Nunca llames a `t.commit()` o `t.rollback()` manualmente dentro de un bloque `try/catch` si usas `{ transaction: t }` en cada operación. El patrón correcto es:

```javascript
const t = await sequelize.transaction();
try {
    await Model.create({ ... }, { transaction: t });
    await t.commit();         // Solo al final, si todo OK
} catch (error) {
    await t.rollback();       // Solo en catch
    next(error);
}
```

---

## Observaciones Técnicas

> [!NOTE]
> **Orden de arranque**: El servidor no inicia hasta que `connectDB()` resuelve
> con éxito. Esto garantiza que ninguna petición HTTP llega antes de que la
> conexión a la base de datos esté establecida.

> [!NOTE]
> **CASCADE en eliminación**: Al eliminar un `Usuario`, su `Perfil` asociado
> se elimina automáticamente por `onDelete: 'CASCADE'` definido en las asociaciones.
> Los `Post` del usuario también se eliminan. Ten cuidado en entornos de producción.

> [!NOTE]
> **`alter: true` puede ser destructivo**: Si renombras un campo en el modelo,
> Sequelize puede crear una columna nueva y dejar la vieja intacta, perdiendo datos.
> Usa siempre migraciones en producción.

> [!NOTE]
> **`pg-hstore`** es requerido por Sequelize para manejar el tipo de datos `HSTORE`
> de PostgreSQL, aunque no lo uses directamente. Debe estar instalado.

> [!NOTE]
> **El `errorMiddleware` debe ser el último `app.use()`** en `index.js`.
> Express lo reconoce como manejador de errores por su firma de 4 argumentos
> `(err, req, res, next)`. Si hay cualquier otro middleware después, los errores
> no llegarán a él correctamente.

---

## Créditos

**Proyecto**: Evaluación Integrada — Módulo 7  
**Estudiante**: Fabián Del Villar  
**Módulos cubiertos**: Sub-tareas 7.2 · 7.3 · 7.4 · 7.5 · 7.6

---