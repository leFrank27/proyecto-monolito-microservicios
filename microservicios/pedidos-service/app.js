const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'usuario_app',
  password: process.env.DB_PASSWORD || 'password_segura',
  database: process.env.DB_NAME || 'proyecto_app',
  port: process.env.DB_PORT || 5432,
});

async function validarReferencias(usuarioId, productoId) {
  const usuariosUrl = process.env.USUARIOS_URL || 'http://usuarios_service:3001';
  const productosUrl = process.env.PRODUCTOS_URL || 'http://productos_service:3002';

  try {
    const [usuarioRes, productoRes] = await Promise.all([
      fetch(`${usuariosUrl}/usuarios/${usuarioId}`),
      fetch(`${productosUrl}/productos/${productoId}`)
    ]);

    if (usuarioRes.status === 404 || productoRes.status === 404) {
      return false;
    }
    if (!usuarioRes.ok || !productoRes.ok) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error al validar referencias:', error);
    return false;
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'pedidos-service' });
});

app.get('/pedidos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

app.post('/pedidos', async (req, res) => {
  const { usuario_id, producto_id, cantidad } = req.body;

  if (![usuario_id, producto_id, cantidad].every(val => Number.isInteger(Number(val)) && Number(val) > 0)) {
    return res.status(400).json({ error: 'usuario_id, producto_id y cantidad deben ser enteros positivos' });
  }

  try {
    const esValido = await validarReferencias(usuario_id, producto_id);
    if (!esValido) {
      return res.status(400).json({ error: 'El usuario o producto indicado no existe' });
    }

    const result = await pool.query(
      'INSERT INTO pedidos (usuario_id, producto_id, cantidad) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, producto_id, cantidad]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

app.put('/pedidos/:id', async (req, res) => {
  const { usuario_id, producto_id, cantidad } = req.body;

  if (![usuario_id, producto_id, cantidad].every(val => Number.isInteger(Number(val)) && Number(val) > 0)) {
    return res.status(400).json({ error: 'usuario_id, producto_id y cantidad deben ser enteros positivos' });
  }

  try {
    const esValido = await validarReferencias(usuario_id, producto_id);
    if (!esValido) {
      return res.status(400).json({ error: 'El usuario o producto indicado no existe' });
    }

    const result = await pool.query(
      'UPDATE pedidos SET usuario_id = $1, producto_id = $2, cantidad = $3 WHERE id = $4 RETURNING *',
      [usuario_id, producto_id, cantidad, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
});

app.delete('/pedidos/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM pedidos WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json({ mensaje: 'Pedido eliminado', pedido: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

module.exports = app;
