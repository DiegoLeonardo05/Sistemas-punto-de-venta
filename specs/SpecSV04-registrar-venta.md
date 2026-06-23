# SV-04 — Registrar ventas en el sistema

| Campo | Valor |
|-------|-------|
| **ID** | SV-04 |
| **Historia / tarea** | Registrar ventas en el sistema |
| **Responsable** | Diego Serrano |
| **Estimación** | 3 horas |
| **Estado** | Por hacer |
| **Depende de** | SV-02 (arreglo `venta`), SV-03 (`calcularImportes`) |

---

## Objetivo

Persistir una venta en la base de datos: crear las tablas necesarias, exponer el endpoint
**`POST /api/sales`**, **validar el stock** en el servidor, guardar la venta y sus renglones,
**descontar el stock** de los productos vendidos y devolver la venta registrada. En el frontend,
conectar el botón **"Registrar venta"** para enviar la venta y limpiar la pantalla al confirmar.

NO genera el ticket visual (eso es SV-05); solo deja disponibles los datos de la venta registrada.

---

## Contexto

El servidor (`server.js`) es Node.js nativo y accede a SQLite con las utilidades existentes
`runSql`, `runJson` y `sqlText`. La tabla `products` ya existe con la columna `stock`. El frontend de
ventas (`ventas.js`) mantiene el arreglo `venta` con renglones
`{ id, sku, name, price, stock, cantidad }` y tiene la función `calcularImportes(venta)` de SV-03.

**Importante (seguridad de datos):** el servidor **no debe confiar** en los precios ni en el stock que
envíe el cliente. Debe releer cada producto desde la base de datos por su `id` para tomar el precio y
el stock reales, recalcular los importes y validar la disponibilidad.

---

## Alcance

### Incluye (SV-04)
- Crear las tablas `sales` y `sale_items` en `ensureDatabase()`.
- Funciones de servidor: `createSale(payload)` y `getSaleById(id)` (exportadas para pruebas).
- Endpoint `POST /api/sales`.
- Validación de stock y descuento de stock de forma atómica (transacción).
- Frontend: enviar la venta con `fetch` al pulsar `#registrar-venta`, manejar la respuesta, limpiar la
  venta y refrescar el catálogo (el stock cambió). Dejar previsto el gancho `mostrarTicket(venta)` para SV-05.

### NO incluye (otros SV)
- Render del ticket → **SV-05**
- Pruebas automatizadas del módulo → **SV-06** (aunque las funciones deben quedar exportadas y testeables)

---

## Archivos a crear / modificar

| Archivo | Acción |
|---------|--------|
| `server.js` | **Modificar** — tablas, `createSale`, `getSaleById`, ruta POST, `module.exports` |
| `public/ventas.js` | **Modificar** — enviar la venta y manejar la respuesta |

---

## Especificación del backend

### Esquema de base de datos (en `ensureDatabase()`)

```sql
CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subtotal REAL NOT NULL,
  tax REAL NOT NULL,
  total REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,      -- precio unitario al momento de la venta (snapshot)
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  subtotal REAL NOT NULL,   -- price * quantity
  FOREIGN KEY (sale_id) REFERENCES sales(id)
);
```

> Se guarda un **snapshot** de `sku`, `name` y `price` en `sale_items` porque el producto puede
> cambiar o eliminarse después sin alterar el historial de la venta.

### Contrato del endpoint

**`POST /api/sales`**

Request body:
```json
{ "items": [ { "id": 1, "cantidad": 2 }, { "id": 5, "cantidad": 1 } ] }
```

Reglas de validación (devolver `400` con `{ valid:false, errors:{...} }` salvo donde se indique):
- `items` debe ser un arreglo con al menos un elemento.
- Cada item debe tener un `id` numérico y `cantidad` entero `> 0`.
- Cada producto debe existir en `products` (si no, `404` con mensaje claro).
- La `cantidad` no puede superar el `stock` actual del producto → error de stock insuficiente
  (`409` con `{ valid:false, errors:{ stock: "Stock insuficiente para <nombre> (disponible: N)." } }`).

Cálculo (en el servidor, con precios leídos de la BD):
- `subtotal = Σ (price_bd × cantidad)`; `tax = subtotal × 0.16`; `total = subtotal + tax`.
  Usar la misma tasa de IVA (16%) que SV-03.

Persistencia atómica (transacción `BEGIN ... COMMIT`, `ROLLBACK` ante error):
1. Insertar la fila en `sales`.
2. Insertar cada renglón en `sale_items`.
3. `UPDATE products SET stock = stock - <cantidad> WHERE id = <id>` por cada item.

Respuesta `201` con la venta registrada:
```json
{
  "id": 12,
  "subtotal": 76.5, "tax": 12.24, "total": 88.74,
  "created_at": "2026-06-22 19:00:00",
  "items": [
    { "product_id": 1, "sku": "PROD-001", "name": "Cafe americano", "price": 25.5, "quantity": 2, "subtotal": 51.0 }
  ]
}
```

### Funciones a exportar
- `createSale(payload)` → `{ status, body }` (mismo patrón que `createProduct`).
- `getSaleById(id)` → la venta con sus `items`, o `null`.
- Agregar ambas (y las que necesites) a `module.exports` para que SV-06 las pruebe.

---

## Especificación del frontend (`ventas.js`)

- Al pulsar `#registrar-venta`:
  - Construir el payload `{ items: venta.map(i => ({ id: i.id, cantidad: i.cantidad })) }`.
  - `POST /api/sales` con `Content-Type: application/json`.
  - Si la respuesta es OK (`201`): guardar la venta registrada, llamar a `mostrarTicket(ventaRegistrada)`
    (gancho que implementa SV-05; por ahora puede ser `function mostrarTicket() {}`), **vaciar** el
    arreglo `venta`, re-renderizar, recargar el catálogo con `fetch("/api/products")` (el stock cambió)
    y mostrar "Venta registrada" en `#venta-status`.
  - Si hay error: mostrar el mensaje devuelto por el servidor en `#venta-status` (p. ej. stock insuficiente).
- Evitar doble envío (deshabilitar el botón mientras se procesa la petición).

---

## Restricciones técnicas

- **Solo Node.js nativo**; acceso a datos con `runSql`/`runJson`/`sqlText` existentes. Sin drivers ni ORM.
- **Sanitizar** todos los textos con `sqlText()`; nunca interpolar valores del cliente sin sanitizar.
- Recalcular importes y validar stock **en el servidor** (no confiar en el cliente).
- Mantener el patrón de errores `{ valid, errors }` y los códigos HTTP correctos (201/400/404/409/500).
- Frontend en vanilla JS; textos en español; respetar el estilo del proyecto.

---

## Criterios de aceptación

- [ ] `POST /api/sales` con items válidos crea la venta, devuelve `201` y la venta con sus renglones e importes.
- [ ] El stock de cada producto disminuye exactamente en la cantidad vendida.
- [ ] Si algún item supera el stock disponible, la venta se rechaza (`409`) y **no** se modifica ningún stock.
- [ ] Si un producto no existe, responde `404`; si `items` está vacío/ inválido, responde `400`.
- [ ] Los importes (subtotal, IVA, total) se calculan en el servidor con precios de la BD.
- [ ] En el frontend, al registrar una venta válida la pantalla se limpia, el catálogo refleja el nuevo
      stock y se muestra "Venta registrada".
- [ ] `createSale` y `getSaleById` están exportadas en `module.exports`.
- [ ] `npm test` (suite de productos existente) sigue pasando sin regresiones.
