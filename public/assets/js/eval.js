class ScriptManager {
    constructor() {
        this.scripts = {};
        this.popup = null;
        this.overlay = null;
        this.currentScript = null;
        this.url = null;
        this.initialized = false;
        this.popupTimeout = null;
        this.initializeDefaultScripts();
    }


    initializeDefaultScripts() {
        this.scripts = {
            'discord.com': {
                name: 'Vencord',
                description: 'Improves the Discord experience by adding plugins.',
                code: 'alert("Vencord coming soon!");'
            },
            'example.com': {
                name: 'Dark Mode',
                description: 'Enables dark mode on Example.com',
                code: `
                    document.body.style.background = "#121212";
                    document.body.style.color = "#e0e0e0";
                    
                    document.querySelectorAll('a').forEach(a => {
                        a.style.color = '#90caf9';
                    });
                    
                    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
                        h.style.color = '#f5f5f5';
                    });
                    
                    document.querySelectorAll('input, button, select, textarea').forEach(el => {
                        el.style.backgroundColor = '#2d2d2d';
                        el.style.color = '#e0e0e0';
                        el.style.borderColor = '#444';
                    });
                    
                    document.querySelectorAll('table, th, td').forEach(el => {
                        el.style.borderColor = '#444';
                    });
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
            if (domain === scriptDomain || domain.includes(scriptDomain)) {
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
        if (this.initialized) return;
        
        this.createPopupElements();
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.popup);
        this.setupEventListeners();
        this.initialized = true;
    }

    createPopupElements() {
        const existingOverlay = document.querySelector('.eval-popup-overlay');
        const existingPopup = document.querySelector('.eval-popup');
        
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        if (existingPopup) {
            existingPopup.remove();
        }
        
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
        
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newInjectBtn = injectBtn.cloneNode(true);
        
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        injectBtn.parentNode.replaceChild(newInjectBtn, injectBtn);
        
        newCancelBtn.addEventListener('click', () => this.hidePopup());
        
        newInjectBtn.addEventListener('click', () => {
            if (this.currentScript) {
                this.executeScript(this.currentScript);
            }
            this.hidePopup();
        });
        
        const newOverlay = this.overlay.cloneNode(true);
        this.overlay.parentNode?.replaceChild(newOverlay, this.overlay);
        this.overlay = newOverlay;
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
            
            if (this.popupTimeout) {
                clearTimeout(this.popupTimeout);
            }
            
            this.popupTimeout = setTimeout(() => {
                this.init();
                this.showPopup(scriptInfo, url);
            }, 2000);
        }
    }
}

const scriptManager = new ScriptManager();
window.scriptManager = scriptManager;
window.evalPopupManager = scriptManager;

document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('browserFrame');
    
    if (iframe) {
        iframe.addEventListener('load', () => {
            try {
                const url = __uv$config.decodeUrl(iframe.contentWindow.location.href.split('/ence/')[1]);
                scriptManager.checkAndInjectScript(url);
            } catch (e) {
                console.error("Error checking iframe URL:", e);
            }
        });
    }
});

setTimeout(() => {
    const iframe = document.getElementById('browserFrame');
    if (iframe) {
        try {
            const url = iframe.contentWindow.location.href;
            scriptManager.checkAndInjectScript(url);
        } catch (e) {
            console.error("Error on initial URL check:", e);
        }
    }
}, 1000);