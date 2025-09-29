const API_URL = "http://localhost:3000/products";
const productListContainer = document.getElementById("product-list-container");
const loadingMessage = document.getElementById("loading-message");
const alertsContainer = document.getElementById("alerts-container");

function formatPrice(number) {
  if (typeof number !== "number") return number;
  return number.toLocaleString("es-PY");
}

// --- Funciones de Utilidad ---

/** Muestra una notificación temporal. (Adaptada a Dark Mode) */
function showNotification(message, type = "success") {
  const colors = {
    success: "bg-green-600", // Verde vibrante
    error: "bg-red-600",
    info: "bg-blue-600",
  };
  const alert = document.createElement("div");
  // Estilo de notificación M3: más redondeado y con sombra
  alert.className = `${colors[type]} text-white px-5 py-3 rounded-xl shadow-xl transition-opacity duration-500 opacity-0 min-w-[280px]`;
  alert.innerHTML = `<strong>${
    type.charAt(0).toUpperCase() + type.slice(1)
  }:</strong> ${message}`;
  alertsContainer.appendChild(alert);

  // Mostrar y luego ocultar
  setTimeout(() => (alert.style.opacity = 1), 10);
  setTimeout(() => {
    alert.style.opacity = 0;
    setTimeout(() => alert.remove(), 500);
  }, 5000);
}

async function loadProducts() {
  productListContainer.innerHTML = "";
  loadingMessage.style.display = "block";

  try {
    const response = await fetch(API_URL);
    if (!response.ok)
      throw new Error("Error al cargar los productos del servidor.");

    const products = await response.json();

    if (products.length === 0) {
      productListContainer.innerHTML =
        '<p class="col-span-full text-center text-gray-500 p-8">No hay productos en el inventario. ¡Crea uno!</p>';
      return;
    }

    products.forEach((product) => {
      productListContainer.appendChild(createProductCard(product));
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    productListContainer.innerHTML = `<p class="col-span-full text-center text-red-500 p-8">❌ Error al cargar productos: ${error.message}</p>`;
    showNotification(
      `Error de conexión: ${error.message}. Asegúrate de que el servidor esté corriendo.`,
      "error"
    );
  } finally {
    loadingMessage.style.display = "none";
  }
}

/** Crea la tarjeta HTML de un producto para el listado (Material 3 Dark Card). */
function createProductCard(product) {
  const card = document.createElement("div");
  // Estilo M3 Dark Card: Surface Container Low (bg-gray-800), mayor elevación con shadow-lg
  card.className =
    "bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-0.5";
  card.setAttribute("data-id", product.id);
  card.addEventListener("click", () => openDetailModal(product.id));

  const imageUrl =
    product.first_image_url ||
    "https://placehold.co/400x300/374151/FFFFFF?text=Sin+Imagen";

  // Estilo de badge más sutil (Tonalidades de M3 Dark)
  const statusClass = product.available
    ? "bg-emerald-800 text-emerald-200 font-medium" // Primary Tonalidad
    : "bg-red-800 text-red-200 font-medium";

  // Estilo para el stock (Adaptado a Dark Mode)
  const stockClass =
    product.quantity <= 5 && product.quantity > 0
      ? "text-amber-400 font-bold" // Poco stock (Amber/Naranja vibrante en oscuro)
      : product.quantity === 0
      ? "text-red-400 font-bold" // Sin stock
      : "text-gray-300"; // Stock normal

  card.innerHTML = `
          <div class="h-48 overflow-hidden rounded-t-2xl">
            <img src="${imageUrl}" alt="${
    product.name
  }" class="w-full h-full object-cover">
          </div>
          <div class="p-5 space-y-3">

            <div class="flex flex-col justify-between items-start">
              <h3 class="text-xl font-bold text-white line-clamp-1">${
                product.name
              }</h3>
              <span class="text-lg font-semibold text-emerald-400">Gs. ${formatPrice(
                product.price
              )}</span>
            </div>

            <p class="text-sm text-gray-400 line-clamp-2">${
              product.description || "Sin descripción."
            }</p>
            <div class="mt-3 flex justify-between items-center pt-2 border-t border-gray-700">
              <span class="text-xs px-3 py-1 rounded-full ${statusClass}">
                ${product.available ? "Disponible" : "No Disponible"}
              </span>
              <span class="text-sm ${stockClass}">
                Stock: ${product.quantity}
              </span>
            </div>
          </div>
        `;
  return card;
}

// --- Lógica de Modales y CRUD (Se mantiene la funcionalidad, solo se adapta el color de las notificaciones) ---

const createModal = document.getElementById("create-modal");
const openCreateModalBtn = document.getElementById("open-create-modal");
const closeCreateModalBtn = document.getElementById("close-create-modal");
const createForm = document.getElementById("create-product-form");
const createSubmitBtn = document.getElementById("create-submit-btn");

openCreateModalBtn.addEventListener(
  "click",
  () => (createModal.style.display = "flex")
);
closeCreateModalBtn.addEventListener(
  "click",
  () => (createModal.style.display = "none")
);

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  createSubmitBtn.disabled = true;
  createSubmitBtn.textContent = "Creando...";

  try {
    // 1. Crear FormData para enviar campos y archivos
    const formData = new FormData();
    formData.append("name", createForm.elements["create-name"].value);
    formData.append(
      "description",
      createForm.elements["create-description"].value
    );
    formData.append(
      "price",
      parseFloat(createForm.elements["create-price"].value)
    );
    formData.append(
      "quantity",
      parseInt(createForm.elements["create-quantity"].value, 10)
    );
    formData.append(
      "available",
      createForm.elements["create-available"].checked
    );

    const imageFiles = createForm.elements["create-images"].files;
    if (imageFiles.length > 5) {
      throw new Error("Solo se permiten hasta 5 imágenes por producto.");
    }
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append("images", imageFiles[i]);
    }

    // 2. Enviar la solicitud POST
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          `Error ${response.status}: No se pudo crear el producto.`
      );
    }

    // 3. Éxito
    showNotification(`Producto '${result.name}' creado con éxito.`, "success");
    createForm.reset();
    createModal.style.display = "none";
    loadProducts(); // Recargar la lista
  } catch (error) {
    console.error("Error al crear producto:", error);
    showNotification(`Error al crear: ${error.message}`, "error");
  } finally {
    createSubmitBtn.disabled = false;
    createSubmitBtn.textContent = "Crear Producto";
  }
});

