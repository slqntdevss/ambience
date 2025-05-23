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
const iframeContainer = document.querySelector(".iframe-container");
let currentURL = "";

let debounceTimeout;
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
		handleSearch();
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

// for some reason it wont work unless its a fucntion smh
async function handleSearch() {
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

	const url = search(addr.value, localStorage.getItem("currentSearchEngine"));

	let wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";
	if ((await connection.getTransport()) !== "/epoxy/index.mjs") {
		console.log("setting transport to epoxy");
		await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
	}

	currentURL = url;
	setTimeout(() => {
		iframe.src = __uv$config.prefix + __uv$config.encodeUrl(url);
		console.log(
			"blah blah blah heres the encoded url:",
			__uv$config.prefix + __uv$config.encodeUrl(url)
		);
	}, 500);

	window.scriptManager.handleInject(currentURL);

	urlInput.value = currentURL;
}

searchForm.addEventListener("submit", async (event) => {
	event.preventDefault();

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

	const url = search(addr.value, localStorage.getItem("currentSearchEngine"));

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
});

if (urlForm) {
	urlForm.addEventListener("submit", (event) => {
		event.preventDefault();
		console.log("URL form submit event triggered");
		handleSearch();
	});
} else {
	console.log("BAD BAD BAD VERY BAD");
}

if (closeBtn) {
	closeBtn.addEventListener("click", () => {
		iframeContainer.classList.remove("visible");
		setTimeout(() => {
			iframeContainer.style.display = "none";
			iframe.src = "about:blank";
		}, 300);
	});
}
