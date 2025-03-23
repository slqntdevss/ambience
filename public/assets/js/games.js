const connection = new BareMux.BareMuxConnection("/baremux/worker.js")
class GamesLoader {
    constructor() {
        this.gamesGrid = document.querySelector('.games-grid');
        this.iframeContainer = document.querySelector('.iframe-container');
        this.gameFrame = document.getElementById('gameFrame');
        this.closeBtn = document.getElementById('closeBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.gameTitle = document.querySelector('.game-title');
        this.searchInput = document.getElementById('gameSearch');
        this.categoryBtns = document.querySelectorAll('.category-btn');
        this.noResults = document.querySelector('.no-results');
        
        this.allGames = [];
        this.currentCategory = 'all';
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.closeBtn.addEventListener('click', () => this.hideGame());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        this.searchInput.addEventListener('input', () => {
            this.filterGames();
        });
        
        this.categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.filterGames();
            });
        });
    }

    createGameCard(game) {
        return `
            <div class="game-card" data-game-id="${game.id}" data-game-type="${game.type}" data-categories="${game.categories.join(',')}">
                <img src="${game.image}" alt="${game.title}">
                <div class="game-info">
                    <h3>${game.title}</h3>
                    <p>${game.description}</p>
                </div>
            </div>
        `;
    }

    async loadGames() {
        try {
            const response = await fetch('/assets/json/games.json');
            if (!response.ok) throw new Error('Failed to load games data');
            
            const data = await response.json();
            this.allGames = data.games;
            
            this.renderGames(this.allGames);
            this.addClickHandlers();

        } catch (error) {
            console.error('Error loading games:', error);
            this.gamesGrid.innerHTML = '<p class="error">Failed to load games</p>';
        }
    }
    
    renderGames(games) {
        this.gamesGrid.innerHTML = '';
        
        if (games.length === 0) {
            this.noResults.style.display = 'block';
            return;
        }
        
        this.noResults.style.display = 'none';
        
        games.forEach(game => {
            this.gamesGrid.innerHTML += this.createGameCard(game);
        });
        
        this.addClickHandlers();
    }
    
    filterGames() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        let filteredGames = this.allGames;
        
        if (searchTerm) {
            filteredGames = filteredGames.filter(game => 
                game.title.toLowerCase().includes(searchTerm) || 
                game.description.toLowerCase().includes(searchTerm)
            );
        }
        
        if (this.currentCategory !== 'all') {
            filteredGames = filteredGames.filter(game => 
                game.categories && game.categories.includes(this.currentCategory)
            );
        }
        
        this.renderGames(filteredGames);
    }

    addClickHandlers() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.addEventListener('click', () => {
                const gameId = card.dataset.gameId;
                const gameType = card.dataset.gameType;
                this.launchGame(gameId, gameType);
            });
        });
    }

    async launchGame(gameId, gameType) {
        const gameData = await this.findGameData(gameId);
        if (!gameData) return;

        this.gameTitle.textContent = gameData.title;

        let gameUrl;
        if (gameType === 'cdn') {
            gameUrl = gameData.url;
        } else if (gameType === 'local') {
            gameUrl = gameData.path;
        } else if (gameType === 'proxied') {
            try {
                await this.registerServiceWorker();
                gameUrl = __uv$config.prefix + __uv$config.encodeUrl(gameData.url);
                
                let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
                if (connection && typeof connection.getTransport === 'function') {
                    if (await connection.getTransport() !== "/epoxy/index.mjs") {
                        console.log("setting transport to epoxy for game");
                        await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
                    }
                }
            } catch (error) {
                console.error('Error setting up proxy for game:', error);
                return;
            }
        } else {
            console.error('Unknown game type:', gameType);
            return;
        }

        this.gameFrame.src = 'about:blank';
        this.showGame();
        
        setTimeout(() => {
            this.gameFrame.src = gameUrl;
        }, 100);

        this.gameFrame.onload = () => {
            console.log(`Game ${gameData.title} loaded successfully`);
        };

        this.gameFrame.onerror = () => {
            console.error(`Failed to load game ${gameData.title}`);
            this.hideGame();
        };
    }

    async registerServiceWorker() {
        if (typeof registerSW === 'function') {
            try {
                await registerSW();
                return true;
            } catch (err) {
                console.error("An error occurred while registering the service worker:", err);
                throw err;
            }
        } else {
            console.error("registerSW function not found");
            throw new Error("Service worker registration function not available");
        }
    }

    showGame() {
        this.iframeContainer.style.display = 'block';
        this.iframeContainer.offsetHeight;
        this.iframeContainer.classList.add('visible');
    }

    hideGame() {
        this.iframeContainer.classList.remove('visible');
        setTimeout(() => {
            this.iframeContainer.style.display = 'none';
            this.gameFrame.src = 'about:blank';
            this.gameTitle.textContent = '';
        }, 300);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.gameFrame.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    async findGameData(gameId) {
        return this.allGames.find(game => game.id === gameId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gamesLoader = new GamesLoader();
    gamesLoader.loadGames();
});