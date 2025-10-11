const express = require('express');
const axios = require('axios');
const cors = require('cors');
const {parse} = require('node-html-parser');

const app = express();
const PORT = 3001;

app.use(cors());

function resolveAndProxy(baseUrl, path) {
    const resolvedUrl = new URL(path, baseUrl).href;
    return `http://localhost:${PORT}/proxy?url=${encodeURIComponent(resolvedUrl)}`;
}

app.get('/proxy', async(req, res) => {
    const {url} = req.query;

    if(!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                'Referer': url,
            }
        });

        delete response.headers['x-frame-options'];
        delete response.headers['content-security-policy'];
        res.set(response.headers);

        const contentType = response.headers['content-type'];

        if(contentType && contentType.includes('text/html')) {
            const html = Buffer.from(response.data).toString('utf-8');
            const root = parse(html);

            root.querySelectorAll('a, link').forEach(el => {
                const href = el.getAttribute('href');
                if(href) el.setAttribute('href', resolveAndProxy(url, href));
            });
            root.querySelectorAll('script, img, iframe, source, embed').forEach(el => {
                const src = el.getAttribute('src');
                if(src) el.setAttribute('src', resolveAndProxy(url, src));
            });
            root.querySelectorAll('form').forEach(el => {
                const action = el.getAttribute('action');
                if(action) el.setAttribute('action', resolveAndProxy(url, action));
            });

            res.send(root.toString());
        } else {
            res.send(response.data);
        }

    } catch(error) {
        console.error('Error fetching the URL:', error.message);
        res.status(500).send('Failed to fetch the URL');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
