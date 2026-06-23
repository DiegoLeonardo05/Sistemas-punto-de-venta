# SV-05 — Generar ticket simple de venta

| Campo | Valor |
|-------|-------|
| **ID** | SV-05 |
| **Historia / tarea** | Generar ticket simple de venta |
| **Responsable** | Diego Serrano / Horacio Gaona |
| **Estimación** | 2 horas |
| **Estado** | Por hacer |
| **Depende de** | SV-04 (venta registrada y gancho `mostrarTicket()`) |

---

## Objetivo

Mostrar un **ticket simple** con el detalle de la venta recién registrada: folio, fecha, productos
con cantidad y precio, subtotal, IVA y total. El ticket se renderiza en el contenedor `#ticket`
(creado en SV-01, oculto por defecto) cuando una venta se registra con éxito.

---

## Contexto

Tras SV-04, al registrar una venta el servidor responde `201` con el objeto de la venta:

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

SV-04 dejó previsto el gancho `mostrarTicket(ventaRegistrada)` (vacío). Esta spec lo implementa para
pintar el ticket con esos datos. El contenedor `#ticket` existe y arranca con el atributo `hidden`.

---

## Alcance

### Incluye (SV-05)
- Implementar `mostrarTicket(venta)` en `ventas.js` para renderizar el ticket dentro de `#ticket`.
- Mostrar `#ticket` (quitar `hidden`) al registrar una venta y poblarlo con el detalle.
- Botón para **cerrar/ocultar** el ticket (o iniciar una venta nueva), que vuelve a ocultar `#ticket`.
- (Opcional recomendado) Botón **"Imprimir"** que use `window.print()`.

### NO incluye
- Cambios de backend (el endpoint ya devuelve todo lo necesario en SV-04).
- Persistencia adicional o numeración especial de folio (se usa el `id` de la venta como folio).

---

## Archivos a crear / modificar

| Archivo | Acción |
|---------|--------|
| `public/ventas.js` | **Modificar** — implementar `mostrarTicket(venta)` y el cierre del ticket |
| `public/styles.css` | **Modificar** — estilos del ticket (incluye estilos de impresión opcionales) |

> No se modifica `server.js`.

---

## Especificación funcional

### `mostrarTicket(venta)`
Recibe el objeto de venta devuelto por `POST /api/sales` y construye el contenido de `#ticket` con:

- **Encabezado:** nombre del negocio ("Sistema Punto de Venta"), folio (`Folio: #<id>`) y fecha
  (`created_at`, legible).
- **Detalle de productos:** una línea por `item` con nombre, cantidad, precio unitario y subtotal del
  renglón, todo en formato moneda MXN.
- **Totales:** subtotal, IVA (16%) y total, claramente separados y alineados.
- **Pie:** un mensaje de agradecimiento (p. ej. "¡Gracias por su compra!").

Comportamiento:
- Al llamarse, quita el atributo `hidden` de `#ticket` y lo desplaza a la vista si es necesario.
- Si se llama sin una venta válida, no debe romper (salir sin pintar).
- Incluir un botón **"Cerrar"** (o "Nueva venta") dentro del ticket que vuelva a ocultar `#ticket`.

### Formato
- Moneda: `Number(v).toLocaleString("es-MX", { style: "currency", currency: "MXN" })`.
- Fecha: presentar `created_at` de forma legible (puede usarse `new Date(...).toLocaleString("es-MX")`;
  si el valor viene sin zona, mostrarlo tal cual es aceptable).

---

## Restricciones técnicas

- **Vanilla JS**; sin librerías. Render del lado del cliente con los datos de la respuesta de SV-04.
- Reutilizar el helper de formato de moneda del resto del frontend.
- Escapar/usar `textContent` para los datos variables del producto cuando se construya el DOM, para no
  inyectar HTML arbitrario (los nombres provienen de la BD, pero mantener buena práctica).
- Textos en español; respetar el estilo del proyecto.

---

## Criterios de aceptación

- [ ] Al registrar una venta válida, `#ticket` se muestra con folio, fecha, productos, subtotal, IVA y total.
- [ ] Los importes del ticket coinciden con los devueltos por el servidor (subtotal, IVA, total).
- [ ] Cada producto aparece con su nombre, cantidad, precio unitario y subtotal del renglón.
- [ ] Existe un botón que cierra/oculta el ticket y permite continuar con una nueva venta.
- [ ] Si `mostrarTicket` se invoca sin datos válidos, no genera errores en consola.
- [ ] `npm test` sigue pasando sin regresiones.
