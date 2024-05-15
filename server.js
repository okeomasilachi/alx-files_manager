/**
 * This is the main server file for the ALX Files Manager application.
 * It sets up an Express server, defines routes, and starts the server.
 */

const express = require('express');

const app = express();
const routes = require('./routes');

const port = parseInt(process.env.PORT, Number) || 5000;

app.use(express.json({ limit: '50mb' }));
app.use('/', routes);

/**
 * Starts the server and listens on the specified port.
 * @param {number} port - The port number to listen on.
 */
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
