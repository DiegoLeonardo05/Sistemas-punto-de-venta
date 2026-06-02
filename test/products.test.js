const assert = require("node:assert");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "pos-test-"));
process.env.DB_PATH = path.join(tempDir, "test.db");

const { createProduct, ensureDatabase, getProducts, updateProduct, validateProduct } = require("../server");

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
