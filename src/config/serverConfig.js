import dotenv from "dotenv";
dotenv.config();

export const supabaseUrl = process.env.PROJECT_URL;
export const supabaseKey = process.env.SUPABASE_KEY;
export const BUCKET_NAME = "product-images";
export const PRODUCTS_TABLE = "products";
export const IMAGES_TABLE = "product_images";
export const PORT = 3000;
export const PRODUCTS_ROUTE = "products";