# SV-06 — Realizar pruebas funcionales del módulo de ventas

| Campo | Valor |
|-------|-------|
| **ID** | SV-06 |
| **Historia / tarea** | Realizar pruebas funcionales del módulo de ventas |
| **Responsable** | Alejandro Castro |
| **Estimación** | 3 horas |
| **Estado** | Por hacer |
| **Depende de** | SV-04 (funciones `createSale` y `getSaleById` exportadas en `server.js`) |

---

## Objetivo

Escribir **pruebas automatizadas** que validen el comportamiento del backend del módulo de ventas
(SV-04): registro de ventas, cálculo de importes, descuento de stock y manejo de errores. Las pruebas
usan el runner nativo `node:test` y siguen el mismo patrón que `test/products.test.js`.

---

## Guía para el responsable (Alejandro)

Esta sección explica el "qué" y el "por qué" para que puedas revisar, ejecutar y defender las pruebas
en el Sprint Review, aunque el código lo genere la IA.

### ¿Qué es una "prueba funcional" aquí?
Verificamos que cada función del backend de ventas **haga lo que promete**: que al registrar una venta
se guarde correctamente, se calculen bien los importes y se descuente el stock; y que ante datos
inválidos responda con el error correcto. Probamos las funciones de `server.js` directamente (sin
levantar el servidor HTTP), igual que ya se hace con los productos.

### ¿Cómo se ejecutan?
```bash
npm test
```
Esto corre `node --test`, que ejecuta todos los archivos `*.test.js` de `test/`. Al terminar muestra un
resumen (`tests`, `pass`, `fail`). **Todas deben pasar.**

### ¿Cómo está aislada la base de datos?
Las pruebas usan una base SQLite temporal (vía `process.env.DB_PATH`) para no tocar `data/pos.db`.
Cada prueba prepara sus propios productos antes de registrar ventas.

### ¿Qué debes revisar tú?
- Que cada caso de la tabla de abajo exista y pase.
- Que los nombres de las pruebas describan con claridad lo que validan (en español).
- Que al correr `npm test` el resultado sea verde (0 fallos), incluidas las pruebas previas de productos.

### Relación con la teoría de la actividad
Estas pruebas son la base de la **pirámide de pruebas** (unitarias / integración) y del **cuadrante Q1
(soporte al desarrollo)** documentados en la actividad: confirman reglas de negocio y previenen
regresiones.

---

## Alcance

### Incluye (SV-06)
- Nuevo archivo `test/sales.test.js` con los casos descritos.
- Cobertura de `createSale` (camino feliz y errores) y `getSaleById`.

### NO incluye
- Cambios en `server.js` o en el frontend. Si una prueba revela un defecto real, se documenta y se
  corrige en su SV correspondiente (no se "ajusta la prueba" para que pase).

---

## Archivos a crear / modificar

| Archivo | Acción |
|---------|--------|
| `test/sales.test.js` | **Crear** — pruebas del módulo de ventas |

---

## Casos de prueba

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 1 | Registrar venta válida | `status 201`; la venta trae `items`, `subtotal`, `tax`, `total` |
| 2 | Cálculo de importes | `tax === subtotal * 0.16` y `total === subtotal + tax` (con precios de la BD) |
| 3 | Descuento de stock | tras la venta, el `stock` del producto baja exactamente la cantidad vendida |
| 4 | Stock insuficiente | `status 409`; el stock del producto **no** cambia (transacción revertida) |
| 5 | Producto inexistente | `status 404` al vender un `id` que no existe |
| 6 | Payload inválido | `items` vacío o `cantidad <= 0` → `status 400` |
| 7 | `getSaleById` | devuelve la venta con sus `items`; `null` si el id no existe |

---

## Estructura sugerida del archivo

Seguir el patrón de `test/products.test.js`:

```js
const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pos-sales-test-"));
process.env.DB_PATH = path.join(tempDir, "test.db");

const { ensureDatabase, createProduct, createSale, getSaleById, getProductById } = require("../server");

// Helper: crear un producto de prueba y devolver su id/stock conocido.
// Cada test llama a ensureDatabase() y prepara los productos que necesita.
```

> Si `getProductById` no está exportada y la necesitas para verificar el stock, expórtala en
> `server.js` (es una exportación segura de solo lectura). Indícalo en el resumen final.

---

## Restricciones técnicas

- **Solo `node:test` y `node:assert`** (nativos). Sin frameworks de testing externos (sin Jest, Mocha, etc.).
- Base de datos temporal con `process.env.DB_PATH`; no tocar `data/pos.db`.
- Las pruebas deben ser **independientes** entre sí y repetibles (no depender del orden de ejecución).
- No modificar la lógica de `server.js` para "forzar" que pase una prueba; las pruebas reflejan el
  comportamiento esperado de la spec SV-04.
- Nombres de prueba en español y descriptivos.

---

## Criterios de aceptación

- [ ] Existe `test/sales.test.js` con los 7 casos de la tabla.
- [ ] `npm test` ejecuta las pruebas de productos **y** de ventas, todas en verde (0 fallos).
- [ ] El caso de stock insuficiente verifica explícitamente que el stock **no** cambió tras el rechazo.
- [ ] El caso de descuento de stock verifica el valor exacto del stock después de la venta.
- [ ] Las pruebas no dependen de `data/pos.db` ni del orden de ejecución.
