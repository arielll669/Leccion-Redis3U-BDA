const express = require('express');
const redis = require('redis');
const responseTime = require('response-time');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(responseTime((req, res, time) => {
  console.log(`${req.method} ${req.url} - ${time.toFixed(2)}ms`);
}));

const client = redis.createClient({
  socket: {
    host: 'localhost',
    port: 6379
  }
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Conectado a Redis'));

async function connectRedis() {
  try {
    await client.connect();
  } catch (error) {
    console.error('Error conectando a Redis:', error);
    process.exit(1);
  }
}

app.post('/seed', async (req, res) => {
  const startTime = Date.now();

  try {
    const dataPath = path.join(__dirname, 'data', 'tecnomega.json');
    const jsonData = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(jsonData);

    let totalInserted = 0;
    const collections = ['clientes', 'productos', 'pedidos', 'detalle_pedido'];

    for (const collection of collections) {
      const records = data[collection];

      if (!records || !Array.isArray(records)) continue;

      const setKey = `${collection}:index`;

      for (const record of records) {
        const key = `${collection}:${record.id}`;

        await client.set(key, JSON.stringify(record));

        await client.sAdd(setKey, record.id);

        totalInserted++;
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    res.json({
      success: true,
      message: 'Datos cargados exitosamente',
      totalInserted,
      duracion: `${duration}ms`,
      collections: {
        clientes: data.clientes.length,
        productos: data.productos.length,
        pedidos: data.pedidos.length,
        detalle_pedido: data.detalle_pedido.length
      }
    });

  } catch (error) {
    console.error('Error en seed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const data = req.body;

    if (!data.id) {
      return res.status(400).json({
        success: false,
        error: 'El registro debe tener un campo "id"'
      });
    }

    const key = `${collection}:${data.id}`;
    const setKey = `${collection}:index`;

    await client.set(key, JSON.stringify(data));

    await client.sAdd(setKey, data.id);

    res.json({
      success: true,
      message: `Registro guardado en ${collection}`,
      data
    });

  } catch (error) {
    console.error('Error guardando registro:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const key = `${collection}:${id}`;

    const data = await client.get(key);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Registro no encontrado'
      });
    }

    res.json({
      success: true,
      data: JSON.parse(data)
    });

  } catch (error) {
    console.error('Error obteniendo registro:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const setKey = `${collection}:index`;

    const ids = await client.sMembers(setKey);

    if (ids.length === 0) {
      return res.json({
        success: true,
        collection,
        count: 0,
        data: []
      });
    }

    const records = [];
    for (const id of ids) {
      const key = `${collection}:${id}`;
      const data = await client.get(key);
      if (data) {
        records.push(JSON.parse(data));
      }
    }

    res.json({
      success: true,
      collection,
      count: records.length,
      data: records
    });

  } catch (error) {
    console.error('Error listando registros:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'API TecnoMega - Redis + Node.js',
    endpoints: {
      seed: 'POST /seed - Carga masiva desde JSON',
      crear: 'POST /:collection - Guardar un registro',
      obtener: 'GET /:collection/:id - Obtener un registro',
      listar: 'GET /:collection - Listar todos los registros'
    },
    collections: ['clientes', 'productos', 'pedidos', 'detalle_pedido']
  });
});

async function startServer() {
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer();
