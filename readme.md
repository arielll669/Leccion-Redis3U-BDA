# TecnoMega API - Sistema de Compra/Venta de Productos Tecnológicos

API REST desarrollada con Node.js, Express y Redis como base de datos NoSQL clave-valor.

## Descripción

Esta API permite gestionar un sistema de compra/venta de productos tecnológicos con las siguientes funcionalidades:
- Carga masiva de datos desde archivo JSON
- Operaciones CRUD sobre 4 colecciones principales
- Medición de tiempos de respuesta
- Almacenamiento en Redis usando patrón clave-valor

## Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **Redis** - Base de datos NoSQL clave-valor
- **response-time** - Middleware para medir tiempos de respuesta

## Instalación

1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd Leccion3Parcial
```

2. Instalar dependencias
```bash
npm install
```

3. Asegurarse de que Redis esté corriendo
```bash
redis-cli ping
# Debería responder: PONG
```

4. Iniciar la aplicación
```bash
node index.js
```

La API estará disponible en `http://localhost:3000`

## Modelo de Datos

### Colecciones

#### 1. **clientes**
- `id`: Identificador único
- `cedula`: Cédula o DNI
- `nombres`: Nombre completo
- `email`: Correo electrónico
- `telefono`: Número de teléfono
- `edad`: Edad del cliente
- `genero`: Género (M/F)

#### 2. **productos**
- `id`: Identificador único
- `codigo`: Código del producto
- `nombre`: Nombre del producto
- `categoria`: Categoría del producto
- `precio`: Precio unitario
- `stock`: Cantidad disponible

#### 3. **pedidos**
- `id`: Identificador único
- `codigo`: Código del pedido
- `clienteId`: ID del cliente
- `fecha`: Fecha del pedido
- `subtotal`: Subtotal sin IVA
- `iva`: Valor del IVA
- `total`: Total a pagar
- `estado`: Estado del pedido (pendiente/completado/en_proceso)

#### 4. **detalle_pedido**
- `id`: Identificador único
- `codigo`: Código del detalle
- `pedidoId`: ID del pedido
- `productoId`: ID del producto
- `cantidad`: Cantidad de productos
- `detalle`: Descripción adicional
- `precioUnit`: Precio unitario

## Endpoints

### 1. Información de la API
```
GET /
```
Retorna información general de la API y endpoints disponibles.

### 2. Carga Masiva (Seed)
```
POST /seed
```
Carga todos los datos desde `data/tecnomega.json` a Redis.

**Respuesta:**
```json
{
  "success": true,
  "message": "Datos cargados exitosamente",
  "totalInserted": 40,
  "duracion": "150ms",
  "collections": {
    "clientes": 10,
    "productos": 10,
    "pedidos": 10,
    "detalle_pedido": 10
  }
}
```

### 3. Crear un registro
```
POST /:collection
```

**Body (JSON):**
```json
{
  "id": "PROD011",
  "codigo": "RAM-CORS-011",
  "nombre": "RAM Corsair Vengeance 16GB",
  "categoria": "Componentes",
  "precio": 120.00,
  "stock": 20
}
```

**Colecciones válidas:** `clientes`, `productos`, `pedidos`, `detalle_pedido`

### 4. Obtener un registro
```
GET /:collection/:id
```

**Ejemplo:**
```
GET /productos/PROD001
```

### 5. Listar todos los registros
```
GET /:collection
```

**Ejemplo:**
```
GET /clientes
```

## Estructura de Redis

### Patrón de Claves
Cada registro se almacena con el patrón:
```
coleccion:id
```

Ejemplos:
- `clientes:CLI001`
- `productos:PROD001`
- `pedidos:PED001`
- `detalle_pedido:DET001`

### Índices con Sets
Cada colección mantiene un Set con todos los IDs:
```
coleccion:index
```

Ejemplos:
- `clientes:index` → {CLI001, CLI002, CLI003, ...}
- `productos:index` → {PROD001, PROD002, PROD003, ...}

## Middleware Response-Time

Cada petición muestra en consola el tiempo de respuesta:
```
POST /seed - 145.23ms
GET /productos - 12.45ms
GET /clientes/CLI001 - 3.21ms
```

## Estructura del Proyecto
```
Leccion3Parcial/
│
├── data/
│   └── tecnomega.json      # Datos iniciales (10 registros por tabla)
│
├── index.js                 # Archivo principal de la API
├── package.json             # Dependencias del proyecto
└── README.md                # Documentación
```

## Pruebas con Postman

### Colección de pruebas realizadas:

1. GET / - Información de la API
2. POST /seed - Carga masiva de datos
3. GET /clientes - Listar todos los clientes
4. GET /clientes/CLI001 - Obtener un cliente específico
5. GET /productos - Listar todos los productos
6. POST /productos - Crear nuevo producto
7. GET /productos/PROD011 - Verificar producto creado
8. GET /pedidos - Listar todos los pedidos
9. GET /detalle_pedido - Listar detalles de pedidos

## Evidencias

Ver capturas de pantalla en la carpeta `evidencias/` del proyecto.

## Autor

**Nombre:** Ariel Llumiquinga
**Materia:** Base de Datos Avanzada
**Institución:** Universidad de las fuerzas Armadas ESPE
**Fecha:** Febrero 2026

## Notas

- Todos los datos son de prueba y generados para fines educativos
- La API incluye manejo de errores básico
- Los tiempos de respuesta se muestran en consola gracias al middleware `response-time`
- Redis debe estar corriendo en `localhost:6379`

## Referencias

- [Express.js Documentation](https://expressjs.com/)
- [Redis Node.js Client](https://github.com/redis/node-redis)
- [Response-Time Middleware](https://www.npmjs.com/package/response-time)