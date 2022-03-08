#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app');
const debug = require('debug')('nadia:server');
const http = require('http');

/**
 * Get port and store in Express.
 */

const port = 3000;
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app)
  .listen(port, onListening);

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
