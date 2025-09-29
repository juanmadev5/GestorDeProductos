import { supabase } from "../../api/supabase.js";
import Product from "../product.js";
import {
  BUCKET_NAME,
  PRODUCTS_TABLE,
  IMAGES_TABLE,
} from "../../config/serverConfig.js";
import { safeParseInt } from "../../utils/safeParseInt.js";
import { v4 as uuidv4 } from "uuid";

// ----------------------------------------------------------------------
// CRUD: CREATE
// ----------------------------------------------------------------------

/**
 * Crea un producto, lo inserta en la DB, sube las imágenes a Supabase Storage
 * y registra sus URLs.
 */
export async function createProduct(data, images = []) {
  const {
    name,
    description = "",
    price = 0,
    available = true,
    quantity: rawQuantity = 0,
  } = data;
  const quantity = safeParseInt(rawQuantity);

  // Validación de entrada
  if (!name) throw new Error("El nombre del producto es obligatorio");
  if (price < 0) throw new Error("El precio no puede ser negativo");
  if (quantity < 0)
    throw new Error("La cantidad (stock) no puede ser negativa");

  // 1. Insertar producto en la tabla 'products'
  const productPayload = { name, description, price, available, quantity };
  const { data: productData, error: productError } = await supabase
    .from(PRODUCTS_TABLE)
    .insert([productPayload])
    .select()
    .single();

  if (productError) {
    console.error("Error insertando producto:", productError);
    throw new Error(
      `DB Error: No se pudo crear el producto. ${productError.message}`
    );
  }

  const productId = productData.id;
  const uploadedImages = [];

  // 2. Subir imágenes y guardar URLs
  if (images.length > 0) {
    for (const file of images) {
      // Limpiar y cortar el nombre del archivo
      const rawName = String(file.originalname || "image");
      const safeName = rawName
        .replace(/[^a-zA-Z0-9.\-]/g, "_")
        .substring(0, 30);

      // Crear el path único: [ID_producto]/[UUID]-[nombre_seguro]
      const fileName = `${productId}/${uuidv4()}-${safeName}`;

      // A. Subir el archivo (Buffer)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.warn(
          `Error subiendo ${file.originalname}. Archivo omitido:`,
          uploadError
        );
        continue; // Permite que la creación del producto continúe
      }

      // B. Obtener la URL pública
      const imageUrl = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadData.path).data.publicUrl;

      uploadedImages.push(imageUrl);

      // C. Guardar la URL en la tabla 'product_images'
      const { error: imageDbError } = await supabase
        .from(IMAGES_TABLE)
        .insert([{ product_id: productId, image_url: imageUrl }]);

      if (imageDbError) {
        console.error("Error guardando URL en DB:", imageDbError);
      }
    }
  }

  // 3. Retornar instancia de Product
  return new Product(
    productData.id,
    productData.name,
    productData.description,
    parseFloat(productData.price),
    productData.available,
    new Date(productData.created_at),
    safeParseInt(productData.quantity),
    uploadedImages[0] || null, // Primera imagen
    uploadedImages // Todas las imágenes
  );
}

// ----------------------------------------------------------------------
// CRUD: READ ALL
// ----------------------------------------------------------------------

/**
 * Obtiene todos los productos con su primera imagen.
 */
export async function getAllProducts() {
  const { data: productsData, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select(`*, ${IMAGES_TABLE}(image_url)`)
    .order("id", { ascending: true });

  if (error) throw new Error("Error al obtener productos: " + error.message);

  return productsData.map((p) => {
    const allImageUrls = p[IMAGES_TABLE].map((img) => img.image_url);
    const firstImage = allImageUrls.length > 0 ? allImageUrls[0] : null;

    return new Product(
      p.id,
      p.name,
      p.description,
      parseFloat(p.price),
      p.available,
      new Date(p.created_at),
      safeParseInt(p.quantity),
      firstImage
    );
  });
}

// ----------------------------------------------------------------------
// CRUD: READ BY ID
// ----------------------------------------------------------------------

/**
 * Obtiene un producto por ID incluyendo todas sus imágenes.
 */
export async function getProductById(id) {
  // 1. Obtener el producto y sus imágenes
  const { data: productData, error: productError } = await supabase
    .from(PRODUCTS_TABLE)
    .select(`*, ${IMAGES_TABLE}(image_url)`)
    .eq("id", id)
    .single();

  if (productError) {
    // Código PGRST116: No se encontraron filas (Producto no encontrado)
    if (productError.code === "PGRST116") {
      throw new Error("Producto no encontrado");
    }
    throw new Error(`DB Error: ${productError.message}`);
  }

  const allImageUrls = productData[IMAGES_TABLE].map((img) => img.image_url);

  // 2. Retornar instancia de Product
  return new Product(
    productData.id,
    productData.name,
    productData.description,
    parseFloat(productData.price),
    productData.available,
    new Date(productData.created_at),
    safeParseInt(productData.quantity),
    allImageUrls[0] || null, // Primera imagen
    allImageUrls // Todas las imágenes
  );
}

// ----------------------------------------------------------------------
// CRUD: UPDATE
// ----------------------------------------------------------------------

/**
 * Actualiza un producto por ID.
 */
export async function updateProduct(id, updates) {
  // Asegurar que 'quantity' es un entero válido antes de actualizar
  if (updates.quantity !== undefined) {
    updates.quantity = safeParseInt(updates.quantity);
    if (updates.quantity < 0) {
      throw new Error("La cantidad (stock) no puede ser negativa");
    }
  }

  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Error al actualizar producto: " + error.message);

  // Retornar instancia de Product
  return new Product(
    data.id,
    data.name,
    data.description,
    parseFloat(data.price),
    data.available,
    new Date(data.created_at),
    safeParseInt(data.quantity)
  );
}

// ----------------------------------------------------------------------
// CRUD: DELETE
// ----------------------------------------------------------------------

/**
 * Elimina un producto, sus referencias de imágenes y los archivos del bucket.
 */
export async function deleteProduct(id) {
  // 1. Obtener las URLs de las imágenes para el borrado físico
  const { data: imagesToDelete } = await supabase
    .from(IMAGES_TABLE)
    .select("image_url")
    .eq("product_id", id);

  // 2. Borrar las referencias de las imágenes de la tabla 'product_images'
  const { error: imgDbError } = await supabase
    .from(IMAGES_TABLE)
    .delete()
    .eq("product_id", id);

  if (imgDbError) {
    console.error("Error al borrar referencias de imágenes en DB:", imgDbError);
    // Continuar, ya que el producto principal es más importante
  }

  // 3. Borrar los archivos físicos del bucket (Storage)
  if (imagesToDelete && imagesToDelete.length > 0) {
    const paths = imagesToDelete.map((img) => {
      // Necesitamos el path relativo (ej: '1/uuid-nombre.jpg')
      const fullPath = new URL(img.image_url).pathname;
      return fullPath.substring(
        `/storage/v1/object/public/${BUCKET_NAME}/`.length
      );
    });

    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(paths);

    if (storageError) {
      console.warn(
        "ADVERTENCIA: Archivos huérfanos. Error al borrar del bucket:",
        storageError
      );
      // Advertir, pero no bloquear el borrado del producto principal
    }
  }

  // 4. Borrar el producto de la tabla principal
  const { error: productError } = await supabase
    .from(PRODUCTS_TABLE)
    .delete()
    .eq("id", id);

  if (productError)
    throw new Error("Error al borrar producto: " + productError.message);

  return { success: true };
}
