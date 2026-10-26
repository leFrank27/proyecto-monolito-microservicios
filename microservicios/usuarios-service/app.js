const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'usuario_app',
  password: process.env.DB_PASSWORD || 'password_segura',
  database: process.env.DB_NAME || 'proyecto_app',
  port: process.env.DB_PORT || 5432,
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ servicio: 'usuarios-service', estado: 'ok' });
});

// Endpoint para obtener usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar usuarios' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servicio de usuarios corriendo en el puerto ${PORT}`);
});
