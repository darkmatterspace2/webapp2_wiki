/**
 * EDITOR TABS
 * Handles switching between different editor views (Content, Fetch URLs, AI Assist, Other).
 */

window.switchTab = function (tabName) {
    // Define all tab names
    const tabs = ['editor', 'fetch', 'ai', 'other'];

    // Hide all tab content areas
    tabs.forEach(t => {
        const content = document.getElementById('tab-content-' + t);
        if (content) content.style.display = 'none';

        const btn = document.getElementById('tab-btn-' + t);
        if (btn) {
            // Reset styles for inactive tabs
            // We want them to look like clickable tabs
            btn.style.backgroundColor = 'var(--header-bg)';
            btn.style.color = 'var(--text-color)';
            btn.style.fontWeight = 'normal';
            btn.style.border = '1px solid var(--border-color)';
            btn.style.opacity = '0.7';
            btn.style.cursor = 'pointer';
        }
    });

    // Show target content
    const targetContent = document.getElementById('tab-content-' + tabName);
    if (targetContent) {
        targetContent.style.display = 'block';
    }

    // Highlight active button
    const targetBtn = document.getElementById('tab-btn-' + tabName);
    if (targetBtn) {
        targetBtn.style.backgroundColor = 'var(--bg-color)';
        targetBtn.style.fontWeight = 'bold';
        targetBtn.style.opacity = '1';
        targetBtn.style.borderBottom = '1px solid var(--bg-color)'; // Hide bottom border to merge
        targetBtn.style.cursor = 'default';
    }
};

// Initialize tabs on load
window.addEventListener('load', () => {
    // Default to editor tab
    if (window.switchTab) {
        window.switchTab('editor');
    }
});
