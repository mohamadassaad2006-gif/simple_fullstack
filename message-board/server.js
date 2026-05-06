// Simple message board backend
// Zero external dependencies - uses Node.js built-in modules only
// Requires Node 22.5+ for the built-in node:sqlite module

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'messages.db');
const PUBLIC_DIR = path.join(__dirname, 'public');

// --- Database setup ---
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

const insertMsg = db.prepare('INSERT INTO messages (text, created_at) VALUES (?, ?)');
const selectMsgs = db.prepare('SELECT id, text, created_at FROM messages ORDER BY created_at DESC LIMIT 100');

// --- Helpers ---
function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10000) reject(new Error('Body too large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, urlPath);

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// --- Server ---
const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  // GET /api/messages
  if (req.method === 'GET' && url === '/api/messages') {
    try {
      const messages = selectMsgs.all();
      return sendJson(res, 200, messages);
    } catch (e) {
      return sendJson(res, 500, { error: 'Database error' });
    }
  }

  // POST /api/messages
  if (req.method === 'POST' && url === '/api/messages') {
    try {
      const body = await readBody(req);
      const { text } = JSON.parse(body);

      if (!text || typeof text !== 'string') {
        return sendJson(res, 400, { error: 'Message text required' });
      }
      const trimmed = text.trim();
      if (trimmed.length === 0) {
        return sendJson(res, 400, { error: 'Message cannot be empty' });
      }
      if (trimmed.length > 500) {
        return sendJson(res, 400, { error: 'Message too long (max 500 chars)' });
      }

      const now = Date.now();
      const result = insertMsg.run(trimmed, now);
      return sendJson(res, 200, {
        id: Number(result.lastInsertRowid),
        text: trimmed,
        created_at: now
      });
    } catch (e) {
      return sendJson(res, 400, { error: 'Invalid request' });
    }
  }

  // Static files
  if (req.method === 'GET') return serveStatic(req, res);

  res.writeHead(405); res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Message board running on http://localhost:${PORT}`);
  console.log(`Database: ${DB_PATH}`);
});
