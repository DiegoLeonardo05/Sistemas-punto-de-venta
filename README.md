# Sistema Punto de Venta - Modulo de productos

Proyecto para la Actividad 3.2 de Modelos y metodologia para el desarrollo de software.

## Integrantes

- Alejandro Castro Ramirez
- Natanael Macias Contreras
- Diego Leonardo Serrano
- Horacio Gaona Martin del Campo

## Objetivo del incremento

El incremento implementa la funcionalidad basica del modulo de gestion de productos del sistema de punto de venta. Permite registrar productos, consultar el catalogo, editar productos existentes y validar campos obligatorios antes de guardar informacion en la base de datos.

## Alcance cubierto del Sprint Backlog

- SP-01: Formulario para alta de productos.
- SP-02: Registro de productos en base de datos.
- SP-03: Edicion de productos existentes.
- SP-04: Visualizacion y consulta del catalogo.
- SP-05: Validacion de campos obligatorios.
- SP-06: Pruebas funcionales del modulo.

## Como ejecutar

```bash
npm start
```

Abrir en el navegador:

```text
http://localhost:3000
```

## Como probar

```bash
npm test
```

Las pruebas automatizadas verifican:

- Rechazo de productos con campos obligatorios vacios.
- Registro de producto valido.
- Consulta del catalogo.
- Edicion de producto existente.

## Base de datos

La base de datos se crea automaticamente en:

```text
data/pos.db
```

Comando para revisar la estructura:

```bash
sqlite3 data/pos.db '.schema products'
```

Comando para revisar productos guardados:

```bash
sqlite3 data/pos.db 'SELECT id, sku, name, category, price, stock FROM products;'
```

## Evidencia sugerida para la entrega

1. Codigo:
   - Captura de `server.js` mostrando la tabla `products`, `createProduct`, `updateProduct` y `validateProduct`.
   - Captura de `public/index.html` mostrando el formulario.
   - Captura de `public/app.js` mostrando el envio del formulario y la edicion.

2. Base de datos:
   - Captura del comando `sqlite3 data/pos.db '.schema products'`.
   - Captura del comando `sqlite3 data/pos.db 'SELECT id, sku, name, category, price, stock FROM products;'`.

3. Documentacion funcional:
   - Captura del formulario de alta.
   - Captura de validacion con campos vacios.
   - Captura de producto registrado en el catalogo.
   - Captura de producto editado.

4. Git y GitHub:
   - `git log --oneline`
   - `git branch`
   - Captura del repositorio en GitHub cuando se suba.
   - Historial de commits.

## Explicacion breve del incremento

Se construyo un modulo funcional de productos para el punto de venta. El formulario captura codigo, nombre, categoria, precio, stock y descripcion. El backend valida que los campos obligatorios sean correctos antes de guardar la informacion. Los productos se almacenan en SQLite y se muestran en un catalogo consultable. Tambien se permite editar productos existentes, actualizando la informacion en la base de datos.

Este incremento contribuye al producto final porque establece el catalogo base sobre el que despues podran operar ventas, inventario, alertas de bajo stock y reportes.
