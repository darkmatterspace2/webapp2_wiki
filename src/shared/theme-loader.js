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

    // Apply a theme by ID
    async applyTheme(themeId) {
        const registry = await this.loadRegistry();
        const theme = registry.themes.find(t => t.id === themeId);
        if (!theme) return false;

        // Remove existing theme stylesheet
        const existing = document.getElementById('theme-stylesheet');
        if (existing) existing.remove();

        // Add new theme stylesheet
        const link = document.createElement('link');
        link.id = 'theme-stylesheet';
        link.rel = 'stylesheet';
        link.href = `${this.getThemesPath()}/${theme.css}`;
        document.head.appendChild(link);

        localStorage.setItem('selected-theme', themeId);
        return true;
    },

    // Get current theme
    getCurrentTheme() {
        return localStorage.getItem('selected-theme') || 'default';
    },

    // Initialize theme from localStorage
    init() {
        const saved = localStorage.getItem('selected-theme');
        if (saved && saved !== 'default') {
            this.applyTheme(saved);
        }
    }
};

window.ThemeLoader = ThemeLoader;
