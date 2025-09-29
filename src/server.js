import http from "http";
import fs from "fs";
import path from "path";
import { parseForm } from "./utils/parseForm.js";
import { parseJsonBody } from "./utils/parseJsonBody.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "./domain/services/productService.js";
import { PORT, PRODUCTS_ROUTE } from "./config/serverConfig.js";
import { sendResponse } from "./utils/sendResponse.js";

const ADMIN_PANEL_PATH = path.join(process.cwd(), "src", "index.html");

/**
 * Función central para manejar todas las rutas de la API.
 */
async function handleRequest(req, res) {
  // 🔹 Pre-procesamiento de URL para obtener ID y ruta
  const urlParts = req.url.split("/").filter(Boolean);
  const [route, idParam] = urlParts; // Destructuring: ej. ['products', '123']

  const isProductRoute = route === PRODUCTS_ROUTE;
  const productId = isProductRoute && idParam ? parseInt(idParam, 10) : null;
  const isProductsCollection = isProductRoute && urlParts.length === 1;

  if (req.url === "/" && req.method === "GET") {
    try {
      const content = fs.readFileSync(ADMIN_PANEL_PATH, "utf-8");

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
      return;
    } catch (err) {
      console.error("Error al leer index.html:", err);
      sendResponse(res, 500, {
        error: "Error interno: No se pudo cargar el panel de administración.",
      });
      return;
    }
  }

  if (isProductsCollection) {
    // ----------------------------------------------------
    // 🔹 Rutas de Colección /products
    // ----------------------------------------------------

    switch (req.method) {
      case "GET":
        const products = await getAllProducts();
        sendResponse(
          res,
          200,
          products.map((p) => p.toJSON())
        );
        return;

      case "POST":
        // Usa parseForm para manejar multipart/form-data (archivos)
        const { fields, files } = await parseForm(req);

        // Conversión de tipos (Busboy devuelve todo como string)
        const productData = {
          name: fields.name,
          description: fields.description,
          price: parseFloat(fields.price),
          quantity: parseInt(fields.quantity, 10),
          available: fields.available === "true",
        };

        const newProduct = await createProduct(productData, files);
        sendResponse(res, 201, newProduct.toJSON());
        return;
    }
  }

  if (productId) {
    // ----------------------------------------------------
    // 🔹 Rutas de Elemento /products/:id
    // ----------------------------------------------------

    switch (req.method) {
      case "GET":
        const product = await getProductById(productId);
        sendResponse(res, 200, product.toJSON());
        return;

      case "PUT":
        // Usa parseJsonBody para manejar application/json
        const updates = await parseJsonBody(req);
        const updatedProduct = await updateProduct(productId, updates);
        sendResponse(res, 200, updatedProduct.toJSON());
        return;

      case "DELETE":
        await deleteProduct(productId);
        // DELETE debe devolver 204 No Content, no un body
        res.writeHead(204);
        res.end();
        return;
    }
  }

  // Si no se manejó ninguna ruta, devuelve 404
  sendResponse(res, 404, { error: "Ruta no encontrada" });
}

// --- Configuración del Servidor ---

const server = http.createServer(async (req, res) => {
  // 🔹 Configurar CORS (Permite todos los orígenes y métodos)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    await handleRequest(req, res);
  } catch (err) {
    console.error("Error en la solicitud:", err.message);

    let statusCode = 500;

    // Asignación de códigos de estado específicos
    if (err.message.includes("Producto no encontrado")) {
      statusCode = 404;
    } else if (
      err.message.includes("Formato JSON inválido") ||
      err.message.includes("El nombre del producto es obligatorio")
    ) {
      statusCode = 400; // Bad Request para errores de validación/parsing
    }

    sendResponse(res, statusCode, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
