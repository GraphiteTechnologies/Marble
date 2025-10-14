// noinspection JSCheckFunctionSignatures,HttpUrlsUsage,JSIgnoredPromiseFromCall,NpmUsedModulesInstalled,JSUnresolvedReference

import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { hostname } from "node:os";
import { logging, server as wisp } from "@mercuryworkshop/wisp-js/server";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";

import { scramjetPath } from "@mercuryworkshop/scramjet/path";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import path from "node:path";
import fs from "node:fs";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = fileURLToPath(new URL("../public/", import.meta.url));

logging.set_level(logging.NONE);
Object.assign(wisp.options, {
    allow_udp_streams: false,
    hostname_blacklist: [/example\.com/],
    dns_servers: ["1.1.1.3", "1.0.0.3"]
});

const fastify = Fastify({
    serverFactory: (handler) => {
        return createServer()
            .on("request", (req, res) => {
                res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                handler(req, res);
            })
            .on("upgrade", (req, socket, head) => {
                if(req.url.endsWith("/wisp/"))
                    wisp.routeRequest(req, socket, head);
                else
                    socket.end();
            });
    },
});

fastify.get('/api/github/commits', async(req, res) => {
    try {
        const response = await axios.get('https://api.github.com/repos/GraphiteTechnologies/Marble/commits');
        res.send(response.data);
    } catch(error) {
        res.status(500).send('Error fetching commits from GitHub');
    }
});

fastify.get('/api/wallpapers', (_req, res) => {
    const wallpaperDir = path.join(__dirname, '..', 'public', 'wallpapers');
    fs.readdir(wallpaperDir, (err, files) => {
        if(err) {
            res.status(500).send('Unable to scan wallpapers directory');
            return;
        }
        res.send(files);
    });
});

fastify.register(fastifyStatic, {
    root: publicPath,
    decorateReply: true,
});

fastify.register(fastifyStatic, {
    root: scramjetPath,
    prefix: "/scram/",
    decorateReply: false,
});

fastify.register(fastifyStatic, {
    root: epoxyPath,
    prefix: "/epoxy/",
    decorateReply: false,
});

fastify.register(fastifyStatic, {
    root: baremuxPath,
    prefix: "/baremux/",
    decorateReply: false,
});

fastify.setNotFoundHandler((res, reply) => {
    return reply.code(404).type('text/html').sendFile('404.html');
})

fastify.server.on("listening", () => {
    const address = fastify.server.address();

    console.log("Listening on:");
    console.log(`	http://localhost:${address.port}`);
    console.log(`	http://${hostname()}:${address.port}`);
    console.log(
        `	http://${
            address.family === "IPv6" ? `[${address.address}]` : address.address
        }:${address.port}`
    );
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

function shutdown() {
    console.log("SIGTERM signal received: closing HTTP server");
    fastify.close();
    process.exit(0);
}

let port = parseInt(process.env.PORT || "");

if(isNaN(port))
    port = 4000;

fastify.listen({
    port: port,
    host: "0.0.0.0",
});