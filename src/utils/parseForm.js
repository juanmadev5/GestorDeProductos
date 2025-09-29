import Busboy from "busboy";

export function parseForm(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers });
    const fields = {};
    const files = [];

    bb.on("field", (name, value) => {
      fields[name] = value;
    });

    bb.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const chunks = [];
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("end", () => {
        files.push({
          buffer: Buffer.concat(chunks),
          originalname: String(filename),
          mimetype,
        });
      });
    });

    bb.on("finish", () => resolve({ fields, files }));
    bb.on("error", (err) => reject(err));

    req.pipe(bb);
  });
}
