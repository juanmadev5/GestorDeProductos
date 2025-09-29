// product.js (MODIFICADO)
class Product {
  constructor(
    id,
    name,
    description = "",
    price = 0,
    available = true,
    createdAt = new Date(),
    // 👇 NUEVO CAMPO DE STOCK
    quantity = 0,
    firstImageUrl = null,
    allImageUrls = []
  ) {
    if (!name || typeof name !== "string") {
      throw new Error(
        "El nombre del producto es obligatorio y debe ser un texto"
      );
    }
    if (price < 0) {
      throw new Error("El precio no puede ser negativo");
    }
    // 👇 NUEVA VALIDACIÓN PARA QUANTITY
    if (quantity < 0) {
      throw new Error("La cantidad (stock) no puede ser negativa");
    }

    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.available = available;
    this.createdAt = createdAt;
    this.quantity = quantity; // 👈 ALMACENAR
    this.first_image_url = firstImageUrl;
    this.all_image_urls = allImageUrls;
  }

  update({ name, description, price, available, quantity }) {
    // 👈 ACEPTAR QUANTITY
    if (name) this.name = name;
    if (description) this.description = description;

    if (price !== undefined) {
      if (price < 0) throw new Error("El precio no puede ser negativo");
      this.price = price;
    }
    // 👇 ACTUALIZAR QUANTITY
    if (quantity !== undefined) {
      if (quantity < 0)
        throw new Error("La cantidad (stock) no puede ser negativa");
      this.quantity = quantity;
    }

    if (available !== undefined) this.available = available;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      // 👇 EXPORTAR QUANTITY
      quantity: this.quantity,
      available: this.available,
      createdAt: this.createdAt,
      first_image_url: this.first_image_url,
      all_image_urls: this.all_image_urls,
    };
  }
}

export default Product;
