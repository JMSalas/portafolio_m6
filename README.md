# 📦 StockMaster: Sistema de Gestión de Inventario

**StockMaster** es una aplicación web simple para la gestión de productos, desarrollada con **Node.js** y el framework **Express**. Permite a los usuarios visualizar, añadir, actualizar y eliminar productos de un inventario persistente en un archivo local.

## 🚀 Instalación y Configuración del Entorno

Para poner en marcha el proyecto, necesitas tener instalado **Node.js** en tu sistema.

### ¿Qué es npm y cómo funciona?

**npm** (Node Package Manager) es el gestor de paquetes por defecto para el entorno de ejecución Node.js. Es la forma en que los desarrolladores de Node.js comparten código. Permite instalar bibliotecas, definir dependencias y ejecutar scripts de proyecto.

1.  **Clonar el Repositorio:**

    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd stockmaster
    ```

2.  **Instalar Dependencias:**
    Ejecuta el siguiente comando para instalar todos los paquetes definidos en `package.json`:

    ```bash
    npm install
    ```

3.  **Ejecutar la Aplicación en Modo Desarrollo:**
    Utiliza el script `dev` que inicia el servidor usando **Nodemon**, lo que permite que el servidor se reinicie automáticamente al detectar cambios en los archivos:

    ```bash
    npm run dev
    ```

    Si deseas ejecutar la aplicación de forma simple, sin Nodemon, usa:

    ```bash
    npm start
    ```

4.  **Acceder a la Aplicación:**
    Una vez que el servidor esté activo, la aplicación estará disponible en:

    ```
    http://localhost:3000
    ```

-----

## 🛠️ Dependencias Utilizadas

El proyecto utiliza las siguientes dependencias clave:

| Dependencia | Propósito |
| :--- | :--- |
| **Express** | Framework web minimalista de Node.js que facilita la creación de servidores robustos para manejar rutas y middlewares. |
| **express-handlebars** | Motor de plantillas (vistas) que permite generar HTML dinámico en el lado del servidor. |
| **chalk** | Biblioteca para dar formato de color a la salida de la consola, mejorando la legibilidad de los logs del servidor. |
| **Nodemon** (Dev) | Herramienta de desarrollo que monitorea cambios en el código fuente y reinicia el servidor automáticamente. |

-----

## 📂 Estructura de Carpetas

La aplicación sigue una estructura organizada para separar la lógica de negocio, las clases, las utilidades y las vistas:

```
.
├── classes/
│   ├── Product.js
│   └── ProductsAdmin.js  (Lógica CRUD sobre el archivo JSON)
├── public/
│   ├── css/
│   ├── js/
│   │   ├── productFetch.js  (Utilidad para manejar peticiones Fetch)
│   │   ├── scriptNavbar.js
│   │   └── scriptProducts.js (Lógica del lado del cliente)
│   └── images/
├── utils/
│   └── fileUtils.js    (Funciones de lectura y escritura de archivos)
├── views/
│   ├── layouts/
│   │   └── main.hbs    (Layout principal)
│   ├── partials/
│   │   └── *.hbs       (Header, footer, navbar, scripts)
│   ├── error.hbs
│   ├── home.hbs
│   └── products.hbs    (Vista principal del inventario)
├── package.json
├── products.json       (Base de datos local)
└── server.js           (Configuración y rutas del servidor)
```

-----

## 💾 Persistencia de Datos

La aplicación implementa un sistema de persistencia simple pero efectivo:

  * **Archivo `products.json`** : Almacena todos los datos del inventario de forma local.
  * **Clase `ProductsAdmin`** : Es la encargada de manejar la lógica de negocio (CRUD). Utiliza las funciones de `fileUtils.js` para leer y escribir en el archivo `products.json`.
      * **Lectura (`getProducts`)** : Lee el contenido del archivo, lo parsea a un *array* de JavaScript.
      * **Escritura (`setProducts`)** : Escribe el *array* actualizado en el archivo, asegurando el formato JSON.

-----

## ⚠️ Manejo de Errores

El manejo de errores se gestiona tanto en el *frontend* como en el *backend*:

### 1\. Manejo de Errores en el Backend (Node.js/Express)

  * **Middleware de Errores** : En `server.js`, el último *middleware* se define con la firma de cuatro argumentos (`err, req, res, next`) para capturar cualquier error que haya sido lanzado en las rutas.
  * **Registro y Respuesta** : Este *middleware* logea el error en la consola y envía una respuesta JSON al cliente con el mensaje de error. Esto es crucial para que el *frontend* sepa qué mostrar al usuario.
  * **Manejo de Rutas No Encontradas (`404`)** : La ruta `app.all("/{*ruta}")` captura cualquier *endpoint* no definido y renderiza una vista de error 404.

### 2\. Manejo de Errores en el Frontend (JavaScript)

  * **Utilidad `productFetch`** : Esta función envuelve la llamada a `fetch` y se encarga de manejar errores de red y de respuesta HTTP.
      * Si la respuesta no es `response.ok` (ej. 4xx o 5xx), intenta leer un mensaje de error detallado del cuerpo JSON de la respuesta del servidor.
      * Lanza un `Error` con el mensaje más relevante (ya sea el estado HTTP o el mensaje del servidor).
  * **`ProductsUI` y Toasts** : La clase de la interfaz de usuario ProductsUI en `scriptProducts.js` envuelve todas las llamadas a `productFetch` en bloques `try...catch`. El método `showToast()` se utiliza para mostrar cualquier error capturado al usuario en una notificación temporal de Bootstrap.

-----

## ⚙️ Cómo Ejecutar y Mantener el Servidor en Producción

Para desplegar la aplicación en un entorno de producción, los pasos son similares a la ejecución simple:

1.  Asegúrate de que todas las dependencias estén instaladas (`npm install`).
2.  Utiliza el script `start` definido en `package.json`:
    ```bash
    npm start
    ```
    Este comando inicia la aplicación con **Node.js** directamente (`node server.js`).

**Mantenimiento en Producción:**
En un entorno real, se recomienda usar un *monitor de procesos* como **PM2** o **Forever** en lugar de `npm start`. Estos gestores aseguran que la aplicación se reinicie automáticamente en caso de fallo y permiten balancear la carga de la aplicación.

-----

## 🧪 Pruebas

1. El código incluye un mecanismo simple en `scriptProducts.js` para simular fallos de prueba sin modificar la lógica principal de la aplicación:

```javascript
// Dentro de ProductsUI.js
constructor (test = false) { 
    // ...
    this.test = test;
    // ...
}

