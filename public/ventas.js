const catalogoBusqueda = document.querySelector("#catalogo-busqueda");
const catalogoLista = document.querySelector("#catalogo-lista");
const ventaItems = document.querySelector("#venta-items");
const ventaSubtotal = document.querySelector("#venta-subtotal");
const ventaImpuesto = document.querySelector("#venta-impuesto");
const ventaTotal = document.querySelector("#venta-total");
const registrarVenta = document.querySelector("#registrar-venta");
const ticket = document.querySelector("#ticket");
const ventaStatus = document.querySelector("#venta-status");

const IVA = 0.16;

let productos = [];
let venta = [];

function money(value) {
  return Number(value).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN"
  });
}

function setStatus(message) {
  ventaStatus.textContent = message;
}

function calcularImportes(venta) {
  const subtotal = venta.reduce((acc, item) => acc + item.price * item.cantidad, 0);
  const iva = subtotal * IVA;

  return {
    subtotal,
    iva,
    total: subtotal + iva
  };
}

function actualizarTotales() {
  const importes = calcularImportes(venta);

  ventaSubtotal.textContent = money(importes.subtotal);
  ventaImpuesto.textContent = money(importes.iva);
  ventaTotal.textContent = money(importes.total);
  registrarVenta.disabled = venta.length === 0;
}

function formatFecha(value) {
  if (!value) return "";

  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("es-MX");
}

function agregarLineaTicket(label, value, className = "") {
  const row = document.createElement("div");
  row.className = `ticket-row${className ? ` ${className}` : ""}`;

  const labelElement = document.createElement("span");
  labelElement.textContent = label;

  const valueElement = document.createElement("strong");
  valueElement.textContent = value;

  row.append(labelElement, valueElement);
  return row;
}

function ocultarTicket() {
  ticket.hidden = true;
}

