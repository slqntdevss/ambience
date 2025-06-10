const searchContainer = document.querySelector(".search-container");
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
const historyContainer = document.querySelector(".history-container");
const siteContainer = document.querySelector(".siteContainer");
const historyClose = document.getElementById("historyClose");

let currentURL = "";

let debounceTimeout;

const index = 0;

function fetchHistory(fullHistory) {
	const currentPage = fullHistory.slice(index, index + 8);
	siteContainer.innerHTML = "";

	for (const i in currentPage) {
		const currentSite = currentPage[i];
		console.log(currentSite);
		const site = document.createElement("div");
		site.classList.add("site");
		site.innerHTML = `
							<img
								src="https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${currentSite.url}/&size=128"
							/>
							<h4 class="siteTitle">${currentSite.title}</h4>`;

		siteContainer.appendChild(site);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const dbRequest = indexedDB.open("history", 5);
	dbRequest.onerror = (e) => {
		console.error("failed to load history: ", e.target.result);
	};
	dbRequest.onupgradeneeded = (e) => {
		if (!e.target.result.objectStoreNames.contains("sites")) {
			e.target.result.createObjectStore("sites", { keyPath: "time" });
		}
	};
	dbRequest.onsuccess = (e) => {
		const db = e.target.result;
		const transaction = db.transaction("sites", "readonly");

		const getRequest = transaction.objectStore("sites").getAll();
		getRequest.onsuccess = (event) => {
			const fullHistory = event.target.result.reverse();
			console.log(fullHistory);
			//fetchHistory(fullHistory);
		};
	};
});

if (!localStorage.getItem("uuid")) {
	localStorage.setItem("uuid", crypto.randomUUID());
}

addr.addEventListener("input", (e) => {
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
							addr.value = suggestion;
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

	const url = search(value, localStorage.getItem("currentSearchEngine"));

	let wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";

	const transport =
		localStorage.getItem("currentTransport") || "/epoxy/index.mjs";

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
	if (!addr.contains(e.target) && !autocompleteResults.contains(e.target)) {
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
historyBtn.addEventListener("click", () => {
	historyContainer.classList.toggle("visible");
});
historyClose.addEventListener("click", () => {
	historyContainer.classList.remove("visible");
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
							addr.value = suggestion;
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
	//if ((iframe.src = "about:blank")) return;
	const websiteUrl = __uv$config.decodeUrl(
		iframe.contentWindow.location.href.split("/ence/")[1]
	);

	console.log(websiteUrl);
	urlInput.value = websiteUrl;
	let history;
	const dbRequest = indexedDB.open("history", 5);
	dbRequest.onerror = (e) => {
		console.log("failed to open the history db");
		return;
	};
	dbRequest.onupgradeneeded = (e) => {
		if (!e.target.result.objectStoreNames.contains("sites")) {
			e.target.result.createObjectStore("sites", { keyPath: "time" });
		}
	};
	dbRequest.onsuccess = (e) => {
		history = e.target.result;
		const transaction = history.transaction("sites", "readwrite");
		const store = transaction.objectStore("sites");

		const site = {
			time: Date.now(),
			url: websiteUrl,
			favicon: `https://www.google.com/s2/favicons?domain=${websiteUrl}`,
			title: iframe.contentWindow.document.title,
		};
		console.log(site);
		store.put(site);
		const getRequest = store.getAll();
		getRequest.onsuccess = (event) => {
			const fullHistory = event.target.result.reverse();
			console.log(typeof fullHistory);
			//fetchHistory(fullHistory);
		};
	};
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
