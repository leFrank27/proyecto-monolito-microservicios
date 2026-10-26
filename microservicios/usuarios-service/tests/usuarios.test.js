
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

describe('Pruebas de usuarios-service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health responde correctamente', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.servicio).toBe('usuarios-service');
    expect(response.body.estado).toBe('ok');
  });

  test('GET /usuarios devuelve la lista de usuarios', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id: 1, nombre: 'Juan Perez', email: 'juan@example.com' },
      ],
      rowCount: 1,
    });

    const response = await request(app).get('/usuarios');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(1);
  });

  test('GET /usuarios/:id devuelve 404 si no existe', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [],
      rowCount: 0,
    });

    const response = await request(app).get('/usuarios/9999');

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Usuario no encontrado');
  });
});
