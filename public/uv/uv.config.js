self.__uv$config = {
    prefix: '/ambi/ence/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/uv/uv.handler.js',
    client: '/uv/uv.client.js',
    bundle: '/uv/uv.bundle.js',
    config: '/uv/uv.config.js',
    sw: '/uv/uv.sw.js',
};

(async () => {
    while (typeof __uv$eval === "undefined") await new Promise(r => setTimeout(r, 1)) 

    if (window.top === window) return;

    const currentHost = new URL(__uv$config.decodeUrl(location.pathname.replace(__uv$config.prefix, ""))).host // get the proxied host thingymabobber

    if (currentHost === "discord.com") {
        __uv$eval(`
            const cachedStorage = localStorage;
            const loadShit = async (url) => {
                try {
                    let el = document.createElement(url.split('.').pop() === 'js' ? 'script' : 'style');
                    el.textContent = await (await fetch(url)).text();
                    document.head.appendChild(el);
                } catch (error) {}
            };

            loadShit("https://raw.githubusercontent.com/Vencord/builds/refs/heads/main/browser.js");
            loadShit("https://raw.githubusercontent.com/Vencord/builds/refs/heads/main/browser.css");

            window.onload = () => {
                window.localStorage = cachedStorage;
                this.localStorage = cachedStorage;
                localStorage = cachedStorage;
            };
        `);
    }
})();