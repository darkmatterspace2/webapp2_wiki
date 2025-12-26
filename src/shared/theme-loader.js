// THEME LOADER
// Dynamic theme loading and switching

const ThemeLoader = {

    // Get themes path relative to current page
    getThemesPath: function () {
        const rootPath = APP_CONFIG.getDepth();
        return rootPath + 'css/themes';
    },

    // Load theme registry from JSON
    async loadRegistry() {
        try {
            const res = await fetch(`${this.getThemesPath()}/themes.json`);
            return await res.json();
        } catch (e) {
            console.warn('Theme registry not found, using defaults');
            return { themes: [], default: 'default' };
        }
    },

    // Apply a theme by ID (Optimistic / Convention-based)
    applyTheme(themeId) {
        if (!themeId || themeId === 'default') {
            const existing = document.getElementById('theme-stylesheet');
            if (existing) existing.remove();
            localStorage.setItem('selected-theme', 'default');
            return;
        }

        // Construct path based on convention: css/themes/[id]/theme.css
        // This avoids waiting for themes.json fetch
        const cssPath = `${this.getThemesPath()}/${themeId}/theme.css`;

        // Update or Create Link
        let link = document.getElementById('theme-stylesheet');
        if (!link) {
            link = document.createElement('link');
            link.id = 'theme-stylesheet';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        link.href = cssPath;

        localStorage.setItem('selected-theme', themeId);
    },

    // Load theme registry for UI (Settings menu) - keeps full metadata support
    async loadRegistry() {
        try {
            const res = await fetch(`${this.getThemesPath()}/themes.json`);
            return await res.json();
        } catch (e) {
            console.warn('Theme registry error', e);
            return { themes: [] };
        }
    },

    // Initialize theme immediately
    init() {
        const saved = localStorage.getItem('selected-theme');
        if (saved && saved !== 'default') {
            this.applyTheme(saved);
        }
    }
};

window.ThemeLoader = ThemeLoader;

// IMMEDIATE EXECUTION to prevent FOUC
// This runs as soon as this script is parsed in <head>
ThemeLoader.init();
