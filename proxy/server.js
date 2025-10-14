import http from 'node:http';
import express from 'express';
import wisp from "wisp-server-node";
import path from 'node:path';
import fs from 'node:fs';
import axios from 'axios';

import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const server = http.createServer();

app.get("/uv/uv.config.js", (req, res) => {
    res.sendFile(path.join(__dirname, 'uv', 'uv.config.js'));
})

app.get('/api/github/commits', async (req, res) => {
    try {
        const response = await axios.get('https://api.github.com/repos/GraphiteTechnologies/Marble/commits');
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error fetching commits from GitHub');
    }
});

app.get('/api/wallpapers', (req, res) => {
    const wallpaperDir = path.join(__dirname, '..', 'public', 'wallpapers');
    fs.readdir(wallpaperDir, (err, files) => {
        if(err) {
            res.status(500).send('Unable to scan wallpapers directory');
            return;
        }
        res.json(files);
    });
});

app.use('/uv/', express.static(uvPath));
app.use('/epoxy/', express.static(epoxyPath));
app.use('/baremux/', express.static(baremuxPath));

server.on('request', (req, res) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    app(req, res);
});

server.on('upgrade', (req, socket, head) => {
    if(req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
    else socket.end();
});

const port = 4000;
server.listen(port, () => {
    console.log(`Ultraviolet backend running at http://localhost:${port}`);
});