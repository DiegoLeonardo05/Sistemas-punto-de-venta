# Prompt SV-03 — Cálculo automático del total

**Responsable:** Diego Serrano

---

Sigo con el módulo de ventas. Ya puedo seleccionar productos y mantengo la venta en un
arreglo llamado `venta` (cada renglón es `{ id, sku, name, price, stock, cantidad }`), y
después de cada cambio en la venta se llama a una función `actualizarTotales()` que dejé
vacía. Ahora quiero implementar el **cálculo automático del total**.

El sistema es para México, así que quiero aplicar IVA del 16%. Necesito que en la zona de
totales de `public/ventas.html` agregues una línea nueva para el IVA con el identificador
`#venta-impuesto` (ya tengo `#venta-subtotal` y `#venta-total`).

Después, implementa la función `actualizarTotales()` en `public/ventas.js` para que calcule
el subtotal como la suma de precio por cantidad de cada renglón, el IVA como el 16% de ese
subtotal, y el total como subtotal más IVA. Define la tasa como una constante reutilizable
(por ejemplo `const IVA = 0.16;`). Esos tres importes deben pintarse en `#venta-subtotal`,
`#venta-impuesto` y `#venta-total` con formato de moneda mexicana. Cuando la venta esté
vacía, los tres deben mostrar $0.00.

También quiero que esta función habilite el botón `#registrar-venta` cuando haya al menos
un producto en la venta, y lo deje deshabilitado cuando esté vacía. La función debe poder
llamarse en cualquier momento sin romperse, aunque no haya productos.

Una cosa más, para no repetir lógica después: extrae una función pura
`calcularImportes(venta)` que reciba el arreglo de la venta y devuelva un objeto
`{ subtotal, iva, total }`, y haz que `actualizarTotales()` la use para pintar. La voy a
reutilizar más adelante al registrar la venta y al generar el ticket.

Trabaja en `public/ventas.js` y en `public/ventas.html` (la línea de IVA). Es cálculo del
lado del cliente, solo vanilla JS sin librerías, mismo formato de moneda que el resto, no
cambies la estructura del arreglo `venta`, y todo en español. Que `npm test` siga pasando.
