# Sistema Punto de Venta - Módulo de productos

Proyecto desarrollado para implementar el módulo de productos de un sistema de punto de venta.

## Integrantes

* Alejandro Castro Ramírez
* Natanael Macías Contreras
* Diego Leonardo Serrano
* Horacio Gaona Martín del Campo

## Descripción general

Este módulo permite administrar los productos registrados en el sistema de punto de venta. Desde la interfaz principal se pueden agregar productos nuevos, consultar el catálogo y editar la información de productos existentes.

La información de cada producto se guarda en una base de datos SQLite, por lo que los datos permanecen almacenados aunque se cierre la aplicación.

## Qué hace el código

El sistema permite realizar las siguientes acciones:

* Registrar productos nuevos.
* Mostrar los productos guardados en un catálogo.
* Editar productos existentes.
* Validar que los campos obligatorios estén completos.
* Guardar la información en una base de datos local.
* Consultar los productos almacenados desde la interfaz.

Cada producto contiene datos como código, nombre, categoría, precio, stock y descripción.

## Cómo funciona

El proyecto funciona mediante un servidor en Node.js. El servidor se encarga de recibir las solicitudes del navegador, validar la información enviada por el usuario y guardar los datos en la base de datos SQLite.

La interfaz web permite capturar la información del producto mediante un formulario. Cuando el usuario envía el formulario, el código de JavaScript toma los datos ingresados y los manda al servidor.

Antes de guardar un producto, el backend revisa que los campos obligatorios tengan información válida. Si falta algún dato importante, el sistema muestra un mensaje de error y no guarda el producto.

Si los datos son correctos, el producto se registra en la base de datos y después aparece en el catálogo de productos.

## Funcionamiento del registro de productos

Para registrar un producto, el usuario llena el formulario con la información correspondiente. El sistema revisa que los datos principales estén completos y que el precio y el stock tengan valores válidos.

Cuando la información pasa la validación, el producto se almacena en la tabla `products` de la base de datos.

Después de guardar el producto, el catálogo se actualiza para mostrar el nuevo registro.

## Funcionamiento del catálogo

El catálogo muestra los productos que ya están guardados en la base de datos. Desde esta sección se puede revisar la información principal de cada producto, como su código, nombre, categoría, precio y cantidad disponible.

El catálogo se carga consultando los productos almacenados en SQLite y mostrándolos en la página principal.

## Funcionamiento de la edición

El sistema también permite modificar productos ya registrados. Al seleccionar un producto para editar, sus datos se cargan nuevamente en el formulario.

Después de hacer los cambios, el usuario puede guardar la información actualizada. El servidor recibe los nuevos datos, los valida y actualiza el registro correspondiente en la base de datos.

## Base de datos

La información se guarda en una base de datos SQLite ubicada en:

```text
data/pos.db
```

Dentro de esta base de datos se utiliza la tabla `products`, donde se almacenan los productos registrados en el sistema.

## Cómo ejecutar el proyecto

Primero se deben instalar las dependencias:

```bash
npm install
```

Después se inicia el servidor:

```bash
npm start
```

Finalmente, se abre el navegador en la siguiente dirección:

```text
http://localhost:3000
```

## Cómo probar el proyecto

Para ejecutar las pruebas automatizadas se usa el comando:

```bash
npm test
```

Las pruebas revisan que el módulo pueda validar datos, registrar productos, consultar el catálogo y editar productos existentes.

## Resumen del funcionamiento

En general, el código conecta una interfaz web con un servidor y una base de datos local. El usuario captura los datos del producto desde el navegador, el servidor valida la información y después la guarda en SQLite.

Este módulo sirve como base para otras partes del punto de venta, ya que el catálogo de productos será necesario para funciones como ventas, inventario, reportes y control de existencias.

