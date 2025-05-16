const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
class AppLoader {
	constructor() {
		this.appsGrid = document.querySelector(".games-grid");
		this.iframeContainer = document.querySelector(".iframe-container");
		this.appFrame = document.getElementById("gameFrame");
		this.closeBtn = document.getElementById("closeBtn");
		this.fullscreenBtn = document.getElementById("fullscreenBtn");
		this.appTitle = document.querySelector(".game-title");
		this.searchInput = document.getElementById("gameSearch");

		this.allApps = [];
		this.currentCategory = "all";

		this.setupEventListeners();
	}

	setupEventListeners() {
		this.closeBtn.addEventListener("click", () => {
			this.iframeContainer.classList.remove("visible");
			setTimeout(() => {
				this.iframeContainer.style.display = "none";
				this.appFrame.src = "about:blank";
				this.appTitle.textContent = "";
			}, 300);
		});
		this.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());
	}

	createAppCard(app) {
		return `
            <div class="game-card" data-app-id="${app.id}">
                <img src="${app.image}" alt="${app.title}">
                <div class="game-info">
                    <h3>${app.title}</h3>
                </div>
            </div>
        `;
	}

	async loadApps() {
		try {
			const response = await fetch("/assets/json/apps.json");
			if (!response.ok) throw new Error("Failed to load apps  data");

			const data = await response.json();
			data.apps.sort((a,b) => a.id.localeCompare(b.id))
			this.allApps = data.apps;

			this.renderApps(this.allApps);
			this.addClickHandlers();
		} catch (error) {
			console.error("Error loading apps:", error);
			this.appsGrid.innerHTML = '<p class="error">Failed to load apps</p>';
		}
	}

	renderApps(apps) {
		this.appsGrid.innerHTML = "";

		apps.forEach((app) => {
			this.appsGrid.innerHTML += this.createAppCard(app);
		});

		this.addClickHandlers();
	}

	addClickHandlers() {
		const appCards = document.querySelectorAll(".game-card");
		appCards.forEach((card) => {
			card.addEventListener("click", () => {
				const appId = card.dataset.appId;
				console.log(card.dataset);
				this.launchApp(appId);
			});
		});
	}

	async launchApp(appId) {
		const appData = await this.findAppData(appId);
		if (!appData) {
			console.log("cant find ", appId);
		}

		this.appTitle.textContent = appData.title;

		let appUrl;

		try {
			if (typeof registerSW === "function") {
				try {
					await registerSW();
				} catch (err) {
					console.error(
						"An error occurred while registering the service worker:",
						err
					);
					throw err;
				}
			} else {
				console.error("registerSW function not found");
				throw new Error("Service worker registration function not available");
			}
			appUrl = __uv$config.prefix + __uv$config.encodeUrl(appData.url);

			let wispUrl =
				(location.protocol === "https:" ? "wss" : "ws") +
				"://" +
				location.host +
				"/wisp/";
			if (connection && typeof connection.getTransport === "function") {
				if ((await connection.getTransport()) !== "/epoxy/index.mjs") {
					console.log("setting transport to epoxy for app");
					await connection.setTransport("/epoxy/index.mjs", [
						{ wisp: wispUrl },
					]);
				}
			}
		} catch (error) {
			console.error("Error setting up proxy for app:", error);
			return;
		}

		this.appFrame.src = "about:blank";
		this.iframeContainer.style.display = "block";
		this.iframeContainer.offsetHeight;
		this.iframeContainer.classList.add("visible");

		setTimeout(() => {
			this.appFrame.src = appUrl;
			console.log("set iframe to ", appUrl);
		}, 100);

		this.appFrame.onload = () => {
			console.log(`App ${appData.title} loaded successfully`);
		};

		this.appFrame.onerror = () => {
			console.error(`Failed to load app ${appData.title}`);
			this.iframeContainer.classList.remove("visible");
			setTimeout(() => {
				this.iframeContainer.style.display = "none";
				this.gameFrame.src = "about:blank";
				this.gameTitle.textContent = "";
			}, 300);
		};
	}
	toggleFullscreen() {
		if (!document.fullscreenElement) {
			this.appFrame.requestFullscreen().catch((err) => {
				console.error(`Error attempting to enable fullscreen: ${err.message}`);
			});
		} else {
			document.exitFullscreen();
		}
	}

	async findAppData(appId) {
		return this.allApps.find((app) => app.id === appId);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const appLoader = new AppLoader();
	appLoader.loadApps();
});
