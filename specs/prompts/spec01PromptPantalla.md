# Prompt SV-01 — Pantalla de ventas

**Responsable:** Horacio Gaona

---

Hola, estoy trabajando en un Sistema de Punto de Venta hecho con Node.js nativo (sin
frameworks) y una base de datos SQLite. Ya tengo terminado el módulo de gestión de
productos, que vive en `public/index.html`, `public/app.js` y `public/styles.css`, y
consume una API REST desde `server.js`.

Ahora quiero empezar el módulo de ventas y necesito que me ayudes con la **pantalla de
ventas**. Por ahora solo quiero la maquetación (HTML y CSS) y la navegación; todavía no
quiero ninguna lógica, eso lo haré después.

Necesito que crees una página nueva llamada `public/ventas.html` con la misma estética
que ya uso en el resto del sistema (reutilizando las clases de `styles.css` como
`topbar`, `panel` y `layout`). La pantalla debe tener dos zonas: una a la izquierda para
los "Productos disponibles" (con un buscador y una tabla donde luego listaré el
catálogo) y otra a la derecha para la "Venta actual", que será una especie de carrito con
su tabla de productos seleccionados, una zona de totales (subtotal y total), un botón
para registrar la venta y un espacio para el ticket.

Es muy importante que dejes listos ciertos identificadores en el HTML, porque los voy a
usar en los siguientes pasos: el buscador del catálogo como `#catalogo-busqueda`, la
tabla del catálogo como `#catalogo-lista`, la tabla del carrito como `#venta-items`, el
subtotal como `#venta-subtotal`, el total como `#venta-total`, el botón de registrar como
`#registrar-venta`, el contenedor del ticket como `#ticket` y un espacio para mensajes de
estado como `#venta-status`. El botón de registrar debe empezar deshabilitado y el ticket
debe empezar oculto.

También agrégale a la barra superior de `index.html` un enlace que lleve a la pantalla de
ventas, y desde ventas un enlace para volver a productos, para poder moverme entre los dos
módulos.

Por último, crea un archivo `public/ventas.js` enlazado en la página, pero por ahora que
solo contenga las referencias a esos elementos del DOM (las constantes con
`document.querySelector`), sin lógica todavía.

Recuerda: solo Node.js nativo y JavaScript de navegador, sin librerías externas, todos los
textos en español, y no toques `server.js` en este paso. Cuando termines, quiero poder
abrir `http://localhost:3000/ventas.html` y ver la pantalla completa sin errores en la
consola, y que las pruebas que ya tengo sigan pasando con `npm test`.
