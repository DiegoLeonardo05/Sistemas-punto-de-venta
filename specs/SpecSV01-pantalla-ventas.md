# SV-01 — Crear pantalla de ventas

| Campo | Valor |
|-------|-------|
| **ID** | SV-01 |
| **Historia / tarea** | Crear pantalla de ventas |
| **Responsable** | Horacio Gaona |
| **Estimación** | 5 horas |
| **Estado** | En curso |
| **Depende de** | — (es la base del módulo de ventas) |

---

## Objetivo

Crear la **pantalla de ventas** del Sistema de Punto de Venta: la estructura visual (HTML + CSS)
y la navegación que permita al usuario pasar del módulo de productos al nuevo módulo de ventas.

Esta tarea entrega **únicamente la maquetación y los contenedores vacíos** con sus identificadores.
El comportamiento (cargar productos, seleccionarlos, calcular el total, registrar la venta y generar
el ticket) se implementa en SV-02 a SV-05, que dependen de los `id` definidos aquí.

---

## Contexto

El proyecto ya cuenta con un módulo de **gestión de productos** funcional (`public/index.html`,
`public/app.js`) que consume la API REST de `server.js` y persiste en SQLite. El nuevo módulo de
ventas vive en una pantalla aparte y reutiliza el catálogo de productos existente como origen de datos.

La pantalla de ventas se compone de dos zonas:

1. **Catálogo disponible** (izquierda): lista de productos de los que se puede tomar para la venta.
2. **Venta actual** (derecha): el "carrito" con los productos elegidos, los totales y las acciones.

---

## Alcance

### Incluye (SV-01)
- Nueva página `public/ventas.html` con la maquetación completa de la pantalla.
- Enlace de navegación entre el módulo de productos y el de ventas (en ambas direcciones).
- Estilos para la pantalla de ventas en `public/styles.css` (reutilizando las clases existentes
  cuando sea posible).
- Stub `public/ventas.js` que solo obtiene las referencias del DOM (sin lógica todavía).

### NO incluye (otros SV)
- Cargar y listar los productos en el catálogo → **SV-02**
- Agregar/quitar productos de la venta → **SV-02**
- Cálculo automático de subtotal y total → **SV-03**
- Registrar la venta en la base de datos → **SV-04**
- Generar el ticket → **SV-05**

---

## Archivos a crear / modificar

| Archivo | Acción |
|---------|--------|
| `public/ventas.html` | **Crear** — maquetación de la pantalla de ventas |
| `public/ventas.js` | **Crear** — stub con referencias al DOM |
| `public/styles.css` | **Modificar** — agregar estilos del módulo de ventas |
| `public/index.html` | **Modificar** — agregar enlace "Ventas" en la barra superior |

---

## Especificación de la interfaz

La página debe reutilizar la estética actual (`topbar`, `panel`, `layout`, etc.). Estructura mínima
y **los `id` son obligatorios** porque los SV siguientes los referencian:

```
ventas.html
├── header.topbar
│   ├── título "Punto de Venta — Ventas"
│   ├── nav: enlace a index.html ("Productos")
│   └── #venta-status        → mensajes de estado ("Venta registrada", errores, etc.)
│
└── main.layout
    ├── section.panel  (Catálogo disponible)
    │   ├── h2 "Productos disponibles"
    │   ├── input#catalogo-busqueda  → buscador por código/nombre/categoría
    │   └── tbody#catalogo-lista     → filas de productos disponibles (SV-02 las llena)
    │
    └── section.panel  (Venta actual)
        ├── h2 "Venta actual"
        ├── tbody#venta-items        → renglones del carrito (SV-02 los llena)
        │                              estado vacío: "No hay productos en la venta."
        ├── div.totales
        │   ├── #venta-subtotal      → subtotal (SV-03)
        │   └── #venta-total         → total (SV-03)
        ├── button#registrar-venta   → registrar venta (SV-04). Inicia deshabilitado
        └── section#ticket[hidden]   → contenedor del ticket (SV-05), oculto al inicio
```

Notas:
- Las tablas del catálogo y de la venta deben tener su `<thead>` con encabezados legibles
  (Código, Nombre, Precio, Stock, Acción para el catálogo; Producto, Cantidad, Precio, Subtotal,
  Acción para la venta).
- `#registrar-venta` arranca con el atributo `disabled` (se habilita en SV-03/SV-04 cuando haya
  productos en la venta).
- `#ticket` arranca con el atributo `hidden`.
- En `public/index.html`, agregar dentro de `header.topbar` un enlace a `ventas.html` con el
  texto "Ventas" (puede usar la clase `secondary` para verse como botón).

## `ventas.js` (stub)

Crear el archivo enlazado con `<script src="/ventas.js"></script>` al final de `ventas.html`.
Por ahora solo debe declarar las constantes con las referencias del DOM que usarán los siguientes
SV, por ejemplo:

```js
const catalogoBusqueda = document.querySelector("#catalogo-busqueda");
const catalogoLista = document.querySelector("#catalogo-lista");
const ventaItems = document.querySelector("#venta-items");
const ventaSubtotal = document.querySelector("#venta-subtotal");
const ventaTotal = document.querySelector("#venta-total");
const registrarVenta = document.querySelector("#registrar-venta");
const ticket = document.querySelector("#ticket");
const ventaStatus = document.querySelector("#venta-status");
```

No debe contener lógica adicional en SV-01.

---

## Restricciones técnicas

- **Solo Node.js nativo y JavaScript del navegador.** Sin frameworks ni librerías externas
  (sin React, Express, Bootstrap, etc.).
- Reutilizar `public/styles.css`; no introducir otro sistema de estilos.
- La página debe servirse con el servidor estático existente (`sendFile` en `server.js`),
  por lo que basta con colocar los archivos en `public/`. **No modificar `server.js` en este SV.**
- Mantener el idioma español en textos visibles y el estilo de código del proyecto.

---

## Criterios de aceptación

- [ ] Al abrir `http://localhost:3000/ventas.html` se muestra la pantalla de ventas con sus dos
      secciones (catálogo y venta actual) sin errores en la consola del navegador.
- [ ] Desde el módulo de productos (`index.html`) existe un enlace visible que lleva a la pantalla
      de ventas, y desde ventas se puede regresar a productos.
- [ ] Existen en el DOM todos los `id` listados en la especificación.
- [ ] El botón `#registrar-venta` aparece deshabilitado y `#ticket` aparece oculto.
- [ ] La suite de pruebas existente sigue pasando (`npm test`) sin regresiones.
