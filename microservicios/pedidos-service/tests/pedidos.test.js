
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

describe('Pruebas de pedidos-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health responde correctamente', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body.service).toBe('pedidos-service');
  });

  test('POST /pedidos rechaza datos inválidos', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send({
        usuario_id: 0,
        producto_id: 1,
        cantidad: 2,
      });

    expect(response.statusCode).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('POST /pedidos rechaza referencias inexistentes', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 404,
      ok: false,
    });

    const response = await request(app)
      .post('/pedidos')
      .send({
        usuario_id: 9999,
        producto_id: 1,
        cantidad: 2,
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
      'El usuario o producto indicado no existe'
    );
    expect(pool.query).not.toHaveBeenCalled();

    delete global.fetch;
  });
});
