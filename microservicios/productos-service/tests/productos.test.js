
const request = require('supertest');

jest.mock('pg', () => {
  const pool = {
    query: jest.fn(),
  };

  return {
    Pool: jest.fn(() => pool),
    __pool: pool,
  };
});

const { __pool: pool } = require('pg');
const app = require('../app');

describe('Pruebas de productos-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health responde correctamente', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.servicio).toBe('productos-service');
    expect(response.body.estado).toBe('ok');
  });

  test('GET /productos devuelve la lista de productos', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id: 1, nombre: 'Laptop', precio: '1200.00' },
      ],
      rowCount: 1,
    });

    const response = await request(app).get('/productos');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(1);
    expect(response.body[0].nombre).toBe('Laptop');
  });

  test('GET /productos/:id devuelve 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    });

    const response = await request(app).get('/productos/9999');

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Producto no encontrado');
  });
});
