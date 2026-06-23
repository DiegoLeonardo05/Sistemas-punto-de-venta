# Prompt SV-06 — Pruebas funcionales del módulo de ventas

**Responsable:** Alejandro Castro

---

Ya tengo terminado el backend del módulo de ventas en `server.js`: las funciones
`createSale(payload)` y `getSaleById(id)` están exportadas, existen las tablas `sales` y
`sale_items`, y al registrar una venta se descuenta el stock de los productos. El IVA es del
16%. Ahora quiero **pruebas funcionales automatizadas** que validen todo esto.

Quiero que crees un archivo nuevo `test/sales.test.js` siguiendo exactamente el mismo patrón
que ya uso en `test/products.test.js`: usar el runner nativo `node:test` con `node:assert`,
una base de datos temporal a través de `process.env.DB_PATH` para no tocar la base real, e
importar las funciones desde `../server`. Como las ventas dependen de que existan productos
con stock, cada prueba debe llamar a `ensureDatabase()` y crear con `createProduct` los
productos que necesite.

Necesito estos siete casos, con nombres en español que describan claramente lo que validan:

1. Registrar una venta válida: que responda con estado 201 y que la venta traiga sus items,
   subtotal, IVA y total.
2. Cálculo de importes: que el IVA sea igual al subtotal por 0.16 y el total sea subtotal
   más IVA, usando los precios de la base de datos.
3. Descuento de stock: que después de la venta el stock del producto baje exactamente la
   cantidad vendida.
4. Stock insuficiente: que al pedir más unidades que el stock responda 409 y que el stock
   NO cambie (verificando que la transacción se revirtió).
5. Producto inexistente: que al vender un id que no existe responda 404.
6. Payload inválido: que con items vacío o cantidad menor o igual a cero responda 400.
7. `getSaleById`: que devuelva la venta con sus items, y `null` cuando el id no existe.

Si para verificar el stock necesitas leer un producto y `getProductById` no está exportada
en `server.js`, expórtala (es solo de lectura) y avísame.

Usa solo `node:test` y `node:assert`, nada de Jest ni Mocha. Las pruebas deben ser
independientes entre sí y no depender del orden. Muy importante: no modifiques la lógica de
`server.js` para forzar que una prueba pase; las pruebas reflejan el comportamiento esperado.
Al terminar, quiero que `npm test` corra las pruebas de productos y de ventas, todas en
verde.