function mostrarTicket(ventaRegistrada) {
  if (!ventaRegistrada || !Array.isArray(ventaRegistrada.items)) return;

  ticket.replaceChildren();

  const header = document.createElement("div");
  header.className = "ticket-header";

  const title = document.createElement("h2");
  title.textContent = "Sistema Punto de Venta";

  const folio = document.createElement("p");
  folio.textContent = `Folio: #${ventaRegistrada.id}`;

  const fecha = document.createElement("p");
  fecha.textContent = formatFecha(ventaRegistrada.created_at);

  header.append(title, folio, fecha);

  const items = document.createElement("div");
  items.className = "ticket-items";

  for (const item of ventaRegistrada.items) {
    const row = document.createElement("div");
    row.className = "ticket-item";

    const detail = document.createElement("div");

    const name = document.createElement("strong");
    name.textContent = item.name;

    const meta = document.createElement("span");
    meta.textContent = `${item.quantity} x ${money(item.price)}`;

    detail.append(name, meta);

    const subtotal = document.createElement("strong");
    subtotal.textContent = money(item.subtotal);

    row.append(detail, subtotal);
    items.append(row);
  }

  const totals = document.createElement("div");
  totals.className = "ticket-totals";
  totals.append(
    agregarLineaTicket("Subtotal", money(ventaRegistrada.subtotal)),
    agregarLineaTicket("IVA 16%", money(ventaRegistrada.tax)),
    agregarLineaTicket("Total", money(ventaRegistrada.total), "ticket-total")
  );

  const footer = document.createElement("p");
  footer.className = "ticket-footer";
  footer.textContent = "Gracias por su compra.";

  const actions = document.createElement("div");
  actions.className = "ticket-actions";

  const closeButton = document.createElement("button");
  closeButton.className = "secondary";
  closeButton.type = "button";
  closeButton.textContent = "Cerrar";
  closeButton.addEventListener("click", ocultarTicket);

  const printButton = document.createElement("button");
  printButton.className = "primary";
  printButton.type = "button";
  printButton.textContent = "Imprimir";
  printButton.addEventListener("click", () => window.print());

  actions.append(closeButton, printButton);
  ticket.append(header, items, totals, footer, actions);

  ticket.hidden = false;
  ticket.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderCatalogo() {
  const query = catalogoBusqueda.value.trim().toLowerCase();
  const filtrados = productos.filter((producto) => {
    return [producto.sku, producto.name, producto.category]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  if (filtrados.length === 0) {
    catalogoLista.innerHTML = `<tr><td class="empty" colspan="5">No hay productos para mostrar.</td></tr>`;
    return;
  }

  catalogoLista.innerHTML = filtrados
    .map((producto) => `
      <tr>
        <td>${producto.sku}</td>
        <td>
          <strong>${producto.name}</strong>
          <br>
          <span>${producto.category}</span>
        </td>
        <td>${money(producto.price)}</td>
        <td>${producto.stock}</td>
        <td>
          <button class="secondary" type="button" data-agregar="${producto.id}" ${producto.stock === 0 ? "disabled" : ""}>Agregar</button>
        </td>
      </tr>
    `)
    .join("");
}

function renderVenta() {
  if (venta.length === 0) {
    ventaItems.innerHTML = `<tr><td class="empty" colspan="5">No hay productos en la venta.</td></tr>`;
    actualizarTotales();
    return;
  }

  ventaItems.innerHTML = venta
    .map((item) => `
      <tr>
        <td>
          <strong>${item.name}</strong>
          <br>
          <span>${item.sku}</span>
        </td>
        <td>
          <div class="quantity-control" aria-label="Cantidad de ${item.name}">
            <button class="secondary quantity-button" type="button" data-disminuir="${item.id}">-</button>
            <span>${item.cantidad}</span>
            <button class="secondary quantity-button" type="button" data-aumentar="${item.id}" ${item.cantidad >= item.stock ? "disabled" : ""}>+</button>
          </div>
        </td>
        <td>${money(item.price)}</td>
        <td>${money(item.price * item.cantidad)}</td>
        <td>
          <button class="danger" type="button" data-quitar="${item.id}">Quitar</button>
        </td>
      </tr>
    `)
    .join("");

  actualizarTotales();
}

async function cargarProductos() {
  const response = await fetch("/api/products");
  productos = await response.json();
  renderCatalogo();
  setStatus("Catalogo cargado");
}

function agregarProducto(id) {
  const producto = productos.find((item) => item.id === Number(id));
  if (!producto) return;

  const itemVenta = venta.find((item) => item.id === producto.id);

  if (itemVenta) {
    if (itemVenta.cantidad >= producto.stock) {
      setStatus(`Stock maximo alcanzado para ${producto.name}`);
      return;
    }

    itemVenta.cantidad += 1;
    setStatus(`${producto.name} agregado a la venta`);
  } else {
    if (producto.stock <= 0) {
      setStatus(`Sin stock disponible para ${producto.name}`);
      return;
    }

    venta.push({
      id: producto.id,
      sku: producto.sku,
      name: producto.name,
      price: producto.price,
      stock: producto.stock,
      cantidad: 1
    });
    setStatus(`${producto.name} agregado a la venta`);
  }

  renderVenta();
}

function aumentarCantidad(id) {
  const itemVenta = venta.find((item) => item.id === Number(id));
  if (!itemVenta) return;

  if (itemVenta.cantidad >= itemVenta.stock) {
    setStatus(`Stock maximo alcanzado para ${itemVenta.name}`);
    return;
  }

  itemVenta.cantidad += 1;
  setStatus(`Cantidad actualizada para ${itemVenta.name}`);
  renderVenta();
}

function disminuirCantidad(id) {
  const itemVenta = venta.find((item) => item.id === Number(id));
  if (!itemVenta) return;

  itemVenta.cantidad -= 1;

  if (itemVenta.cantidad <= 0) {
    venta = venta.filter((item) => item.id !== itemVenta.id);
    setStatus(`${itemVenta.name} eliminado de la venta`);
  } else {
    setStatus(`Cantidad actualizada para ${itemVenta.name}`);
  }

  renderVenta();
}

function quitarProducto(id) {
  const itemVenta = venta.find((item) => item.id === Number(id));
  if (!itemVenta) return;

  venta = venta.filter((item) => item.id !== itemVenta.id);
  setStatus(`${itemVenta.name} eliminado de la venta`);
  renderVenta();
}

function getErrorMessage(body) {
  if (body?.errors) {
    const messages = Object.values(body.errors);
    if (messages.length > 0) return messages[0];
  }

  return body?.message || "Error al registrar venta";
}

async function registrarVentaActual() {
  if (venta.length === 0) return;

  registrarVenta.disabled = true;
  setStatus("Registrando venta");

  try {
    const response = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: venta.map((item) => ({ id: item.id, cantidad: item.cantidad }))
      })
    });
    const body = await response.json();

    if (!response.ok) {
      setStatus(getErrorMessage(body));
      return;
    }

    mostrarTicket(body);
    venta = [];
    renderVenta();
    await cargarProductos();
    setStatus("Venta registrada");
  } catch {
    setStatus("Error al registrar venta");
  } finally {
    actualizarTotales();
  }
}

catalogoBusqueda.addEventListener("input", renderCatalogo);

catalogoLista.addEventListener("click", (event) => {
  const button = event.target.closest("[data-agregar]");
  if (!button) return;

  agregarProducto(button.dataset.agregar);
});

ventaItems.addEventListener("click", (event) => {
  const disminuir = event.target.closest("[data-disminuir]");
  if (disminuir) {
    disminuirCantidad(disminuir.dataset.disminuir);
    return;
  }

  const aumentar = event.target.closest("[data-aumentar]");
  if (aumentar) {
    aumentarCantidad(aumentar.dataset.aumentar);
    return;
  }

  const quitar = event.target.closest("[data-quitar]");
  if (quitar) quitarProducto(quitar.dataset.quitar);
});

registrarVenta.addEventListener("click", registrarVentaActual);

renderVenta();
cargarProductos().catch(() => {
  setStatus("Error al cargar productos");
});
