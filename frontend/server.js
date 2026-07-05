const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = Number(process.env.FRONTEND_PORT || 3000);
const publicDir = path.join(__dirname, 'public');
const assetsDir = path.join(__dirname, 'assets');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function resolveFilePath(requestUrl) {
  const url = new URL(requestUrl, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/') {
    return path.join(publicDir, 'index.html');
  }

  if (pathname.startsWith('/assets/')) {
    const filePath = path.join(assetsDir, pathname.replace('/assets/', ''));
    return filePath.startsWith(assetsDir) ? filePath : null;
  }

  const filePath = path.join(publicDir, pathname);
  return filePath.startsWith(publicDir) ? filePath : null;
}

const server = http.createServer((req, res) => {
  const filePath = resolveFilePath(req.url);

  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const extension = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': mimeTypes[extension] || 'application/octet-stream'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Frontend static server running at http://localhost:${PORT}`);
});
