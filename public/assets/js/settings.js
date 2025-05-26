const activeUsersText = document.querySelector(".activeUsers");

function createNotification(message) {
	const notifContainer = document.getElementById("notifContainer");
	const notif = document.createElement("div");
	// this can be solved way easier but im too lazy to split up the html into dom elements
	const notifId = Math.floor(Math.random() * 999999);
	notif.classList = "notification-popup";
	notif.innerHTML = `
		<div class="notification-header">
            <h3 class="notification-title">Notification</h3>
            <button class="notification-close" id="closeNotification-${notifId}">×</button>
        </div>
        <p class="notification-message">${message}</p>
	`;

	notifContainer.appendChild(notif);
	setTimeout(() => {
		notif.classList.add("visible");
	}, 10);
	document
		.getElementById(`closeNotification-${notifId}`)
		.addEventListener("click", () => {
			notif.classList.remove("visible");
			setTimeout(() => {
				notif.remove();
			}, 400);
		});
}

document.addEventListener("DOMContentLoaded", () => {
	const themeOptions = document.querySelectorAll(".theme-option");
	//const injectionsList = document.querySelector(".injections-list");
	//const addScriptBtn = document.getElementById("add-script-btn");
	const transportChanger = document.getElementById("transport");
	const searchEngineChanger = document.getElementById("searchEngine");
	const toggleBtn = document.querySelector(".toggle-btn");
	const sidebar = document.querySelector(".sidebar");
	const mainContent = document.querySelector(".main-content");
	const injectToggle = document.getElementById("inject");
	const fontUpload = document.getElementById("fontUpload");
	const resetFont = document.querySelector(".resetFontData");

	if (toggleBtn) {
		toggleBtn.addEventListener("click", () => {
			sidebar.classList.toggle("hidden");
			activeUsersText.classList.toggle("hidden");
			toggleBtn.classList.toggle("expanded");
			mainContent.classList.toggle("expanded");
		});
	}

	const currentTheme = localStorage.getItem("ambienceTheme") || "amethyst";
	document.body.setAttribute("data-theme", currentTheme);

	themeOptions.forEach((option) => {
		if (option.dataset.theme === currentTheme) {
			option.classList.add("active");
		} else {
			option.classList.remove("active");
		}
	});

	if (resetFont) {
		resetFont.addEventListener("click", (e) => {
			localStorage.setItem("fontb64", null);
			window.location.reload();
		});
	}
	themeOptions.forEach((option) => {
		option.addEventListener("click", () => {
			const theme = option.dataset.theme;
			localStorage.setItem("ambienceTheme", theme);
			document.body.setAttribute("data-theme", theme);

			themeOptions.forEach((opt) => opt.classList.remove("active"));
			option.classList.add("active");
		});
	});
	if (localStorage.getItem("fontb64") != "null") {
		const style = document.createElement("style");
		style.innerHTML = `
      						@font-face {
        						font-family: 'customFont';
        						src: url('${localStorage.getItem("fontb64")}');
      						}
      						body, * {
        						font-family: 'customFont', sans-serif !important;
     						}
    					`;
		document.head.appendChild(style);
	}
	if (fontUpload) {
		fontUpload.addEventListener("change", (e) => {
			if (e.target.files.length > 0) {
				const file = e.target.files[0];
				const reader = new FileReader();
				reader.onload = function () {
					const fontUrl = URL.createObjectURL(
						new Blob([reader.result], { type: file.type })
					);

					const b64reader = new FileReader();

					b64reader.onload = function () {
						localStorage.setItem("fontb64", b64reader.result);
						const style = document.createElement("style");
						style.innerHTML = `
      						@font-face {
        						font-family: 'customFont';
        						src: url('${b64reader.result}');
      						}
      						body, * {
        						font-family: 'customFont', sans-serif !important;
     						}
    					`;
						document.head.appendChild(style);
					};
					b64reader.readAsDataURL(file);
				};

				reader.readAsArrayBuffer(file);
			}
		});
	}
	if (searchEngineChanger) {
		if (localStorage.getItem("currentSearchEngine") === null) {
			localStorage.setItem(
				"currentSearchEngine",
				"https://duckduckgo.com/?q=%s"
			);
		}
		if (localStorage.getItem("currentSearchEngine").includes("duckduckgo")) {
			searchEngineChanger.value = "duckduckgo";
		} else if (localStorage.getItem("currentSearchEngine").includes("google")) {
			searchEngineChanger.value = "google";
		} else if (localStorage.getItem("currentSearchEngine").includes("brave")) {
			searchEngineChanger.value = "brave";
		} else if (localStorage.getItem("currentSearchEngine").includes("bing")) {
			searchEngineChanger.value = "bing";
		}
		searchEngineChanger.addEventListener("change", () => {
			const searchEngine = searchEngineChanger.value;
			console.log(searchEngine);
			if (searchEngine == "duckduckgo") {
				localStorage.setItem(
					"currentSearchEngine",
					"https://duckduckgo.com/?q=%s"
				);
			} else if (searchEngine == "google") {
				localStorage.setItem(
					"currentSearchEngine",
					"https://google.com/search?q=%s"
				);
			} else if (searchEngine == "brave") {
				localStorage.setItem(
					"currentSearchEngine",
					"https://search.brave.com/search?q=%s"
				);
			} else if (searchEngine == "bing") {
				localStorage.setItem(
					"currentSearchEngine",
					"https://bing.com/search?q=%s"
				);
			} else {
				console.log("invalid search engine");
				localStorage.setItem(
					"currentSearchEngine",
					"https://duckduckgo.com/?q=%s"
				);
			}

			createNotification(`Search engine changed to ${searchEngine}!`);
		});
	}
	if (transportChanger) {
		if (localStorage.getItem("currentTransport") === null) {
			return;
		}
		if (localStorage.getItem("currentTransport").includes("epoxy")) {
			transportChanger.value = "epoxy";
		} else if (localStorage.getItem("currentTransport").includes("libcurl")) {
			transportChanger.value = "libcurl";
		}
		transportChanger.addEventListener("change", () => {
			const transport = transportChanger.value;
			console.log(transport);
			if (transport == "epoxy") {
				localStorage.setItem("currentTransport", "/epoxy/index.mjs");
			} else if (transport == "libcurl") {
				localStorage.setItem("currentTransport", "/libcurl/index.mjs");
			} else {
				console.log("invalid transport");
				localStorage.setItem("currentTransport", "/epoxy/index.mjs");
			}

			createNotification(`Transport changed to ${transport}!`);
		});
	}
	if (injectToggle) {
		if (localStorage.getItem("shouldInject") === null) {
			localStorage.setItem("shouldInject", true);
		}

		if (localStorage.getItem("shouldInject") == "true") {
			injectToggle.checked = true;
		} else {
			injectToggle.checked = false;
		}

		injectToggle.addEventListener("change", () => {
			console.log(injectToggle.checked);
			localStorage.setItem("shouldInject", injectToggle.checked.toString());
		});
	}
	/*function loadInjections() {
		injectionsList.innerHTML = "";
		const scripts = window.scriptManager.scripts;

		if (Object.keys(scripts).length === 0) {
			injectionsList.innerHTML = "<p>No injections added yet.</p>";
			return;
		}

		for (const [domain, script] of Object.entries(scripts)) {
			const injectionItem = document.createElement("div");
			injectionItem.className = "injection-item";
			injectionItem.innerHTML = `
                <h3>${script.name}</h3>
                <div class="injection-domain">${domain}</div>
                <div class="injection-description">${script.description}</div>
                <div class="injection-actions">
                    <button class="edit-injection" data-domain="${domain}">Edit</button>
                    <button class="delete-injection" data-domain="${domain}">Delete</button>
                </div>
            `;
			injectionsList.appendChild(injectionItem);
		}

		document.querySelectorAll(".delete-injection").forEach((btn) => {
			btn.addEventListener("click", () => {
				const domain = btn.dataset.domain;
				if (
					confirm(
						`Are you sure you want to delete the injection for ${domain}?`
					)
				) {
					window.scriptManager.removeScript(domain);
					loadInjections();
				}
			});
		});

		document.querySelectorAll(".edit-injection").forEach((btn) => {
			btn.addEventListener("click", () => {
				const domain = btn.dataset.domain;
				const script = window.scriptManager.scripts[domain];

				document.getElementById("domain").value = domain;
				document.getElementById("name").value = script.name;
				document.getElementById("description").value = script.description;
				document.getElementById("code").value = script.code;

				addScriptBtn.textContent = "Update Script";
				addScriptBtn.dataset.editing = domain;
			});
		});
	}*/
});
//socket io stuffs
const uuid = localStorage.getItem("uuid");
const socket = io({
	query: { uuid },
});

socket.emit("connection");

socket.on("notificationReturn", (message) => {
	createNotification(message);
});
socket.on("version", (hash) => {
	const versionText = document.querySelector(".version-number");
	if (versionText) {
		versionText.innerHTML = hash;
	}
});

socket.on("users", (count) => {
	if (count == 1) {
		activeUsersText.innerHTML = `${count} user using Ambience`;
	} else {
		activeUsersText.innerHTML = `${count} users using Ambience`;
	}
});