// Ejemplo de uso en la función delete:
await productFetch(`/products/${this.test?999:btnDelete.dataset.id}`, 
    {
        method: 'DELETE'
    }
);
```

Al pasar `test = true` a la clase `ProductsUI`, las solicitudes `DELETE` y `PUT` intentarán usar el ID `999`. Dado que este ID probablemente no existe en `products.json`, esto forzará un error 500/404 que será capturado por el `try...catch` del frontend, permitiendo verificar el correcto funcionamiento del `showToast` y la captura de error al actualizar o eliminar productos.

`Error: Producto ID: ${id}, no encontrado. No se han actualizado productos.`

`Error: Producto ID: ${id}, no encontrado. No se han eliminado productos`

2. Cambiar los permisos del archivo products.json para que permita solo lectura. Esto levanta errores que se muestran en consola del servidor, consola del browser, y mensajes al usuario en toast de bootstrap.

`Error: ([CREATE, UPDATE, DELETE]) No se pudo escribir en el archivo de productos.`

3. Si en el archivo server.js se cambia el valor de `const productFile = "products.json";` o el archivo "products.json" no existe en el directorio raiz del proyecto, Se registran errores en la consola del servidor, consola del browser, y se renderiza una página de error con el mensaje:

`Error: (READ) No se pudo leer el archivo de datos.`

4. La ruta en "Contactos" no ha sido definida, por lo tanto deriva a la página de error 404.
-----

## 👨‍💻 Autor

**José Miguel Salas M**