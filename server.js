const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const PORT = Number(process.env.PORT || 3000);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "pos.db");
const PUBLIC_DIR = path.join(__dirname, "public");
const IVA = 0.16;

function ensureDatabase() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  runSql(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      stock INTEGER NOT NULL CHECK(stock >= 0),
      description TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      subtotal REAL NOT NULL,
      FOREIGN KEY (sale_id) REFERENCES sales(id)
    );
  `);
}

function runSql(sql) {
  const result = spawnSync("sqlite3", [DB_PATH], {
    input: sql,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || "Error al ejecutar SQLite");
  }

  return result.stdout;
}

function runJson(sql) {
  const result = spawnSync("sqlite3", ["-json", DB_PATH, sql], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || "Error al ejecutar SQLite");
  }

  return result.stdout.trim() ? JSON.parse(result.stdout) : [];
}

function runJsonScript(sql) {
  const result = spawnSync("sqlite3", ["-json", DB_PATH], {
    input: `.bail on\n${sql}`,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(result.stderr || "Error al ejecutar SQLite");
  }

  return result.stdout.trim() ? JSON.parse(result.stdout) : [];
}

function sqlText(value) {
  return `'${String(value ?? "").replaceAll("'", "''")}'`;
}

function getProducts() {
  return runJson(`
    SELECT id, sku, name, category, price, stock, description, created_at, updated_at
    FROM products
    ORDER BY updated_at DESC, id DESC;
  `);
}

function getProductById(id) {
  const rows = runJson(`
    SELECT id, sku, name, category, price, stock, description, created_at, updated_at
    FROM products
    WHERE id = ${Number(id)};
  `);

  return rows[0] || null;
}

function validateProduct(payload) {
  const errors = {};
  const rawPrice = String(payload.price ?? "").trim();
  const rawStock = String(payload.stock ?? "").trim();
  const product = {
    sku: String(payload.sku || "").trim(),
    name: String(payload.name || "").trim(),
    category: String(payload.category || "").trim(),
    price: Number(rawPrice),
    stock: Number(rawStock),
    description: String(payload.description || "").trim()
  };

  if (!product.sku) errors.sku = "El codigo es obligatorio.";
  if (!product.name) errors.name = "El nombre es obligatorio.";
  if (!product.category) errors.category = "La categoria es obligatoria.";
  if (!rawPrice || !Number.isFinite(product.price) || product.price < 0) {
    errors.price = "El precio debe ser un numero mayor o igual a 0.";
  }
  if (!rawStock || !Number.isInteger(product.stock) || product.stock < 0) {
    errors.stock = "El stock debe ser un numero entero mayor o igual a 0.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    product
  };
}

function createProduct(payload) {
  const validation = validateProduct(payload);
  if (!validation.valid) return { status: 400, body: validation };

  const product = validation.product;

  try {
    const rows = runJson(`
      INSERT INTO products (sku, name, category, price, stock, description)
      VALUES (
        ${sqlText(product.sku)},
        ${sqlText(product.name)},
        ${sqlText(product.category)},
        ${product.price},
        ${product.stock},
        ${sqlText(product.description)}
      )
      RETURNING id, sku, name, category, price, stock, description, created_at, updated_at;
    `);
    return { status: 201, body: rows[0] };
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed")) {
      return {
        status: 409,
        body: { valid: false, errors: { sku: "Ya existe un producto con ese codigo." } }
      };
    }
    throw error;
  }
}

function updateProduct(id, payload) {
  const current = getProductById(id);
  if (!current) return { status: 404, body: { message: "Producto no encontrado." } };

  const validation = validateProduct(payload);
  if (!validation.valid) return { status: 400, body: validation };

  const product = validation.product;

  try {
    const rows = runJson(`
      UPDATE products
      SET
        sku = ${sqlText(product.sku)},
        name = ${sqlText(product.name)},
        category = ${sqlText(product.category)},
        price = ${product.price},
        stock = ${product.stock},
        description = ${sqlText(product.description)},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${Number(id)}
      RETURNING id, sku, name, category, price, stock, description, created_at, updated_at;
    `);
    return { status: 200, body: rows[0] };
  } catch (error) {
    if (String(error.message).includes("UNIQUE constraint failed")) {
      return {
        status: 409,
        body: { valid: false, errors: { sku: "Ya existe un producto con ese codigo." } }
      };
    }
    throw error;
  }
}

function deleteProduct(id) {
  const current = getProductById(id);
  if (!current) return { status: 404, body: { message: "Producto no encontrado." } };

  runSql(`DELETE FROM products WHERE id = ${Number(id)};`);
  return { status: 200, body: { message: "Producto eliminado." } };
}

