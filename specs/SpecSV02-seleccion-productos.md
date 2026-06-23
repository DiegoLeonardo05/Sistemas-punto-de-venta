# SV-02 — Implementar selección de productos para venta

| Campo | Valor |
|-------|-------|
| **ID** | SV-02 |
| **Historia / tarea** | Implementar selección de productos para venta |
| **Responsable** | Horacio Gaona |
| **Estimación** | 6 horas |
| **Estado** | En curso |
| **Depende de** | SV-01 (usa los `id` del DOM de `ventas.html` / `ventas.js`) |

---

## Objetivo

Dar comportamiento a la pantalla de ventas: **cargar el catálogo de productos** desde la API,
mostrarlo en la sección "Productos disponibles" y permitir al usuario **agregar productos a la venta
actual**, ajustar cantidades y quitarlos, respetando el **stock disponible** de cada producto.

Esta tarea NO calcula totales (eso es SV-03) ni registra la venta (SV-04). Solo construye y mantiene
en memoria la lista de renglones de la venta y la pinta en pantalla.

---

## Contexto

La pantalla y los contenedores ya existen (SV-01). El catálogo de productos se obtiene del endpoint
existente `GET /api/products`, que devuelve un arreglo de objetos con la forma:

```json
{ "id": 1, "sku": "PROD-001", "name": "Cafe americano", "category": "Bebidas",
  "price": 25.5, "stock": 12, "description": "Vaso mediano" }
```

El módulo de productos (`public/app.js`) ya tiene patrones de referencia para `fetch`, filtrado por
búsqueda y render de tablas que conviene reutilizar como guía de estilo.

---

## Alcance

### Incluye (SV-02)
- Cargar el catálogo con `fetch("/api/products")` al abrir `ventas.html`.
- Renderizar los productos en `#catalogo-lista` con un botón **"Agregar"** por fila.
- Filtrar el catálogo con `#catalogo-busqueda` (por código, nombre o categoría).
- Mantener en memoria la **venta actual** (arreglo de renglones) y renderizarla en `#venta-items`.
- Controlar **cantidades**: aumentar/disminuir y permitir quitar un renglón.
- Respetar el **stock**: no permitir agregar más unidades de las disponibles.
- Mostrar el estado vacío "No hay productos en la venta." cuando no haya renglones.

### NO incluye (otros SV)
- Cálculo de subtotal/total y habilitar el botón registrar → **SV-03**
- Registrar la venta en la base de datos → **SV-04**
- Generar el ticket → **SV-05**

---

## Archivos a crear / modificar

| Archivo | Acción |
|---------|--------|
| `public/ventas.js` | **Modificar** — agregar la lógica de carga, filtrado y selección |
| `public/styles.css` | **Modificar** (si hace falta) — estilos de botones de cantidad/quitar |

> No se modifica `server.js`: SV-02 solo consume el endpoint existente `GET /api/products`.

---

## Especificación funcional

### Estado en memoria
Mantener dos estructuras en `ventas.js`:
- `productos`: catálogo recibido de la API (solo lectura/visualización).
- `venta`: arreglo de renglones de la venta actual. Cada renglón debe contener al menos:
  `{ id, sku, name, price, stock, cantidad }` donde `stock` es el disponible del producto y
  `cantidad` la seleccionada para la venta.

### Catálogo disponible (`#catalogo-lista`)
- Mostrar una fila por producto con: código, nombre, precio (formato moneda MXN), stock y un botón
  **"Agregar"**.
- El buscador `#catalogo-busqueda` filtra en vivo por código, nombre o categoría (mismo criterio que
  el catálogo de productos).
- Si un producto tiene `stock === 0`, su botón "Agregar" debe estar deshabilitado.

### Agregar a la venta
- Al pulsar "Agregar":
  - Si el producto **no** está en `venta`, se agrega con `cantidad = 1`.
  - Si **ya** está, se incrementa su `cantidad` en 1.
  - Nunca permitir que `cantidad` supere el `stock` disponible del producto. Si se alcanza el tope,
    no incrementar y mostrar un aviso en `#venta-status` (p. ej. "Stock máximo alcanzado para X").

### Venta actual (`#venta-items`)
- Renderizar un renglón por producto en la venta con: nombre, **control de cantidad**
  (botones – / + o input numérico), precio unitario y un botón **"Quitar"**.
- El botón **+** respeta el stock (deshabilitado o sin efecto al llegar al máximo).
- El botón **–** disminuye la cantidad; si llega a 0, el renglón se elimina de la venta.
- "Quitar" elimina el renglón completo.
- Cuando `venta` queda vacía, mostrar el estado vacío "No hay productos en la venta.".

### Re-render
- Cualquier cambio en `venta` debe re-renderizar `#venta-items`.
- Exponer una función reutilizable (p. ej. `renderVenta()`) que SV-03 pueda invocar/extender para
  recalcular totales, y que tras cada cambio en `venta` se ejecute un punto de extensión
  (p. ej. llamar a una función `actualizarTotales()` que SV-03 implementará). Deja ese gancho previsto
  aunque en SV-02 quede vacío o como `function actualizarTotales() {}`.

---

## Restricciones técnicas

- **Vanilla JS** con `fetch`; sin frameworks ni librerías.
- Reutilizar el helper de formato de moneda al estilo de `app.js`
  (`Number(value).toLocaleString("es-MX", { style: "currency", currency: "MXN" })`).
- No mutar el arreglo `productos` del catálogo al modificar la `venta` (trabajar con copias de los
  campos necesarios).
- Mantener el idioma español y el estilo de código del proyecto.
- No tocar `server.js` ni la API.

---

## Criterios de aceptación

- [ ] Al abrir `ventas.html`, el catálogo se llena con los productos existentes sin errores en consola.
- [ ] El buscador filtra el catálogo por código, nombre o categoría en vivo.
- [ ] "Agregar" inserta el producto en la venta; repetir "Agregar" incrementa la cantidad.
- [ ] No es posible agregar más unidades que el stock disponible; al alcanzar el tope se avisa al usuario.
- [ ] En la venta se puede aumentar, disminuir y quitar productos; al llegar a 0 el renglón desaparece.
- [ ] Con la venta vacía se muestra el mensaje de estado vacío.
- [ ] Existe el gancho `actualizarTotales()` (aunque vacío) que SV-03 completará.
- [ ] `npm test` sigue pasando sin regresiones.
