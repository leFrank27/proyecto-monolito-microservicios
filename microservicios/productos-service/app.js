
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres_db',
  user: process.env.DB_USER || 'usuario_app',
  password: process.env.DB_PASSWORD || 'password_segura',
  database: process.env.DB_NAME || 'proyecto_app',
  port: Number(process.env.DB_PORT) || 5432,
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({
    servicio: 'productos-service',
    estado: 'ok',
  });
});

// Obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al consultar productos:', err.message);
    res.status(500).json({
      error: 'Error al consultar productos',
    });
  }
});

// Obtener un producto por su ID
app.get('/productos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'El ID del producto no es válido',
      });
    }

    const result = await pool.query(
      'SELECT * FROM productos WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado',
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al consultar producto:', err.message);
    res.status(500).json({
      error: 'Error al consultar producto',
    });
  }
});

// Iniciar el servicio
const PORT = Number(process.env.PORT) || 3002;

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`productos-service ejecutándose en el puerto ${PORT}`);
  });
}

module.exports = app;
