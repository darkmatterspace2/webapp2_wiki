// Shared Utilities

// Ensure Supabase is available
function initSupabase() {
    if (!window.supabase) {
        console.error("Supabase Client JS not loaded");
        return null;
    }
    if (!window.SUPABASE_URL || window.SUPABASE_URL.includes("YOUR_SUPABASE")) {
        console.error("Config not set");
        return null;
    }
    // Force localStorage to avoid IndexedDB issues on Android
    return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            storageKey: 'supabase-auth',
            storage: window.localStorage
        }
    });
}

// Global state/auth helper
async function checkAuth(supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
}

// URL Params
function getParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Date Format
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString();
}

// Loading Spinner Toggle
function showLoading(show) {
    const el = document.getElementById('loading-indicator');
    if (el) el.style.display = show ? 'inline-block' : 'none';
}

// Export to window
window.AppUtils = {
    initSupabase,
    checkAuth,
    getParam,
    formatDate,
    showLoading
};
