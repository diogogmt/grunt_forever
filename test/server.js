var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end('Test server\n');
}).listen(9876, '127.0.0.1');