import { createServer } from "node:http";
import { join } from "node:path";
import { hostname } from "node:os";
import wisp from "wisp-server-node";
import Fastify from "fastify";
import fastifyStatic from '@fastify/static'
import { fileURLToPath } from "url";
import { Server } from "socket.io"
import { Groq } from 'groq-sdk';
import { readFile } from 'node:fs/promises';
import 'dotenv/config'
import sanitizeHtml from 'sanitize-html';

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicPath = join(__dirname, "../public");
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";
import { epoxyPath } from "@mercuryworkshop/epoxy-transport"; 
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport"

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY
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
				if (req.url.endsWith("/wisp/")) wisp.routeRequest(req, socket, head);
				else socket.end();
			});
	},
});

const io = new Server(fastify.server)

io.on("connection", (socket) => {
	console.log(`new connection on ${socket.handshake.time} with ID ${socket.id}`)

	socket.on("notification", (token, message) => {
		console.log("bl;ahhh ", message)
		//stop people from spamming the notif :33333
		if(token == process.env.NOTIFICATION_SECRET_KEY) {
			console.log("jnhlksj")
			io.emit("notificationReturn", sanitizeHtml(message, {
				allowedTags: [],
				allowedAttributes: {}
			}))
		}
	})
})


fastify.register(fastifyStatic, {
	root: publicPath,
	decorateReply: true,
});

fastify.get("/uv/uv.config.js", (req, res) => {
	return res.sendFile("uv/uv.config.js", publicPath);
});

fastify.get('/store/apps', async function (req, res) {
	const storeJson = await readFile(join(__dirname,'/store.json'), 'utf-8')
	res.type('application/json').send(storeJson)
})

fastify.register(fastifyStatic, {
	root: uvPath,
	prefix: "/uv/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: epoxyPath,
	prefix: "/epoxy/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: epoxyPath,
	prefix: "/libcurl/",
	decorateReply: false,
});

fastify.register(fastifyStatic, {
	root: baremuxPath,
	prefix: "/baremux/",
	decorateReply: false,
});

fastify.get('/autoc', async function (req, res) {
	const { query } = req.query;
    if (!query) {
        return res.status(400).send({ error: 'Query parameter is required' });
    }
    const result = await fetch(`https://duckduckgo.com/ac/?q=${query}&format=json`)
    .then((response) => response.json());
    res.status(200).send(result);
})

fastify.post('/ai', async function (req, res) {

	console.log(req.body)

	const prompt = req.body?.prompt;
	console.log(prompt)

	if (!prompt) {
		return res.status(400).send({ error: 'missing prompt' })
	}
	
	res.raw.removeHeader('Content-Encoding');
  	res.raw.setHeader('Content-Type', 'text/plain; charset=utf-8');
 	res.raw.setHeader('Transfer-Encoding', 'chunked');

	 console.log("starting ai thingy for prompt:", prompt)
	const completion = await groq.chat.completions.create({
		"messages": [
			{ role: 'system', content: 'Try to avoid using markdown tags, like **** and just keep everything in plaintext.' }, //ill add markdown support later im just lazy af
			{ role: 'user', content: prompt }
		],
		"model": "llama3-70b-8192",
    	"temperature": 1,
    	"max_completion_tokens": 1024,
    	"top_p": 1,
    	"stream": true,
    	"stop": null
	})

	for await (const chunk of completion) {
		const data = chunk.choices?.[0]?.delta?.content || '';
		console.log(data)
		res.raw.write(data)
	}
	res.raw.end();
})

fastify.server.on("listening", () => {
	const address = fastify.server.address();

	console.log("Listening on:");
	console.log(`\thttp://localhost:${address.port}`);
	console.log(`\thttp://${hostname()}:${address.port}`);
	console.log(
		`\thttp://${
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

if (isNaN(port)) port = 8080;

fastify.listen({
	port: port,
	host: "0.0.0.0",
});
