// noinspection JSCheckFunctionSignatures,JSUnresolvedReference

importScripts("/scramjet/scramjet.all.js");

const scramjet = new ScramjetServiceWorker();

async function handleRequest(event) {
    try {
        if(scramjet.handleRequest(event))
            return;

        event.respondWith(
            (async() => {
                await scramjet.config();
                if(await scramjet.route(event)) {
                    return await scramjet.fetch(event);
                } else {
                    return await fetch(event.request);
                }
            })()
        );
    } catch(exception) {
        event.respondWith(
            new Response(exception.toString(), {
                status: 500,
            })
        );
    }
}

self.addEventListener("fetch", handleRequest);