function validateSale(payload) {
  const errors = {};

  if (!Array.isArray(payload?.items) || payload.items.length === 0) {
    errors.items = "La venta debe incluir al menos un producto.";
    return { valid: false, errors };
  }

  const normalizedItems = [];

  payload.items.forEach((item, index) => {
    const id = Number(item?.id);
    const cantidad = Number(item?.cantidad);

    if (!Number.isInteger(id) || id <= 0) {
      errors[`items.${index}.id`] = "El producto es obligatorio.";
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      errors[`items.${index}.cantidad`] = "La cantidad debe ser un entero mayor a 0.";
    }

    if (Number.isInteger(id) && id > 0 && Number.isInteger(cantidad) && cantidad > 0) {
      normalizedItems.push({ id, cantidad });
    }
  });

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  const groupedItems = new Map();
  for (const item of normalizedItems) {
    groupedItems.set(item.id, (groupedItems.get(item.id) || 0) + item.cantidad);
  }

  return {
    valid: true,
    errors,
    items: Array.from(groupedItems, ([id, cantidad]) => ({ id, cantidad }))
  };
}

function calculateSaleAmounts(items) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * IVA;

  return {
    subtotal,
    tax,
    total: subtotal + tax
  };
}

function getSaleById(id) {
  const saleId = Number(id);
  if (!Number.isInteger(saleId) || saleId <= 0) return null;

  const rows = runJson(`
    SELECT id, subtotal, tax, total, created_at
    FROM sales
    WHERE id = ${saleId};
  `);

  if (!rows[0]) return null;

  const items = runJson(`
    SELECT product_id, sku, name, price, quantity, subtotal
    FROM sale_items
    WHERE sale_id = ${saleId}
    ORDER BY id;
  `);

  return {
    ...rows[0],
    items
  };
}

function createSale(payload) {
  const validation = validateSale(payload);
  if (!validation.valid) return { status: 400, body: validation };

  const items = [];

  for (const item of validation.items) {
    const product = getProductById(item.id);

    if (!product) {
      return {
        status: 404,
        body: { valid: false, errors: { product: `Producto no encontrado (${item.id}).` } }
      };
    }

    if (item.cantidad > product.stock) {
      return {
        status: 409,
        body: {
          valid: false,
          errors: {
            stock: `Stock insuficiente para ${product.name} (disponible: ${product.stock}).`
          }
        }
      };
    }

    const price = Number(product.price);
    items.push({
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      price,
      quantity: item.cantidad,
      subtotal: price * item.cantidad
    });
  }

  const amounts = calculateSaleAmounts(items);
  const itemStatements = items
    .map((item) => `
      INSERT INTO sale_items (sale_id, product_id, sku, name, price, quantity, subtotal)
      VALUES (
        (SELECT id FROM current_sale),
        ${item.product_id},
        ${sqlText(item.sku)},
        ${sqlText(item.name)},
        ${item.price},
        ${item.quantity},
        ${item.subtotal}
      );

      UPDATE products
      SET stock = stock - ${item.quantity}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${item.product_id};
    `)
    .join("");

  const rows = runJsonScript(`
    BEGIN;

    CREATE TEMP TABLE current_sale (id INTEGER NOT NULL);

    INSERT INTO sales (subtotal, tax, total)
    VALUES (${amounts.subtotal}, ${amounts.tax}, ${amounts.total});

    INSERT INTO current_sale (id) VALUES (last_insert_rowid());

    ${itemStatements}

    SELECT id FROM current_sale;

    COMMIT;
  `);

  const sale = getSaleById(rows[0].id);
  return { status: 201, body: sale };
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) request.destroy();
    });
    request.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("JSON invalido"));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function sendFile(response, urlPath) {
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.join(PUBLIC_DIR, path.normalize(requestedPath));

  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Archivo no encontrado");
    return;
  }

  const extension = path.extname(filePath);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8"
  };

  response.writeHead(200, { "Content-Type": types[extension] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(response);
}

function createServer() {
  ensureDatabase();

  return http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    try {
      if (url.pathname === "/api/products" && request.method === "GET") {
        sendJson(response, 200, getProducts());
        return;
      }

      if (url.pathname === "/api/products" && request.method === "POST") {
        const result = createProduct(await readJson(request));
        sendJson(response, result.status, result.body);
        return;
      }

      if (url.pathname === "/api/sales" && request.method === "POST") {
        const result = createSale(await readJson(request));
        sendJson(response, result.status, result.body);
        return;
      }

      const productMatch = url.pathname.match(/^\/api\/products\/(\d+)$/);
      if (productMatch && request.method === "PUT") {
        const result = updateProduct(productMatch[1], await readJson(request));
        sendJson(response, result.status, result.body);
        return;
      }

      if (productMatch && request.method === "DELETE") {
        const result = deleteProduct(productMatch[1]);
        sendJson(response, result.status, result.body);
        return;
      }

      if (url.pathname.startsWith("/api/")) {
        sendJson(response, 404, { message: "Ruta no encontrada." });
        return;
      }

      sendFile(response, url.pathname);
    } catch (error) {
      sendJson(response, 500, { message: error.message });
    }
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
}

module.exports = {
  createServer,
  validateProduct,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createSale,
  getSaleById,
  ensureDatabase
};
