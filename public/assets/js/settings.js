document.addEventListener('DOMContentLoaded', () => {
    const themeOptions = document.querySelectorAll('.theme-option');
    const injectionsList = document.querySelector('.injections-list');
    const addScriptBtn = document.getElementById('add-script-btn');
    
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        toggleBtn.classList.toggle('expanded');
        mainContent.classList.toggle('expanded');
    });
    
    function loadCurrentTheme() {
        const currentTheme = localStorage.getItem('ambienceTheme') || 'amethyst';
        document.body.setAttribute('data-theme', currentTheme);
        
        themeOptions.forEach(option => {
            if (option.dataset.theme === currentTheme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }
    
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            localStorage.setItem('ambienceTheme', theme);
            document.body.setAttribute('data-theme', theme);
            
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    function loadInjections() {
        injectionsList.innerHTML = '';
        const scripts = window.scriptManager.scripts;
        
        if (Object.keys(scripts).length === 0) {
            injectionsList.innerHTML = '<p>No injections added yet.</p>';
            return;
        }
        
        for (const [domain, script] of Object.entries(scripts)) {
            const injectionItem = document.createElement('div');
            injectionItem.className = 'injection-item';
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
        
        document.querySelectorAll('.delete-injection').forEach(btn => {
            btn.addEventListener('click', () => {
                const domain = btn.dataset.domain;
                if (confirm(`Are you sure you want to delete the injection for ${domain}?`)) {
                    window.scriptManager.removeScript(domain);
                    loadInjections();
                }
            });
        });
        
        document.querySelectorAll('.edit-injection').forEach(btn => {
            btn.addEventListener('click', () => {
                const domain = btn.dataset.domain;
                const script = window.scriptManager.scripts[domain];
                
                document.getElementById('domain').value = domain;
                document.getElementById('name').value = script.name;
                document.getElementById('description').value = script.description;
                document.getElementById('code').value = script.code;
                
                addScriptBtn.textContent = 'Update Script';
                addScriptBtn.dataset.editing = domain;
            });
        });
    }
    
    /*addScriptBtn.addEventListener('click', () => {
        const domain = document.getElementById('domain').value.trim();
        const name = document.getElementById('name').value.trim();
        const description = document.getElementById('description').value.trim();
        const code = document.getElementById('code').value.trim();
        
        if (!domain || !name || !code) {
            alert('Please fill in all required fields (domain, name, and code).');
            return;
        }
        
        const scriptInfo = {
            name,
            description,
            code
        };
        
        window.scriptManager.addScript(domain, scriptInfo);
        
        document.getElementById('domain').value = '';
        document.getElementById('name').value = '';
        document.getElementById('description').value = '';
        document.getElementById('code').value = '';
        
        addScriptBtn.textContent = 'Add Script';
        delete addScriptBtn.dataset.editing;
        
        loadInjections();
    });*/
    
    loadCurrentTheme();
    //loadInjections();
}); 