const detailModal = document.getElementById("detail-modal");
const closeDetailModalBtn = document.getElementById("close-detail-modal");
const detailImagesContainer = document.getElementById(
  "detail-images-container"
);
const editForm = document.getElementById("edit-product-form");
const deleteBtn = document.getElementById("delete-product-btn");

closeDetailModalBtn.addEventListener(
  "click",
  () => (detailModal.style.display = "none")
);

/** Abre el modal y carga los datos de un producto específico. */
async function openDetailModal(id) {
  detailModal.style.display = "flex";
  document.getElementById("detail-title").textContent = "Cargando detalle...";

  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.status === 404) throw new Error("Producto no encontrado");
    if (!response.ok)
      throw new Error("Error al obtener detalles del producto.");

    const product = await response.json();

    // 1. Rellenar campos de edición
    document.getElementById("detail-title").textContent = product.name;
    document.getElementById("edit-product-id").value = product.id;
    document.getElementById("edit-name").value = product.name;
    document.getElementById("edit-description").value =
      product.description || "";
    document.getElementById("edit-price").value = product.price.toFixed(2);
    document.getElementById("edit-quantity").value = product.quantity || 0;
    document.getElementById("edit-available").checked =
      product.available || false;

    // 2. Mostrar imágenes
    detailImagesContainer.innerHTML = ""; // Limpiar
    if (product.all_image_urls && product.all_image_urls.length > 0) {
      product.all_image_urls.forEach((url) => {
        const imgWrapper = document.createElement("div");
        // Imágenes con más redondez
        imgWrapper.className = "h-32 w-full overflow-hidden rounded-xl";
        imgWrapper.innerHTML = `
                <img src="${url}" alt="Imagen del producto" class="w-full h-full object-cover shadow-sm">
              `;
        detailImagesContainer.appendChild(imgWrapper);
      });
    } else {
      detailImagesContainer.innerHTML =
        '<p class="text-gray-500 col-span-2 p-4 text-center">Este producto no tiene imágenes registradas.</p>';
    }
  } catch (error) {
    console.error("Error al cargar detalle:", error);
    showNotification(`Error: ${error.message}`, "error");
    detailModal.style.display = "none";
  }
}

// Manejar la actualización (CRUD: Update)
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("edit-product-id").value;
  const submitBtn = e.submitter;
  submitBtn.disabled = true;
  submitBtn.textContent = "Guardando...";

  try {
    // 1. Crear el objeto de actualización con los tipos correctos (números)
    const updates = {
      name: document.getElementById("edit-name").value,
      description: document.getElementById("edit-description").value,
      price: parseFloat(document.getElementById("edit-price").value),
      quantity: parseInt(document.getElementById("edit-quantity").value, 10), // ¡Aseguramos que sea un número!
      available: document.getElementById("edit-available").checked,
    };

    // 2. Enviar la solicitud PUT como JSON.
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates), // Enviar el objeto de JS convertido a JSON
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          `Error ${response.status}: No se pudo actualizar el producto.`
      );
    }

    showNotification(
      `Producto '${result.name}' actualizado con éxito.`,
      "success"
    );
    detailModal.style.display = "none";
    loadProducts(); // Recargar la lista
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    showNotification(`Error al actualizar: ${error.message}`, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "💾 Guardar Cambios";
  }
});

// Manejar la eliminación (CRUD: Delete)
deleteBtn.addEventListener("click", async () => {
  const id = document.getElementById("edit-product-id").value;
  const name = document.getElementById("edit-name").value;

  if (
    !confirm(
      `¿Estás seguro de que quieres eliminar el producto: '${name}' (ID: ${id})? Esta acción es irreversible.`
    )
  ) {
    return;
  }

  deleteBtn.disabled = true;
  deleteBtn.textContent = "Eliminando...";

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(
        result.error ||
          `Error ${response.status}: No se pudo eliminar el producto.`
      );
    }

    showNotification(`Producto '${name}' eliminado con éxito.`, "info");
    detailModal.style.display = "none";
    loadProducts(); // Recargar la lista
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    showNotification(`Error al eliminar: ${error.message}`, "error");
  } finally {
    deleteBtn.disabled = false;
    deleteBtn.textContent = "🗑️ Eliminar";
  }
});

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", loadProducts);
