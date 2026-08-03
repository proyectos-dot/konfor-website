/* Servidor estático mínimo para preview local. Sin dependencias.
   Uso: npm run dev -- --port 7100 --host 127.0.0.1
   La raíz "/" redirige a "/_v4/" (el concepto nuevo); el sitio
   oficial sigue intacto en /index.html. */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
let port = 7100;
let host = "127.0.0.1";
for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--port" || args[i] === "-p") && args[i + 1]) port = Number(args[i + 1]);
  if (args[i] === "--host" && args[i + 1]) host = args[i + 1];
  if (args[i].startsWith("--port=")) port = Number(args[i].split("=")[1]);
  if (args[i].startsWith("--host=")) host = args[i].split("=")[1];
}

const raiz = __dirname;
const tipos = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8"
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") {
    res.writeHead(302, { Location: "/_v4/" });
    res.end();
    return;
  }
  let archivo = path.normalize(path.join(raiz, urlPath));
  if (!archivo.startsWith(raiz)) { res.writeHead(403); res.end(); return; }
  if (archivo.endsWith(path.sep)) archivo = path.join(archivo, "index.html");
  fs.stat(archivo, (err, st) => {
    if (err || !st.isFile()) {
      if (!path.extname(archivo)) {
        const conIndex = path.join(archivo, "index.html");
        if (fs.existsSync(conIndex)) {
          res.writeHead(200, { "Content-Type": tipos[".html"] });
          fs.createReadStream(conIndex).pipe(res);
          return;
        }
      }
      res.writeHead(404, { "Content-Type": tipos[".txt"] });
      res.end("404 — no encontrado");
      return;
    }
    res.writeHead(200, {
      "Content-Type": tipos[path.extname(archivo).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    fs.createReadStream(archivo).pipe(res);
  });
}).listen(port, host, () => {
  console.log(`KONFOR preview → http://${host}:${port}/ (concepto V4 en /_v4/)`);
});
