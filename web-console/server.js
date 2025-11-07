const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const clients = [];

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
  } 
  else if (req.url === '/logs') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    clients.push(res);

    res.write('data: ' + JSON.stringify({ 
      message: 'Connected to log stream', 
      type: 'success' 
    }) + '\n\n');

    req.on('close', () => {
      const index = clients.indexOf(res);
      if (index > -1) {
        clients.splice(index, 1);
      }
    });
  } 
  else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

function broadcastLog(message, type = 'info') {
  const data = JSON.stringify({ message, type, timestamp: new Date().toISOString() });
  clients.forEach(client => {
    client.write(`data: ${data}\n\n`);
  });
}

global.webConsoleBroadcast = broadcastLog;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Web running at http://0.0.0.0`);
});

module.exports = { broadcastLog };
