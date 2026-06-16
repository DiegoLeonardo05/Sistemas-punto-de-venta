# Sistema Punto de Venta

Sistema web para gestión de productos de un punto de venta, desarrollado con Node.js y SQLite.

## Integrantes

- Alejandro Castro Ramirez
- Natanael Macias Contreras
- Diego Leonardo Serrano
- Horacio Gaona Martin del Campo

## Funcionalidades

- Registrar productos con codigo, nombre, categoria, precio, stock y descripcion.
- Consultar el catalogo de productos registrados.
- Editar productos existentes.
- Eliminar productos con confirmacion previa.
- Validar campos obligatorios antes de guardar.
- Buscar productos por codigo, nombre o categoria.

## Requisitos

- Node.js v18 o superior
- sqlite3 instalado en el sistema

## Como ejecutar

```bash
npm install
npm start
```

Abrir en el navegador: `http://localhost:3000`

## Como probar

```bash
npm test
```

Las pruebas cubren:

- Rechazo de productos con campos vacios o invalidos.
- Registro, consulta y edicion de productos.
- Eliminacion de producto existente.
- Respuesta 404 al eliminar un producto inexistente.

## Base de datos

Se crea automaticamente en `data/pos.db` al iniciar el servidor.

```bash
# Ver estructura
sqlite3 data/pos.db '.schema products'

# Ver productos guardados
sqlite3 data/pos.db 'SELECT id, sku, name, category, price, stock FROM products;'
```

## API

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /api/products | Lista todos los productos |
| POST | /api/products | Crea un producto |
| PUT | /api/products/:id | Actualiza un producto |
| DELETE | /api/products/:id | Elimina un producto |
