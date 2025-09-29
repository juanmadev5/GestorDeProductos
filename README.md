# 🚀 E-commerce Backend & Admin Panel (Gestor de Productos)

¡Bienvenido al **Gestor de Productos**\! Esta es una **solución Full-Stack** diseñada para pequeños negocios, combinando una API robusta y un panel de administración para la gestión de inventario y catálogo en tiempo real.

-----

## 🌟 Resumen de la Solución

Este proyecto es la base para cualquier portal de ventas (*e-commerce*).

| Componente | Función | Tecnologías Clave |
| :--- | :--- | :--- |
| **Backend (API)** | Gestión del inventario (CRUD), validación de datos y manejo de archivos. | **Node.js/JavaScript**, **Express.js**, Patrón **Repository**. |
| **Data & Storage** | Persistencia de datos, autenticación y almacenamiento de imágenes. | **Supabase** (PostgreSQL) y **Supabase Storage**. |
| **Frontend (Panel)** | Interfaz de usuario para la administración de productos, stock y carga de imágenes. | **HTML/CSS/JavaScript** (Interfaz desacoplada). |

-----

## ✨ Características Destacadas

  * **API RESTful Completa:** Implementación de operaciones CRUD (Crear, Leer, Actualizar, Borrar) para productos.
  * **Gestión de Imágenes:** Capacidad para subir y almacenar múltiples imágenes por producto directamente a **Supabase Storage**.
  * **Base de Datos en la Nube:** Uso de **Supabase (PostgreSQL)** para un almacenamiento escalable y seguro.
  * **Panel de Administración:** Una interfaz web funcional que permite a cualquier usuario no técnico gestionar el stock y la visibilidad de los productos.
  * **Diseño Modular:** Arquitectura de código clara con separación de responsabilidades (dominio, servicios, utilidades).
  * **Desacoplado:** La API está lista para integrarse con cualquier *frontend* (web o móvil) personalizado.

-----

## 🛠️ Estructura del Proyecto

El proyecto sigue una estructura limpia y orientada al dominio.

```
.
├── database.sql          # 💡 Plantilla SQL para crear las tablas en Supabase
├── .env.example          # Plantilla de variables de entorno
├── package.json           # Dependencias y scripts de Node.js
└── src/
    ├── index.html          # Interfaz web principal (Frontend/Admin Panel)
    ├── server.js           # Servidor principal con Express
    ├── api/
    │   └── supabase.js     # Configuración e inicialización del cliente Supabase
    ├── config/
    │   └── serverConfig.js # Configuración centralizada de tablas, buckets y puertos.
    └── ...                 # Módulos de dominio y utilidades
```

-----

## ⚙️ Instalación y Configuración

El proyecto utiliza variables de entorno para manejar la configuración del servidor y las credenciales de Supabase.

### 1\. Preparación de Supabase

1.  Crea un nuevo proyecto en la consola de Supabase.
2.  Ve al Editor de SQL y **ejecuta el script completo** que se encuentra en el archivo **`database.sql`** (o su equivalente en tu repositorio) para crear las tablas `products` y `product_images`.

### 2\. Clonar y Dependencias

```bash
# 1. Clona el repositorio
git clone https://github.com/juanmadev5/GestorDeProductos
cd GestorDeProductos

# 2. Instala las dependencias de Node.js
npm install
```

### 3\. Configuración de Variables de Entorno

**Todas las configuraciones del servidor y las credenciales de Supabase se centralizan a través del archivo `.env`** (gestionado con `dotenv`).

1.  Crea un archivo llamado **`.env`** en la **raíz** del proyecto (puedes copiar y renombrar `.env.example`).

2.  Copia las siguientes variables y reemplaza los valores de ejemplo con tus credenciales de Supabase:

    ```env
    # Credenciales de Supabase (Requeridas)
    PROJECT_URL=https://[TU_ID_PROYECTO].supabase.co
    SUPABASE_KEY=[TU_CLAVE_ANONIMA_O_SERVICIO]
    ```

> **Nota:** Para cambiar de servidor de Supabase, solo necesitas actualizar `PROJECT_URL` y `SUPABASE_KEY` en el archivo `.env`. El resto de la configuración de tablas y *buckets* está en `src/config/serverConfig.js`.

### 4\. Ejecución

Ejecuta el servidor con el comando de inicio de Node.js:

```bash
# Inicia el servidor
npm start
```

Accede al Panel de Administración en tu navegador: **[http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)**

-----

## 🤝 Uso y Contribución

### Uso

  * Utiliza la interfaz web en `/` para administrar tu catálogo.
  * La API REST está disponible en la ruta `/products` para integraciones externas.

### Contribución

¡Las contribuciones son bienvenidas\! Puedes abrir `issues`, enviar `pull requests` o sugerir mejoras.

-----

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **MIT**.

-----

*Desarrollado con ❤️ por el equipo de GestorDeProductos.*
