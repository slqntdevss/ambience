class ScriptManager {
    constructor() {
        this.scripts = {};
        this.popup = null;
        this.overlay = null;
        this.currentScript = null;
        this.url = null;
        this.loadScripts();
        this.init();
    }

    loadScripts() {
        const savedScripts = localStorage.getItem('ambienceScripts');
        
        if (savedScripts) {
            try {
                this.scripts = JSON.parse(savedScripts);
            } catch (e) {
                this.initializeDefaultScripts();
            }
        } else {
            this.initializeDefaultScripts();
        }
    }

    initializeDefaultScripts() {
        this.scripts = {
            'discord.com': {
                name: 'Vencord',
                description: 'Improves the Discord experience by adding plugins.',
                code: 'alert("Vencord coming soon!");'
            },
            'github.com': {
                name: 'GitHub Enhancer',
                description: 'Adds useful features to GitHub like file icons and code folding.',
                code: `
                    const style = document.createElement('style');
                    style.textContent = \`
                        .repository-content { position: relative; }
                        .ambience-gh-tools { 
                            position: fixed;
                            top: 70px;
                            right: 20px;
                            background: #0d1117;
                            border: 1px solid #30363d;
                            border-radius: 6px;
                            padding: 10px;
                            z-index: 100;
                        }
                        .ambience-gh-tools button {
                            background: #238636;
                            color: white;
                            border: none;
                            padding: 5px 10px;
                            border-radius: 4px;
                            cursor: pointer;
                            margin: 5px;
                        }
                    \`;
                    document.head.appendChild(style);
                    
                    setTimeout(() => {
                        const toolbar = document.createElement('div');
                        toolbar.className = 'ambience-gh-tools';
                        toolbar.innerHTML = \`
                            <button id="ambience-copy-repo">Copy Repo URL</button>
                            <button id="ambience-star-repo">⭐ Star</button>
                        \`;
                        document.querySelector('.repository-content')?.appendChild(toolbar);
                        
                        document.getElementById('ambience-copy-repo')?.addEventListener('click', () => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Repository URL copied to clipboard!');
                        });
                    }, 1000);
                `
            },
        };
        
        this.saveScripts();
    }

    saveScripts() {
        try {
            localStorage.setItem('ambienceScripts', JSON.stringify(this.scripts));
        } catch (e) {
            console.error('Error saving scripts:', e);
        }
    }

    getScriptForUrl(url) {
        if (!url) return null;
        
        let domain = url.toLowerCase();
        domain = domain.replace(/^https?:\/\//, '');
        domain = domain.replace(/^www\./, '');
        domain = domain.split('/')[0];
        
        for (const [scriptDomain, scriptInfo] of Object.entries(this.scripts)) {
            if (domain.includes(scriptDomain)) {
                return {
                    ...scriptInfo,
                    domain: scriptDomain
                };
            }
        }
        
        return null;
    }

    addScript(domain, scriptInfo) {
        this.scripts[domain] = scriptInfo;
        this.saveScripts();
    }

    removeScript(domain) {
        if (this.scripts[domain]) {
            delete this.scripts[domain];
            this.saveScripts();
            return true;
        }
        return false;
    }

    init() {
        this.createPopupElements();
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.popup);
        this.setupEventListeners();
    }

    createPopupElements() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'eval-popup-overlay';
        
        this.popup = document.createElement('div');
        this.popup.className = 'eval-popup';
        const text = this.url ? this.url : "this site.";
        this.popup.innerHTML = `
            <div class="eval-popup-header">
                <div class="eval-popup-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-syringe"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg></div>
                <h3 class="eval-popup-title">Inject</h3>
            </div>
            <div class="eval-popup-content">
                <p class="eval-popup-description">
                    Ambience has found an addon for ${text}
                </p>
                <div class="eval-popup-script-info">
                    <strong>Script:</strong> <span id="script-name">Unknown</span>
                </div>
                <div class="eval-popup-script-description">
                    <strong>Description:</strong> <span id="script-description">No description provided</span>
                </div>
            </div>
            <div class="eval-popup-buttons">
                <button class="eval-popup-button cancel" id="eval-cancel">Cancel</button>
                <button class="eval-popup-button inject" id="eval-inject">Inject</button>
            </div>
        `;
    }

    setupEventListeners() {
        const cancelBtn = document.getElementById('eval-cancel');
        const injectBtn = document.getElementById('eval-inject');
        
        cancelBtn.addEventListener('click', () => this.hidePopup());
        
        injectBtn.addEventListener('click', () => {
            if (this.currentScript) {
                this.executeScript(this.currentScript);
            }
            this.hidePopup();
        });
        
        this.overlay.addEventListener('click', () => this.hidePopup());
    }

    showPopup(scriptInfo, url) {
        this.currentScript = scriptInfo.code;
        this.url = url;
        
        document.getElementById('script-name').textContent = scriptInfo.name || 'Unknown';
        document.getElementById('script-description').textContent = scriptInfo.description || 'No description provided';
        
        this.overlay.classList.add('visible');
        this.popup.classList.add('visible');
    }

    hidePopup() {
        this.overlay.classList.remove('visible');
        this.popup.classList.remove('visible');
        this.currentScript = null;
    }

    executeScript(code) {
        try {
            const iframe = document.getElementById('browserFrame');
            
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.eval(`
                    try {
                        eval(__uv$eval(${JSON.stringify(code)}));
                    } catch (e) {
                        console.error('Error in script execution:', e);
                    }
                `);
            } else {
                console.error('Iframe not found or not loaded');
            }
        } catch (error) {
            console.error('Error executing script:', error);
        }
    }

    checkAndInjectScript(url) {
        if (!url) return;
        
        const scriptInfo = this.getScriptForUrl(url);
        if (scriptInfo) {
            setTimeout(() => {
                this.showPopup(scriptInfo, url);
            }, 2000);
        }
    }
}

const scriptManager = new ScriptManager();
window.scriptManager = scriptManager;
window.evalPopupManager = scriptManager;