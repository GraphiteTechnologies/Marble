import http from 'http';
import express from 'express';
import { createBareServer } from '@tomphttp/bare-server-node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer();
const bareServer = createBareServer('/bare/');

const uvPath = path.join(__dirname, '../node_modules/@titaniumnetwork-dev/ultraviolet/dist/');
app.use('/uv/', express.static(uvPath));

server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

const port = 4000;
server.listen(port, () => {
    console.log(`Ultraviolet backend running at http://localhost:${port}`);
});