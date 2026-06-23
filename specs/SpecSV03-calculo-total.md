# SV-03 — Implementar cálculo automático del total

| Campo | Valor |
|-------|-------|
| **ID** | SV-03 |
| **Historia / tarea** | Implementar cálculo automático del total |
| **Responsable** | Diego Serrano |
| **Estimación** | 4 horas |
| **Estado** | En curso |
| **Depende de** | SV-02 (usa el arreglo `venta` y el gancho `actualizarTotales()`) |

---

## Objetivo

Calcular **automáticamente** los importes de la venta a partir de los productos seleccionados y
reflejarlos en pantalla cada vez que la venta cambie: **subtotal**, **IVA (16%)** y **total**.
Además, **habilitar o deshabilitar** el botón "Registrar venta" según haya o no productos.

Esta tarea completa el gancho `actualizarTotales()` que SV-02 dejó previsto y que ya se invoca tras
cada cambio en la venta. NO registra la venta (SV-04) ni genera ticket (SV-05).

---

## Contexto

Tras SV-02, `ventas.js` mantiene el arreglo `venta` con renglones de la forma
`{ id, sku, name, price, stock, cantidad }` y llama a `actualizarTotales()` después de cada cambio
(agregar, aumentar, disminuir, quitar). La zona de totales de `ventas.html` tiene `#venta-subtotal` y
`#venta-total`; esta spec agrega también una línea de **IVA** (`#venta-impuesto`).

El proyecto es para México, por lo que se aplica **IVA del 16%** sobre el subtotal.

---

## Alcance

### Incluye (SV-03)
- Agregar a la zona de totales de `ventas.html` una línea de IVA con el id `#venta-impuesto`.
- Implementar `actualizarTotales()` para calcular subtotal, IVA y total y pintarlos en formato MXN.
- Habilitar `#registrar-venta` cuando la venta tenga al menos un producto; deshabilitarlo si está vacía.

### NO incluye (otros SV)
- Registrar la venta / persistencia → **SV-04**
- Ticket → **SV-05**

---

## Archivos a crear / modificar

| Archivo | Acción |
|---------|--------|
| `public/ventas.js` | **Modificar** — implementar `actualizarTotales()` |
| `public/ventas.html` | **Modificar** — agregar la línea de IVA `#venta-impuesto` en los totales |
| `public/styles.css` | **Modificar** (si hace falta) — estilo de la fila de totales |

> No se modifica `server.js`: el cálculo es del lado del cliente.

---

## Especificación funcional

### Fórmulas
- `subtotal = Σ (price × cantidad)` de cada renglón de `venta`.
- `iva = subtotal × 0.16`.
- `total = subtotal + iva`.

Definir la tasa como una constante reutilizable, p. ej. `const IVA = 0.16;`.

### `actualizarTotales()`
- Recalcula `subtotal`, `iva` y `total` a partir de `venta`.
- Escribe los valores en `#venta-subtotal`, `#venta-impuesto` y `#venta-total`, formateados como
  moneda MXN (`toLocaleString("es-MX", { style: "currency", currency: "MXN" })`).
- Con la venta vacía, los tres importes deben mostrarse en `$0.00`.
- Habilita `#registrar-venta` si `venta.length > 0`; en caso contrario lo deja deshabilitado.
- Debe ser **idempotente** y seguro de llamar en cualquier momento (no asume que haya productos).

### Disponibilidad de los importes para SV-04/SV-05
- Calcular los importes de forma que puedan reutilizarse al registrar la venta y al generar el ticket.
  Se recomienda extraer una función pura, p. ej.:

  ```js
  function calcularImportes(venta) {
    const subtotal = venta.reduce((acc, item) => acc + item.price * item.cantidad, 0);
    const iva = subtotal * IVA;
    return { subtotal, iva, total: subtotal + iva };
  }
  ```

  `actualizarTotales()` usa esta función para pintar; SV-04/SV-05 la reutilizan para enviar/mostrar.

---

## Restricciones técnicas

- **Vanilla JS**; sin librerías. Cálculo del lado del cliente (el backend revalidará en SV-04).
- Usar el mismo helper de formato de moneda MXN que el resto del frontend.
- No alterar la estructura del arreglo `venta` definida en SV-02.
- Redondeo: mostrar siempre 2 decimales (lo da el formato de moneda); no redondear el valor numérico
  base para no acumular errores (el formateo se encarga de la presentación).
- Textos en español; respetar el estilo del proyecto.

---

## Criterios de aceptación

- [ ] Al agregar productos, subtotal, IVA y total se actualizan automáticamente sin recargar.
- [ ] El IVA mostrado equivale al 16% del subtotal y el total = subtotal + IVA.
- [ ] Al cambiar cantidades o quitar productos, los importes se recalculan al instante.
- [ ] Con la venta vacía los tres importes muestran `$0.00` y `#registrar-venta` queda deshabilitado.
- [ ] Con al menos un producto, `#registrar-venta` se habilita.
- [ ] Existe `calcularImportes(venta)` reutilizable por SV-04 y SV-05.
- [ ] `npm test` sigue pasando sin regresiones.
