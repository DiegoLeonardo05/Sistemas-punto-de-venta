# Prompt SV-02 — Selección de productos para venta

**Responsable:** Horacio Gaona

---

Continuando con el módulo de ventas de mi Sistema de Punto de Venta, ya tengo lista la
pantalla (`public/ventas.html`) con todos sus contenedores e identificadores, y el archivo
`public/ventas.js` que por ahora solo tiene las referencias al DOM. Ahora quiero darle
comportamiento para poder **seleccionar productos para la venta**.

Necesito que, al abrir la pantalla de ventas, se cargue el catálogo de productos llamando
al endpoint que ya existe, `GET /api/products`, que me devuelve un arreglo de objetos con
la forma `{ id, sku, name, category, price, stock, description }`. Esos productos los
quiero mostrar en la tabla `#catalogo-lista`, cada uno con su código, nombre, precio
(en formato de moneda mexicana), stock y un botón "Agregar". Si un producto tiene stock en
cero, su botón "Agregar" debe quedar deshabilitado. El buscador `#catalogo-busqueda` debe
filtrar el catálogo en vivo por código, nombre o categoría, igual que ya lo hace el módulo
de productos en `app.js`.

Quiero llevar la "venta actual" en memoria, como un arreglo de renglones donde cada uno
guarde al menos `{ id, sku, name, price, stock, cantidad }`. Cuando pulse "Agregar", si el
producto no está en la venta se agrega con cantidad 1, y si ya está se le suma uno a la
cantidad; pero nunca debe poder pasar del stock disponible: si llego al máximo, que no
incremente y me avise en `#venta-status` (algo como "Stock máximo alcanzado").

En la tabla de la venta `#venta-items` quiero ver cada producto seleccionado con su
nombre, un control para subir o bajar la cantidad (botones – y +), su precio unitario y un
botón "Quitar". El botón + debe respetar el stock, el botón – baja la cantidad y si llega a
cero el renglón se elimina, y "Quitar" borra el renglón completo. Cuando la venta esté
vacía, muestra el mensaje "No hay productos en la venta.".

Importante: cada vez que cambie la venta (agregar, subir, bajar o quitar), quiero que se
vuelva a dibujar la tabla y que se llame a una función `actualizarTotales()`. Por ahora
deja esa función vacía (`function actualizarTotales() {}`), porque la voy a implementar en
el siguiente paso para calcular los totales.

Trabaja todo en `public/ventas.js` (y en `styles.css` solo si necesitas estilos para los
botones). Usa vanilla JS sin librerías, el mismo formato de moneda mexicana del resto del
frontend, no toques `server.js` ni la API, y mantén todo en español. Que `npm test` siga
pasando.
