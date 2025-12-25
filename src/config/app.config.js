// APP CONFIGURATION
// Centralized paths and feature flags - modify basePath if app moves to subfolder

const APP_CONFIG = {
    // Set to '/subfolder' if app is deployed to a subdirectory
    basePath: '',

    // Feature flags
    features: {
        themes: true,
        rRatedFilter: true,
        zenMode: true
    },

    // Resolve path relative to app root
    resolvePath: function (relativePath) {
        return this.basePath + relativePath;
    },

    // Detect if we're in a subdirectory (pages/ or admin/)
    getDepth: function () {
        const path = window.location.pathname;
        if (path.includes('/pages/admin/')) return '../../';
        if (path.includes('/pages/other/')) return '../../';
        if (path.includes('/pages/')) return '../';
        if (path.includes('/admin/')) return '../';
        return './';
    }
};

window.APP_CONFIG = APP_CONFIG;
