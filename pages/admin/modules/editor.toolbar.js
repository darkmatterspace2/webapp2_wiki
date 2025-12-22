/**
 * EDITOR TOOLBAR
 * Handles text formatting, insertion commands, and media placeholders.
 */

window.insertText = function (text) {
    const textarea = document.getElementById('edit-content');
    if (!textarea) {
        console.error("Editor textarea not found!");
        return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.substring(0, start) + text + textarea.value.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
};

window.format = function (command) {
    const textarea = document.getElementById('edit-content');
    if (!textarea) return;

    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    let text = textarea.value;
    let selected = text.substring(start, end);
    let insertBefore = '';
    let insertAfter = '';

    switch (command) {
        case 'bold': insertBefore = '<b>'; insertAfter = '</b>'; break;
        case 'italic': insertBefore = '<i>'; insertAfter = '</i>'; break;
        case 'h2': insertBefore = '<h2>'; insertAfter = '</h2>'; break;
        case 'h3': insertBefore = '<h3>'; insertAfter = '</h3>'; break;
        case 'code': insertBefore = '<pre><code>'; insertAfter = '</code></pre>'; break;
        case 'quote': insertBefore = '<blockquote>'; insertAfter = '</blockquote>'; break;
        case 'link': insertBefore = '<a href="URL_HERE">'; insertAfter = '</a>'; break;
    }

    textarea.value = text.substring(0, start) + insertBefore + selected + insertAfter + text.substring(end);
    textarea.focus();

    if (start === end) { // No selection
        textarea.selectionStart = start + insertBefore.length;
        textarea.selectionEnd = start + insertBefore.length;
    } else {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + insertBefore.length + selected.length + insertAfter.length;
    }
};

window.insertImage = function () {
    window.insertText('<img src="IMAGE_URL_HERE" alt="description" loading="lazy" style="max-width:100%; border: 1px solid var(--border-color);">');
};

window.insertVideo = function () {
    window.insertText('<iframe src="VIDEO_URL_HERE" width="100%" height="400" frameborder="0" allowfullscreen></iframe>\n<!-- Or use <video controls src="..."></video> for direct files -->');
};

window.insertGallery = function () {
    console.log("Insert Gallery Triggered");
    const snippet = '\n<div class="retro-gallery">\n' +
        '    <img src="IMAGE_1_URL">\n' +
        '    <img src="IMAGE_2_URL">\n' +
        '    <img src="IMAGE_3_URL">\n' +
        '</div>\n';
    window.insertText(snippet);
};
