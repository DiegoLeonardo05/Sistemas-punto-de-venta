const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pos-sales-test-"));
process.env.DB_PATH = path.join(tempDir, "test.db");

const { createProduct, createSale, ensureDatabase, getProducts, getSaleById } = require("../server");

let sequence = 0;

function createTestProduct(overrides = {}) {
  sequence += 1;

  const result = createProduct({
    sku: `SALE-${sequence}`,
    name: `Producto venta ${sequence}`,
    category: "Pruebas",
    price: 50,
    stock: 10,
    description: "Producto para pruebas de venta",
    ...overrides
  });

  assert.equal(result.status, 201);
  return result.body;
}

function getProductStock(id) {
  const product = getProducts().find((item) => item.id === id);
  return product?.stock;
}

test("registra una venta valida con items e importes", () => {
  ensureDatabase();

  const product = createTestProduct({ price: 75, stock: 5 });
  const result = createSale({ items: [{ id: product.id, cantidad: 2 }] });

  assert.equal(result.status, 201);
  assert.ok(result.body.id);
  assert.ok(Array.isArray(result.body.items));
  assert.equal(result.body.items.length, 1);
  assert.equal(result.body.subtotal, 150);
  assert.equal(result.body.tax, 24);
  assert.equal(result.body.total, 174);
});

test("calcula subtotal, IVA y total con los precios de la base de datos", () => {
  ensureDatabase();

  const first = createTestProduct({ price: 100, stock: 4 });
  const second = createTestProduct({ price: 50, stock: 4 });
  const result = createSale({
    items: [
      { id: first.id, cantidad: 2 },
      { id: second.id, cantidad: 1 }
    ]
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.subtotal, 250);
  assert.equal(result.body.tax, result.body.subtotal * 0.16);
  assert.equal(result.body.total, result.body.subtotal + result.body.tax);
});

test("descuenta el stock exactamente en la cantidad vendida", () => {
  ensureDatabase();

  const product = createTestProduct({ stock: 8 });
  const result = createSale({ items: [{ id: product.id, cantidad: 3 }] });

  assert.equal(result.status, 201);
  assert.equal(getProductStock(product.id), 5);
});

test("rechaza stock insuficiente sin modificar el stock", () => {
  ensureDatabase();

  const product = createTestProduct({ stock: 2 });
  const result = createSale({ items: [{ id: product.id, cantidad: 3 }] });

  assert.equal(result.status, 409);
  assert.equal(result.body.valid, false);
  assert.ok(result.body.errors.stock);
  assert.equal(getProductStock(product.id), 2);
});

test("devuelve 404 cuando el producto no existe", () => {
  ensureDatabase();

  const result = createSale({ items: [{ id: 999999, cantidad: 1 }] });

  assert.equal(result.status, 404);
  assert.equal(result.body.valid, false);
  assert.ok(result.body.errors.product);
});

test("rechaza payload invalido con items vacio o cantidad no valida", () => {
  ensureDatabase();

  const emptyItems = createSale({ items: [] });
  const invalidQuantity = createSale({ items: [{ id: 1, cantidad: 0 }] });

  assert.equal(emptyItems.status, 400);
  assert.equal(emptyItems.body.valid, false);
  assert.ok(emptyItems.body.errors.items);

  assert.equal(invalidQuantity.status, 400);
  assert.equal(invalidQuantity.body.valid, false);
  assert.ok(invalidQuantity.body.errors["items.0.cantidad"]);
});

test("getSaleById devuelve la venta con sus items o null si no existe", () => {
  ensureDatabase();

  const product = createTestProduct({ price: 30, stock: 3 });
  const created = createSale({ items: [{ id: product.id, cantidad: 1 }] });
  const sale = getSaleById(created.body.id);

  assert.equal(created.status, 201);
  assert.equal(sale.id, created.body.id);
  assert.equal(sale.items.length, 1);
  assert.equal(sale.items[0].product_id, product.id);
  assert.equal(getSaleById(999999), null);
});
