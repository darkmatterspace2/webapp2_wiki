/**
 * EDITOR WYSIWYG
 * Handles real-time visual editing and syncing with the raw HTML textarea.
 */

window.initWysiwyg = function () {
    const editor = document.getElementById('wysiwyg-editor');
    if (!editor) return;

    // Auto-sync on typing to ensure raw source is always up to date if we save from here
    editor.addEventListener('input', window.syncFromWysiwyg);
};

// Sync Raw HTML -> Visual Editor
window.syncToWysiwyg = function () {
    const rawContent = document.getElementById('edit-content').value;
    const visualEditor = document.getElementById('wysiwyg-editor');
    if (visualEditor) {
        visualEditor.innerHTML = rawContent;
    }
};

// Sync Visual Editor -> Raw HTML
window.syncFromWysiwyg = function () {
    const visualEditor = document.getElementById('wysiwyg-editor');
    const rawInput = document.getElementById('edit-content');
    if (visualEditor && rawInput) {
        rawInput.value = visualEditor.innerHTML;
    }
};

// Execute formatting commands
window.execWysiwygCmd = function (command, value = null) {
    document.execCommand(command, false, value);
    window.syncFromWysiwyg(); // Sync immediately

    // Keep focus
    const editor = document.getElementById('wysiwyg-editor');
    if (editor) editor.focus();
};

window.toggleSourceView = function () {
    // Just switch to the main Editor tab which is the Source View
    if (window.switchTab) {
        window.switchTab('editor');
    }
};

// Initialize
window.addEventListener('load', window.initWysiwyg);
