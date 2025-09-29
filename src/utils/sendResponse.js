/**
 * Función para enviar una respuesta JSON al cliente.
 * @param {http.ServerResponse} res
 * @param {number} statusCode
 * @param {object} body
 */
export const sendResponse = (res, statusCode, body) => {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};
