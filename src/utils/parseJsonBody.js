/**
 * Lee y parsea el cuerpo de una solicitud HTTP como JSON.
 * @param {http.IncomingMessage} req
 * @returns {Promise<object>}
 */
export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    // 1. Recoger los chunks de datos
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    // 2. Intentar parsear el JSON al finalizar
    req.on("end", () => {
      if (!body) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error("Formato JSON inválido"));
      }
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}
