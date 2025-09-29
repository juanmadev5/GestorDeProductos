/**
 * Convierte un valor a un número entero de forma segura, usando 0 como fallback.
 * @param {any} value
 * @returns {number}
 */
export const safeParseInt = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  // Usamos parseInt con base 10
  return parseInt(value, 10) || 0;
};
