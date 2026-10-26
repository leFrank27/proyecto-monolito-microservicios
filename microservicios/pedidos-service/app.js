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

app.get('/health', (req, res) => {
  res.json({ servicio: 'pedidos-service', estado: 'ok' });
});

app.get('/pedidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar pedidos' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Servicio de pedidos corriendo en el puerto ${PORT}`);
});
