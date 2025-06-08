const searchContainer = document.querySelector(".search-container");
const searchInput = document.querySelector("#addr");
const autocompleteResults = document.querySelector(".autocomplete-results");
const addr = document.getElementById("addr");
const searchForm = document.getElementById("searchForm");
const iframe = document.getElementById("browserFrame");
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
const urlForm = document.querySelector(".url-bar");
const urlInput = document.getElementById("urlInput");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const reloadBtn = document.getElementById("reloadBtn");
const closeBtn = document.getElementById("closeBtn");
const actionBtn = document.getElementById("actionsBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const actionMenu = document.querySelector(".action-menu");
const historyBtn = document.getElementById("historyBtn");
const extensionsBtn = document.getElementById("extensionsBtn");
const inspectBtn = document.getElementById("inspectBtn");
const iframeContainer = document.querySelector(".iframe-container");

let currentURL = "";

let debounceTimeout;

// give the user a uuid for sockets blehhhh >:333

if (!localStorage.getItem("uuid")) {
	localStorage.setItem("uuid", crypto.randomUUID());
}

searchInput.addEventListener("input", (e) => {
	clearTimeout(debounceTimeout);
	debounceTimeout = setTimeout(async () => {
		const query = e.target.value.trim();
		if (query.length > 0) {
			try {
				const response = await fetch(
					`/autoc?query=${encodeURIComponent(query)}`
				);
				if (!response.ok) throw new Error("Network response was not ok");
				const repsonse = await response.json();
				const suggestions = repsonse.map((item) => item.phrase).slice(0, 8);
				autocompleteResults.innerHTML = "";
				if (suggestions.length > 0) {
					suggestions.forEach((suggestion) => {
						const div = document.createElement("div");
						div.className = "autocomplete-item";
						div.textContent = suggestion;
						div.addEventListener("click", () => {
							searchInput.value = suggestion;
							autocompleteResults.classList.remove("show");
						});
						autocompleteResults.appendChild(div);
					});
					autocompleteResults.classList.add("show");
				} else {
					autocompleteResults.classList.remove("show");
				}
			} catch (error) {
				console.error("Error fetching suggestions:", error);
				return [];
			}
		} else {
			autocompleteResults.classList.remove("show");
		}
	}, 300);
});

async function proxy(e, value) {
	e.preventDefault();

	try {
		await registerSW();
	} catch (err) {
		console.error(
			"An error occurred while registering the service worker: ",
			err
		);
		throw err;
	}

	if (!localStorage.getItem("currentSearchEngine")) {
		localStorage.setItem("currentSearchEngine", "https://duckduckgo.com/?q=%s");
	}

	const url = search(value, localStorage.getItem("currentSearchEngine"));

	let wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";

	const transport =
		localStorage.getItem("currentTransport") || "/epoxy/index.mjs";

	if (!localStorage.getItem("currentTransport")) {
		localStorage.setItem("currentTransport", "/epoxy/index.mjs");
	}

	if ((await connection.getTransport()) !== transport) {
		console.log("setting transport to localstorage or epoxy");
		await connection.setTransport(transport, [{ wisp: wispUrl }]);
	}

	currentURL = url;
	setTimeout(() => {
		iframe.src = __uv$config.prefix + __uv$config.encodeUrl(url);
	}, 500);

	window.scriptManager.handleInject(currentURL);

	urlInput.value = currentURL;
}

document.addEventListener("click", (e) => {
	if (
		!searchInput.contains(e.target) &&
		!autocompleteResults.contains(e.target)
	) {
		autocompleteResults.classList.remove("show");
	}
});

document.getElementById("searchForm").addEventListener("submit", (e) => {
	e.preventDefault();
	iframeContainer.style.display = "block";
	iframeContainer.offsetHeight;
	iframeContainer.classList.add("visible");
});

urlInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		e.preventDefault();
		iframeContainer.style.display = "block";
		iframeContainer.offsetHeight;
		iframeContainer.classList.add("visible");
		proxy(e, urlInput.value);
	}
});

backBtn.addEventListener("click", () => {
	iframe.contentWindow.history.back();
});

forwardBtn.addEventListener("click", () => {
	iframe.contentWindow.history.forward();
});

reloadBtn.addEventListener("click", () => {
	iframe.contentWindow.location.reload();
});

fullscreenBtn.addEventListener("click", () => {
	iframe.requestFullscreen();
});
actionBtn.addEventListener("click", () => {
	actionMenu.classList.toggle("visible");
});
inspectBtn.addEventListener("click", () => {
	if (!iframe) return;

	const proccyWindow = iframe.contentWindow;
	const proccyDocument = iframe.contentDocument;

	if (!proccyWindow || !proccyDocument) return;

	if (proccyWindow.eruda?._isInit) {
		proccyWindow.eruda.destroy();
	} else {
		let script = proccyDocument.createElement("script");
		script.src = "https://cdn.jsdelivr.net/npm/eruda";
		script.onload = function () {
			if (!proccyWindow) return;
			proccyWindow.eruda.init();
			proccyWindow.eruda.show();
		};
		proccyDocument.head.appendChild(script);
	}
});

urlInput.addEventListener("input", (e) => {
	clearTimeout(debounceTimeout);
	debounceTimeout = setTimeout(async () => {
		const query = e.target.value.trim();
		if (query.length > 0) {
			try {
				const response = await fetch(
					`/autoc?query=${encodeURIComponent(query)}`
				);
				if (!response.ok) throw new Error("Network response was not ok");
				const suggestions = await response.json();
				console.log(suggestions);
				await suggestions.map((item) => item.phrase).slice(0, 8);
				autocompleteResults.innerHTML = "";
				if (suggestions.length > 0) {
					suggestions.forEach((suggestion) => {
						const div = document.createElement("div");
						div.className = "autocomplete-item";
						div.textContent = suggestion;
						div.addEventListener("click", () => {
							searchInput.value = suggestion;
							autocompleteResults.classList.remove("show");
						});
						autocompleteResults.appendChild(div);
					});
					autocompleteResults.classList.add("show");
				} else {
					autocompleteResults.classList.remove("show");
				}
			} catch (error) {
				console.error("Error fetching suggestions:", error);
				return [];
			}
		} else {
			autocompleteResults.classList.remove("show");
		}
	}, 300);
});

searchForm.addEventListener("submit", async (event) => {
	proxy(event, addr.value);
});

iframe.addEventListener("load", () => {
	urlInput.value = __uv$config.decodeUrl(
		iframe.contentWindow.location.href.split("/ence/")[1]
	);
	const history = null;
});

if (closeBtn) {
	closeBtn.addEventListener("click", () => {
		iframeContainer.classList.remove("visible");
		setTimeout(() => {
			iframeContainer.style.display = "none";
			iframe.src = "about:blank";
		}, 300);
	});
}
