const form = document.querySelector("#product-form");
const formTitle = document.querySelector("#form-title");
const productId = document.querySelector("#product-id");
const cancelEdit = document.querySelector("#cancel-edit");
const productsBody = document.querySelector("#products-body");
const search = document.querySelector("#search");
const summary = document.querySelector("#summary");
const statusBox = document.querySelector("#status");

let products = [];

const fields = ["sku", "name", "category", "price", "stock", "description"];

function money(value) {
  return Number(value).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN"
  });
}

function setStatus(message) {
  statusBox.textContent = message;
}

function clearErrors() {
  for (const field of fields) {
    const error = document.querySelector(`#${field}-error`);
    if (error) error.textContent = "";
  }
}

function showErrors(errors = {}) {
  clearErrors();
  for (const [field, message] of Object.entries(errors)) {
    const error = document.querySelector(`#${field}-error`);
    if (error) error.textContent = message;
  }
}

function getPayload() {
  return Object.fromEntries(new FormData(form).entries());
}

function resetForm() {
  form.reset();
  productId.value = "";
  formTitle.textContent = "Alta de producto";
  cancelEdit.hidden = true;
  clearErrors();
}

function renderProducts() {
  const query = search.value.trim().toLowerCase();
  const filtered = products.filter((product) => {
    return [product.sku, product.name, product.category]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  summary.textContent = `${products.length} producto${products.length === 1 ? "" : "s"} registrado${products.length === 1 ? "" : "s"}`;

  if (filtered.length === 0) {
    productsBody.innerHTML = `<tr><td class="empty" colspan="6">No hay productos para mostrar.</td></tr>`;
    return;
  }

  productsBody.innerHTML = filtered
    .map((product) => `
      <tr>
        <td>${product.sku}</td>
        <td>
          <strong>${product.name}</strong>
          <br>
          <span>${product.description || "Sin descripcion"}</span>
        </td>
        <td>${product.category}</td>
        <td>${money(product.price)}</td>
        <td>${product.stock}</td>
        <td><button class="secondary" type="button" data-edit="${product.id}">Editar</button></td>
      </tr>
    `)
    .join("");
}

async function loadProducts() {
  const response = await fetch("/api/products");
  products = await response.json();
  renderProducts();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = productId.value;
  const url = id ? `/api/products/${id}` : "/api/products";
  const method = id ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(getPayload())
  });

  const body = await response.json();

  if (!response.ok) {
    showErrors(body.errors || {});
    setStatus(response.status === 409 ? "Codigo duplicado" : "Revisar campos obligatorios");
    return;
  }

  resetForm();
  await loadProducts();
  setStatus(id ? "Producto actualizado" : "Producto registrado");
});

productsBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit]");
  if (!button) return;

  const product = products.find((item) => item.id === Number(button.dataset.edit));
  if (!product) return;

  productId.value = product.id;
  for (const field of fields) {
    const input = document.querySelector(`#${field}`);
    if (input) input.value = product[field] ?? "";
  }

  formTitle.textContent = "Editar producto";
  cancelEdit.hidden = false;
  clearErrors();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

cancelEdit.addEventListener("click", resetForm);
search.addEventListener("input", renderProducts);

loadProducts().catch((error) => {
  setStatus("Error al cargar productos");
  console.error(error);
});
