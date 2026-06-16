const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pos-test-"));
process.env.DB_PATH = path.join(tempDir, "test.db");

const { createProduct, deleteProduct, ensureDatabase, getProducts, updateProduct, validateProduct } = require("../server");

test("rechaza productos con campos obligatorios vacios", () => {
  const result = validateProduct({
    sku: "",
    name: "",
    category: "",
    price: "",
    stock: ""
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.sku);
  assert.ok(result.errors.name);
  assert.ok(result.errors.category);
  assert.ok(result.errors.price);
  assert.ok(result.errors.stock);
});

test("registra, lista y edita productos", () => {
  ensureDatabase();

  const createResult = createProduct({
    sku: "PROD-001",
    name: "Cafe americano",
    category: "Bebidas",
    price: 25.5,
    stock: 12,
    description: "Vaso mediano"
  });

  assert.equal(createResult.status, 201);
  assert.equal(createResult.body.sku, "PROD-001");

  const products = getProducts();
  assert.equal(products.length, 1);

  const updateResult = updateProduct(createResult.body.id, {
    sku: "PROD-001",
    name: "Cafe americano grande",
    category: "Bebidas",
    price: 32,
    stock: 10,
    description: "Vaso grande"
  });

  assert.equal(updateResult.status, 200);
  assert.equal(updateResult.body.name, "Cafe americano grande");
  assert.equal(updateResult.body.price, 32);
  assert.equal(updateResult.body.stock, 10);
});

test("elimina un producto existente", () => {
  ensureDatabase();

  const created = createProduct({
    sku: "DEL-001",
    name: "Producto para eliminar",
    category: "Test",
    price: 10,
    stock: 1
  });

  assert.equal(created.status, 201);

  const result = deleteProduct(created.body.id);
  assert.equal(result.status, 200);
  assert.equal(result.body.message, "Producto eliminado.");

  const products = getProducts();
  const stillExists = products.find((p) => p.id === created.body.id);
  assert.equal(stillExists, undefined);
});

test("devuelve 404 al eliminar un producto inexistente", () => {
  const result = deleteProduct(999999);
  assert.equal(result.status, 404);
  assert.equal(result.body.message, "Producto no encontrado.");
});
