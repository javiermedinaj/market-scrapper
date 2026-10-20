import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const port = Number(process.env.PORT ?? 5173);

const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const server = createServer(async (req, res) => {
  const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const filePath = normalize(join(root, rel));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "content-type": types[extname(filePath)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

server.listen(port, () => {
  console.log(`Viewer: http://localhost:${port}`);
});
