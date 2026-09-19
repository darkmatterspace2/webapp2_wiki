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
    const url = prompt("Enter image URL (or leave default):", "IMAGE_URL_HERE");
    if (url === null) return;
    const alt = prompt("Enter alt/caption (optional):", "Image description") || "";
    window.insertText(`\n<img src="${url}" alt="${alt}" loading="lazy" style="max-width:100%; border: 1px solid var(--border-color);">\n`);
};

window.insertVideo = function () {
    const url = prompt("Enter video embed URL or direct MP4 link:", "VIDEO_URL_HERE");
    if (url === null) return;
    if (url.endsWith('.mp4') || url.endsWith('.webm')) {
        window.insertText(`\n<video controls src="${url}" style="max-width:100%; height:auto; border: 1px solid var(--border-color);"></video>\n`);
    } else {
        window.insertText(`\n<iframe src="${url}" width="100%" height="400" frameborder="0" allowfullscreen style="max-width:100%; border: 1px solid var(--border-color);"></iframe>\n`);
    }
};

window.insertGallery = function (cols = 3) {
    const colsClass = cols === 3 ? '' : ` cols-${cols}`;
    const snippet = `\n<div class="retro-gallery${colsClass}">\n` +
        '    <img src="IMAGE_1_URL" alt="Item 1">\n' +
        '    <img src="IMAGE_2_URL" alt="Item 2">\n' +
        '    <img src="IMAGE_3_URL" alt="Item 3">\n' +
        '</div>\n';
    window.insertText(snippet);
};

window.insertCallout = function (type = 'note') {
    const title = type === 'warning' ? 'WARNING' : (type === 'tip' ? 'PRO-TIP' : 'NOTE');
    const snippet = `\n<div style="border: 2px outset var(--border-color); background: rgba(0,255,102,0.07); padding: 10px 12px; margin: 12px 0; border-left: 5px solid #00ff66;">\n` +
        `    <b>[ ${title} ]</b><br>\n` +
        `    Write your important callout content here...\n` +
        `</div>\n`;
    window.insertText(snippet);
};

window.insertTableTemplate = function () {
    const snippet = `\n<table class="article-table" style="width:100%; border-collapse:collapse; margin: 12px 0;">\n` +
        '    <thead>\n' +
        '        <tr>\n' +
        '            <th style="border:1px solid #555; padding:6px;">Header 1</th>\n' +
        '            <th style="border:1px solid #555; padding:6px;">Header 2</th>\n' +
        '            <th style="border:1px solid #555; padding:6px;">Header 3</th>\n' +
        '        </tr>\n' +
        '    </thead>\n' +
        '    <tbody>\n' +
        '        <tr>\n' +
        '            <td style="border:1px solid #444; padding:6px;">Data A1</td>\n' +
        '            <td style="border:1px solid #444; padding:6px;">Data A2</td>\n' +
        '            <td style="border:1px solid #444; padding:6px;">Data A3</td>\n' +
        '        </tr>\n' +
        '        <tr>\n' +
        '            <td style="border:1px solid #444; padding:6px;">Data B1</td>\n' +
        '            <td style="border:1px solid #444; padding:6px;">Data B2</td>\n' +
        '            <td style="border:1px solid #444; padding:6px;">Data B3</td>\n' +
        '        </tr>\n' +
        '    </tbody>\n' +
        '</table>\n';
    window.insertText(snippet);
};

