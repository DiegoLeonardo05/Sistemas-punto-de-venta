# Prompt SV-05 — Generar ticket simple de venta

**Responsables:** Diego Serrano / Horacio Gaona

---

Ya puedo registrar ventas y el servidor me responde con la venta registrada, que tiene esta
forma: `{ id, subtotal, tax, total, created_at, items: [{ product_id, sku, name, price,
quantity, subtotal }] }`. En el paso anterior dejé una función `mostrarTicket(...)` vacía y
un contenedor `#ticket` en la pantalla que empieza oculto. Ahora quiero que generes un
**ticket simple** con el detalle de la venta.

Necesito que implementes la función `mostrarTicket(venta)` en `public/ventas.js` para que,
cuando una venta se registre con éxito, arme el ticket dentro de `#ticket` y lo muestre
(quitándole el atributo oculto). El ticket debe tener un encabezado con el nombre del
negocio ("Sistema Punto de Venta"), el folio (usa el id de la venta, algo como "Folio:
#12") y la fecha; luego el detalle, con una línea por producto que muestre nombre, cantidad,
precio unitario y subtotal del renglón; después los totales separados y bien alineados
(subtotal, IVA y total); y al final un mensaje de agradecimiento como "¡Gracias por su
compra!".

Todos los importes en formato de moneda mexicana, y la fecha de forma legible. Si la función
se llega a llamar sin una venta válida, que no truene, simplemente que no pinte nada. Agrega
también un botón "Cerrar" (o "Nueva venta") dentro del ticket para volver a ocultarlo y
poder seguir vendiendo; y si puedes, un botón "Imprimir" que use `window.print()`.

Trabaja en `public/ventas.js` y en `public/styles.css` para los estilos del ticket (puedes
incluir estilos para impresión). Es solo del lado del cliente, no toques `server.js` ni la
carpeta `test/`. Usa vanilla JS sin librerías, el mismo formato de moneda del resto, usa
`textContent` para los datos variables del producto (para no inyectar HTML), y mantén todo
en español. Que `npm test` siga pasando.
