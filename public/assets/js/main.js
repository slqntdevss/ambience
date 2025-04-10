const searchContainer = document.querySelector('.search-container');
const searchInput = document.querySelector('#addr');
const autocompleteResults = document.querySelector('.autocomplete-results');
const addr = document.getElementById("addr");
const searchForm = document.getElementById("searchForm");
const iframe = document.getElementById("browserFrame");
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
const urlForm = document.querySelector('.url-bar');
const urlInput = document.getElementById('urlInput');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const reloadBtn = document.getElementById('reloadBtn');
const closeBtn = document.getElementById('closeBtn');
const iframeContainer = document.querySelector('.iframe-container');
let currentURL = "";

// Make urlInput available to iframe-manager.js
window.urlInput = urlInput;

async function getAutocompleteSuggestions(query) {
    try {
        const response = await fetch(`/autoc?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const suggestions = await response.json();
        return suggestions.map(item => item.phrase).slice(0, 8);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
}

function showAutocomplete(suggestions) {
    autocompleteResults.innerHTML = '';
    
    if (suggestions.length > 0) {
        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.textContent = suggestion;
            div.addEventListener('click', () => {
                searchInput.value = suggestion;
                hideAutocomplete();
            });
            autocompleteResults.appendChild(div);
        });
        autocompleteResults.classList.add('show');
    } else {
        hideAutocomplete();
    }
}

function hideAutocomplete() {
    autocompleteResults.classList.remove('show');
}

let debounceTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            const suggestions = await getAutocompleteSuggestions(query);
            showAutocomplete(suggestions);
        } else {
            hideAutocomplete();
        }
    }, 300);
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !autocompleteResults.contains(e.target)) {
        hideAutocomplete();
    }
});

document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showIframe();
});

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        showIframe();
        handleUrlFormSubmit();
    }
});

backBtn.addEventListener('click', () => {
    browserFrame.contentWindow.history.back();
});

forwardBtn.addEventListener('click', () => {
    browserFrame.contentWindow.history.forward();
});

reloadBtn.addEventListener('click', () => {
    browserFrame.contentWindow.location.reload();
});

urlInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
        const query = e.target.value.trim();
        if (query.length > 0) {
            const suggestions = await getAutocompleteSuggestions(query);
            showAutocomplete(suggestions);
        } else {
            hideAutocomplete();
        }
    }, 300);
});

function showIframe() {
    iframeContainer.style.display = 'block';
    iframeContainer.offsetHeight;
    iframeContainer.classList.add('visible');
}

function hideIframe() {
    iframeContainer.classList.remove('visible');
    setTimeout(() => {
        iframeContainer.style.display = 'none';
        iframe.src = 'about:blank';
    }, 300);
}

async function handleUrlFormSubmit() {
    console.log("URL form submitted");
    try {
        await registerSW();
    } catch (err) {
        console.error("An error occurred while registering the service worker: ", err);
        throw err;
    }

    const url = search(urlInput.value, "https://duckduckgo.com/?q=%s");

    let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
    if (await connection.getTransport() !== "/epoxy/index.mjs") {
        console.log("setting transport to epoxy");
        await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
    }
    
    currentURL = url;
    
    setTimeout(() => {
        iframe.src = __uv$config.prefix + __uv$config.encodeUrl(url);
    }, 500);
    
    window.scriptManager.checkAndInjectScript(currentURL);

    urlInput.value = currentURL;
}

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        await registerSW();
    } catch (err) {
        console.error("An error occurred while registering the service worker: ", err);
        throw err;
    }

    const url = search(addr.value, "https://duckduckgo.com/?q=%s");

    let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
    if (await connection.getTransport() !== "/epoxy/index.mjs") {
        console.log("setting transport to epoxy");
        await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
    }
    
    currentURL = url;
    
    setTimeout(() => {
        iframe.src = __uv$config.prefix + __uv$config.encodeUrl(url);
    }, 500);
    
    window.scriptManager.checkAndInjectScript(currentURL);
    
    urlInput.value = currentURL;
});

if (urlForm) {
    urlForm.addEventListener("submit", (event) => {
        event.preventDefault();
        console.log("URL form submit event triggered");
        handleUrlFormSubmit();
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', hideIframe);
}