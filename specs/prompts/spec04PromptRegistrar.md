# Prompt SV-04 — Registrar ventas en el sistema

**Responsable:** Diego Serrano

---

Ahora quiero que el módulo de ventas pueda **registrar la venta en la base de datos**. Mi
servidor es `server.js` con Node.js nativo y guarda los datos en SQLite usando unas
utilidades que ya tengo (`runSql`, `runJson` y `sqlText`). La tabla `products` ya existe y
tiene una columna `stock`. En el frontend, `ventas.js` mantiene la venta en un arreglo
`venta` y ya tiene la función `calcularImportes(venta)`.

Primero, en la función `ensureDatabase()` del servidor crea dos tablas nuevas: una `sales`
con id, subtotal, tax (el IVA), total y fecha de creación; y una `sale_items` con id, el id
de la venta, el id del producto, y un snapshot del sku, nombre y precio del producto, más
la cantidad y el subtotal del renglón. Guardo el snapshot del nombre y precio a propósito,
para que si el producto cambia o se borra después, el historial de la venta no se altere.

Luego implementa una función `createSale(payload)` y una `getSaleById(id)`, y expórtalas en
`module.exports` para poder probarlas. Crea también el endpoint `POST /api/sales`, que
reciba un cuerpo como `{ items: [{ id, cantidad }] }`.

Algo muy importante de seguridad: el servidor NO debe confiar en los precios ni el stock que
mande el cliente. Por cada item, vuelve a leer el producto de la base de datos por su id
para tomar el precio y el stock reales. Valida que `items` no esté vacío, que cada cantidad
sea un entero mayor a cero, que el producto exista (si no, responde 404) y que la cantidad
no supere el stock disponible (si lo supera, responde 409 con un mensaje claro de stock
insuficiente). Usa el mismo patrón de errores `{ valid, errors }` que ya manejo en
productos. Calcula el subtotal con los precios de la base, el IVA al 16% y el total.

El guardado debe ser atómico, dentro de una transacción (BEGIN, COMMIT y ROLLBACK si algo
falla): inserta la venta en `sales`, inserta cada renglón en `sale_items` y descuenta el
stock de cada producto con un UPDATE. Si todo sale bien, responde 201 con la venta
registrada y sus renglones.

En el frontend, conecta el botón `#registrar-venta` para que arme el payload con los items
de la venta y haga el POST. Si responde bien, llama a una función `mostrarTicket(...)` con
la venta registrada (déjala vacía por ahora, la haré en el siguiente paso), vacía la venta,
vuelve a dibujar, recarga el catálogo con `GET /api/products` porque el stock cambió, y
muestra "Venta registrada" en `#venta-status`. Si hay error, muestra el mensaje del
servidor. Deshabilita el botón mientras se procesa para evitar doble envío.

Solo Node.js nativo, datos con `runSql`/`runJson`/`sqlText`, sin drivers ni ORM. Sanitiza
todo el texto con `sqlText()`. Códigos HTTP correctos (201/400/404/409/500). No toques la
carpeta `test/`. Todo en español. Que `npm test` siga pasando.
