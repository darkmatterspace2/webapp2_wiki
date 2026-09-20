/**
 * ADVANCED WORD-STYLE WYSIWYG EDITOR MODULE
 * Features:
 * - Rich Ribbon formatting (Fonts, Sizes, Colors, Alignment, Lists, Headings)
 * - Multimedia insertion & live management (Images, Videos, Galleries, Tables, Callouts)
 * - Interactive Floating Media Inspector (Alignment wrap, Resize presets, Captions, Delete)
 * - Direct Clipboard image paste & Drag-and-drop
 * - Two-way real-time synchronization with Raw HTML
 */

(function () {
    let currentSelectedMedia = null;
    let savedSelectionRange = null;

    // ==========================================
    // INITIALIZATION & LIFECYCLE
    // ==========================================

    window.initWysiwyg = function () {
        const editor = document.getElementById('wysiwyg-editor');
        if (!editor) return;

        // Auto-sync on typing / editing
        editor.addEventListener('input', () => {
            window.syncFromWysiwyg();
            updateWysiwygMetrics();
        });

        // Click detection for media selection & floating inspector
        editor.addEventListener('click', handleEditorClick);

        // Selection change listener for updating active ribbon buttons
        document.addEventListener('selectionchange', handleSelectionChange);

        // Drag and drop image upload
        editor.addEventListener('dragover', (e) => e.preventDefault());
        editor.addEventListener('drop', handleFileDrop);

        // Clipboard paste handling (Direct image paste)
        editor.addEventListener('paste', handleClipboardPaste);

        // Keyboard shortcuts
        editor.addEventListener('keydown', handleEditorKeydown);

        // Update metrics initially
        updateWysiwygMetrics();
    };

    // ==========================================
    // SELECTION & CURSOR MEMORY
    // ==========================================

    window.saveWysiwygSelection = function () {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            savedSelectionRange = sel.getRangeAt(0).cloneRange();
        }
    };

    window.restoreWysiwygSelection = function () {
        if (!savedSelectionRange) return;
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelectionRange);
    };

    // ==========================================
    // TWO-WAY SYNCHRONIZATION
    // ==========================================

    // Raw HTML -> WYSIWYG
    window.syncToWysiwyg = function () {
        const rawContent = document.getElementById('edit-content');
        const visualEditor = document.getElementById('wysiwyg-editor');
        if (!rawContent || !visualEditor) return;

        visualEditor.innerHTML = rawContent.value || '<p><br></p>';
        updateWysiwygMetrics();
    };

    // WYSIWYG -> Raw HTML
    window.syncFromWysiwyg = function () {
        const visualEditor = document.getElementById('wysiwyg-editor');
        const rawInput = document.getElementById('edit-content');
        if (!visualEditor || !rawInput) return;

        // Clone and clean up any editor-only artifacts
        const clone = visualEditor.cloneNode(true);

        // Remove selection markers
        clone.querySelectorAll('[data-wysiwyg-selected]').forEach(el => {
            el.removeAttribute('data-wysiwyg-selected');
        });

        rawInput.value = clone.innerHTML;

        // Also trigger any metric updates in the main editor toolbar
        if (window.updateMetrics) {
            window.updateMetrics();
        }
    };

    // ==========================================
    // CORE TEXT & PARAGRAPH FORMATTING
    // ==========================================

    window.execWysiwygCmd = function (command, value = null) {
        const editor = document.getElementById('wysiwyg-editor');
        if (editor) editor.focus();

        document.execCommand(command, false, value);
        window.syncFromWysiwyg();
        updateWysiwygMetrics();
    };

    window.setWysiwygFontFamily = function (fontName) {
        if (!fontName) return;
        window.execWysiwygCmd('fontName', fontName);
    };

    window.setWysiwygFontSize = function (size) {
        if (!size) return;
        // Apply inline style to selection for precise pixel sizing
        const sel = window.getSelection();
        if (sel.rangeCount > 0 && !sel.isCollapsed) {
            const span = document.createElement('span');
            span.style.fontSize = size;
            const range = sel.getRangeAt(0);
            span.appendChild(range.extractContents());
            range.insertNode(span);
            window.syncFromWysiwyg();
        } else {
            window.execWysiwygCmd('fontSize', '3'); // fallback
        }
    };

    window.setWysiwygHeading = function (tag) {
        if (!tag) return;
        window.execWysiwygCmd('formatBlock', `<${tag}>`);
    };

    // ==========================================
    // MULTIMEDIA CLICK & FLOATING INSPECTOR
    // ==========================================

    function handleEditorClick(e) {
        const target = e.target;

        // Check if user clicked an image, video, figure, or table
        const mediaTarget = target.closest('img, video, iframe, figure, table, .wysiwyg-callout');

        if (mediaTarget) {
            selectMediaElement(mediaTarget);
        } else {
            clearMediaSelection();
        }
    }

    function selectMediaElement(el) {
        clearMediaSelection();
        currentSelectedMedia = el;
        el.setAttribute('data-wysiwyg-selected', 'true');
        positionMediaToolbar(el);
    }

    function clearMediaSelection() {
        if (currentSelectedMedia) {
            currentSelectedMedia.removeAttribute('data-wysiwyg-selected');
            currentSelectedMedia = null;
        }
        const toolbar = document.getElementById('wysiwyg-media-toolbar');
        if (toolbar) toolbar.style.display = 'none';
    }

    function positionMediaToolbar(el) {
        const toolbar = document.getElementById('wysiwyg-media-toolbar');
        const viewport = document.querySelector('.wysiwyg-viewport');
        if (!toolbar || !viewport) return;

        const elRect = el.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();

        // Calculate position relative to the scrollable viewport
        const top = elRect.top - viewportRect.top + viewport.scrollTop;
        const left = elRect.left - viewportRect.left + viewport.scrollLeft + (elRect.width / 2);

        toolbar.style.top = `${Math.max(10, top)}px`;
        toolbar.style.left = `${left}px`;
        toolbar.style.display = 'flex';
    }

    // Media Toolbar Actions
    window.setMediaAlignment = function (alignment) {
        if (!currentSelectedMedia) return;

        // Clear existing alignments
        currentSelectedMedia.classList.remove('media-align-left', 'media-align-center', 'media-align-right', 'media-align-full');

        if (alignment) {
            currentSelectedMedia.classList.add(`media-align-${alignment}`);
        }

        positionMediaToolbar(currentSelectedMedia);
        window.syncFromWysiwyg();
    };

    window.setMediaWidth = function (percent) {
        if (!currentSelectedMedia) return;

        if (percent === 'auto') {
            currentSelectedMedia.style.width = '';
            currentSelectedMedia.style.maxWidth = '100%';
        } else {
            currentSelectedMedia.style.width = percent;
            currentSelectedMedia.style.maxWidth = '100%';
        }

        positionMediaToolbar(currentSelectedMedia);
        window.syncFromWysiwyg();
    };

    window.promptMediaCaption = function () {
        if (!currentSelectedMedia) return;

        let fig = currentSelectedMedia.closest('figure');
        let currentText = '';

        if (fig) {
            const cap = fig.querySelector('figcaption');
            if (cap) currentText = cap.innerText;
        } else if (currentSelectedMedia.tagName === 'IMG') {
            currentText = currentSelectedMedia.getAttribute('alt') || '';
        }

        const newCaption = prompt("Enter caption for this media item:", currentText);
        if (newCaption === null) return;

        if (fig) {
            let cap = fig.querySelector('figcaption');
            if (!cap && newCaption) {
                cap = document.createElement('figcaption');
                fig.appendChild(cap);
            }
            if (cap) {
                if (newCaption) {
                    cap.innerHTML = newCaption;
                } else {
                    cap.remove();
                }
            }
        } else if (currentSelectedMedia.tagName === 'IMG' || currentSelectedMedia.tagName === 'VIDEO') {
            // Wrap in figure if not already wrapped
            if (newCaption) {
                const parent = currentSelectedMedia.parentNode;
                const figure = document.createElement('figure');
                figure.className = currentSelectedMedia.className;
                currentSelectedMedia.className = '';

                parent.insertBefore(figure, currentSelectedMedia);
                figure.appendChild(currentSelectedMedia);

                const cap = document.createElement('figcaption');
                cap.innerHTML = newCaption;
                figure.appendChild(cap);

                selectMediaElement(figure);
            }
        }

        window.syncFromWysiwyg();
    };

    window.deleteSelectedMedia = function () {
        if (!currentSelectedMedia) return;
        const target = currentSelectedMedia.closest('figure') || currentSelectedMedia;
        target.remove();
        clearMediaSelection();
        window.syncFromWysiwyg();
    };

    window.editSelectedMediaUrl = function () {
        if (!currentSelectedMedia) return;
        const media = currentSelectedMedia.querySelector('img, video, iframe') || currentSelectedMedia;
        const currentSrc = media.getAttribute('src') || '';
        const newSrc = prompt("Update media URL / link:", currentSrc);
        if (newSrc && newSrc.trim()) {
            media.setAttribute('src', newSrc.trim());
            window.syncFromWysiwyg();
        }
    };

    // ==========================================
    // MODAL DIALOG CONTROLS (IMAGE, VIDEO, ETC.)
    // ==========================================

    window.openWysiwygModal = function (modalId) {
        window.saveWysiwygSelection();
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('open');
    };

    window.closeWysiwygModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('open');
        window.restoreWysiwygSelection();
    };

    // Insert Image Dialog Submit
    window.submitInsertImage = function (e) {
        e.preventDefault();
        const url = document.getElementById('wysiwyg-img-url').value.trim();
        const alt = document.getElementById('wysiwyg-img-alt').value.trim();
        const caption = document.getElementById('wysiwyg-img-caption').value.trim();
        const align = document.getElementById('wysiwyg-img-align').value;

        if (!url) {
            alert("Please enter a valid image URL.");
            return;
        }

        window.restoreWysiwygSelection();

        let html = '';
        const alignClass = align ? ` media-align-${align}` : '';

        if (caption) {
            html = `<figure class="${alignClass}"><img src="${url}" alt="${alt}" loading="lazy"><figcaption>${caption}</figcaption></figure><p><br></p>`;
        } else {
            html = `<img src="${url}" alt="${alt}" loading="lazy" class="${alignClass}"><p><br></p>`;
        }

        insertHtmlAtCursor(html);
        closeWysiwygModal('modal-wysiwyg-image');

        // Reset form
        document.getElementById('wysiwyg-img-url').value = '';
        document.getElementById('wysiwyg-img-caption').value = '';
        document.getElementById('wysiwyg-img-alt').value = '';
    };

    // Insert Video Dialog Submit
    window.submitInsertVideo = function (e) {
        e.preventDefault();
        const url = document.getElementById('wysiwyg-vid-url').value.trim();
        const poster = document.getElementById('wysiwyg-vid-poster').value.trim();
        const caption = document.getElementById('wysiwyg-vid-caption').value.trim();
        const align = document.getElementById('wysiwyg-vid-align').value;

        if (!url) {
            alert("Please enter a valid video URL.");
            return;
        }

        window.restoreWysiwygSelection();

        const alignClass = align ? ` media-align-${align}` : '';
        const posterAttr = poster ? ` poster="${poster}"` : '';
        let mediaHtml = '';

        if (url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('blob')) {
            mediaHtml = `<video controls src="${url}"${posterAttr}></video>`;
        } else {
            // Embed iframe (YouTube, Vimeo, etc.)
            let embedUrl = url;
            if (url.includes('youtube.com/watch?v=')) {
                embedUrl = url.replace('watch?v=', 'embed/');
            } else if (url.includes('youtu.be/')) {
                embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/');
            }
            mediaHtml = `<iframe src="${embedUrl}" width="100%" height="420" frameborder="0" allowfullscreen></iframe>`;
        }

        let html = '';
        if (caption) {
            html = `<figure class="${alignClass}">${mediaHtml}<figcaption>${caption}</figcaption></figure><p><br></p>`;
        } else {
            html = `<div class="${alignClass}">${mediaHtml}</div><p><br></p>`;
        }

        insertHtmlAtCursor(html);
        closeWysiwygModal('modal-wysiwyg-video');

        // Reset form
        document.getElementById('wysiwyg-vid-url').value = '';
        document.getElementById('wysiwyg-vid-poster').value = '';
        document.getElementById('wysiwyg-vid-caption').value = '';
    };

    // Insert Retro Gallery Dialog Submit
    window.submitInsertGallery = function (e) {
        e.preventDefault();
        const cols = document.getElementById('wysiwyg-gal-cols').value || '3';
        const urlsText = document.getElementById('wysiwyg-gal-urls').value.trim();

        if (!urlsText) {
            alert("Please provide at least one media URL.");
            return;
        }

        const lines = urlsText.split('\n').map(l => l.trim()).filter(Boolean);
        const colClass = cols === '3' ? '' : ` cols-${cols}`;

        let itemsHtml = '';
        lines.forEach((url, i) => {
            if (url.endsWith('.mp4') || url.endsWith('.webm')) {
                itemsHtml += `  <video controls src="${url}" data-caption="<b>Video ${i + 1}</b>"></video>\n`;
            } else {
                itemsHtml += `  <img src="${url}" alt="Gallery Item ${i + 1}">\n`;
            }
        });

        const html = `\n<div class="retro-gallery${colClass}">\n${itemsHtml}</div>\n<p><br></p>`;

        window.restoreWysiwygSelection();
        insertHtmlAtCursor(html);
        closeWysiwygModal('modal-wysiwyg-gallery');
        document.getElementById('wysiwyg-gal-urls').value = '';
    };

    // Insert Table Dialog Submit
    window.submitInsertTable = function (e) {
        e.preventDefault();
        const rows = parseInt(document.getElementById('wysiwyg-tbl-rows').value, 10) || 3;
        const cols = parseInt(document.getElementById('wysiwyg-tbl-cols').value, 10) || 3;
        const hasHeader = document.getElementById('wysiwyg-tbl-header').checked;

        let tableHtml = '<table class="article-table">\n';

        if (hasHeader) {
            tableHtml += '  <thead>\n    <tr>\n';
            for (let c = 1; c <= cols; c++) {
                tableHtml += `      <th>Header ${c}</th>\n`;
            }
            tableHtml += '    </tr>\n  </thead>\n';
        }

        tableHtml += '  <tbody>\n';
        for (let r = 1; r <= rows; r++) {
            tableHtml += '    <tr>\n';
            for (let c = 1; c <= cols; c++) {
                tableHtml += `      <td>Cell ${r}-${c}</td>\n`;
            }
            tableHtml += '    </tr>\n';
        }
        tableHtml += '  </tbody>\n</table>\n<p><br></p>';

        window.restoreWysiwygSelection();
        insertHtmlAtCursor(tableHtml);
        closeWysiwygModal('modal-wysiwyg-table');
    };

    // Insert Link Dialog Submit
    window.submitInsertLink = function (e) {
        e.preventDefault();
        const url = document.getElementById('wysiwyg-link-url').value.trim();
        const text = document.getElementById('wysiwyg-link-text').value.trim();
        const targetBlank = document.getElementById('wysiwyg-link-blank').checked;

        if (!url) {
            alert("Please enter a link URL.");
            return;
        }

        window.restoreWysiwygSelection();

        const targetAttr = targetBlank ? ' target="_blank" rel="noopener noreferrer"' : '';
        const linkText = text || url;
        const linkHtml = `<a href="${url}"${targetAttr}>${linkText}</a>`;

        insertHtmlAtCursor(linkHtml);
        closeWysiwygModal('modal-wysiwyg-link');
        document.getElementById('wysiwyg-link-url').value = '';
        document.getElementById('wysiwyg-link-text').value = '';
    };

    // Insert Callout Box
    window.insertWysiwygCallout = function (type = 'note') {
        const title = type === 'warning' ? 'WARNING' : (type === 'tip' ? 'PRO-TIP' : 'NOTE');
        const customClass = type === 'warning' ? ' callout-warning' : (type === 'tip' ? ' callout-tip' : '');
        const html = `<div class="wysiwyg-callout${customClass}"><b>[ ${title} ]</b><p>Write your important callout note here...</p></div><p><br></p>`;
        insertHtmlAtCursor(html);
    };

    // Helper: Insert HTML snippet at current caret
    function insertHtmlAtCursor(html) {
        const editor = document.getElementById('wysiwyg-editor');
        if (editor) editor.focus();

        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();

            const el = document.createElement('div');
            el.innerHTML = html;
            const frag = document.createDocumentFragment();
            let node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);

            if (lastNode) {
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else {
            editor.innerHTML += html;
        }

        window.syncFromWysiwyg();
        updateWysiwygMetrics();
    }

    // ==========================================
    // CLIPBOARD & DRAG-DROP IMAGE HANDLING
    // ==========================================

    function handleClipboardPaste(e) {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = function (event) {
                    const dataUrl = event.target.result;
                    const html = `<img src="${dataUrl}" alt="Pasted Image" loading="lazy" class="media-align-center"><p><br></p>`;
                    insertHtmlAtCursor(html);
                };
                reader.readAsDataURL(file);
                break;
            }
        }
    }

    function handleFileDrop(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const dataUrl = event.target.result;
                    const html = `<img src="${dataUrl}" alt="Uploaded Image" loading="lazy" class="media-align-center"><p><br></p>`;
                    insertHtmlAtCursor(html);
                };
                reader.readAsDataURL(file);
            }
        }
    }

    function handleEditorKeydown(e) {
        // Support Ctrl+K for Insert Link shortcut
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            const sel = window.getSelection().toString();
            const linkInput = document.getElementById('wysiwyg-link-text');
            if (linkInput && sel) linkInput.value = sel;
            window.openWysiwygModal('modal-wysiwyg-link');
        }
    }

    // ==========================================
    // CANVAS CONTROLS & HUD METRICS
    // ==========================================

    window.toggleCanvasTheme = function () {
        const page = document.getElementById('wysiwyg-editor');
        const btn = document.getElementById('btn-canvas-theme');
        if (!page) return;

        page.classList.toggle('dark-canvas');
        const isDark = page.classList.contains('dark-canvas');
        if (btn) btn.textContent = isDark ? '☀ Light Paper' : '🌙 Dark Canvas';
    };

    window.toggleCanvasWidth = function () {
        const page = document.getElementById('wysiwyg-editor');
        const btn = document.getElementById('btn-canvas-width');
        if (!page) return;

        page.classList.toggle('fluid-canvas');
        const isFluid = page.classList.contains('fluid-canvas');
        if (btn) btn.textContent = isFluid ? '📄 Standard Page' : '↔ Full Screen';
    };

    function updateWysiwygMetrics() {
        const editor = document.getElementById('wysiwyg-editor');
        const metricEl = document.getElementById('wysiwyg-metrics');
        if (!editor || !metricEl) return;

        const text = editor.innerText || '';
        const words = (text.trim().match(/\S+/g) || []).length;
        const chars = text.length;
        const readTime = Math.max(1, Math.ceil(words / 200));

        metricEl.innerHTML = `WORDS: <b>${words}</b> &nbsp;|&nbsp; CHARS: <b>${chars}</b> &nbsp;|&nbsp; READ TIME: <b>~${readTime} min</b>`;
    }

    function handleSelectionChange() {
        // Toggle bold/italic/underline states on ribbon buttons
        const isBold = document.queryCommandState('bold');
        const isItalic = document.queryCommandState('italic');
        const isUnderline = document.queryCommandState('underline');

        const btnB = document.getElementById('wysiwyg-btn-bold');
        const btnI = document.getElementById('wysiwyg-btn-italic');
        const btnU = document.getElementById('wysiwyg-btn-underline');

        if (btnB) btnB.classList.toggle('active', isBold);
        if (btnI) btnI.classList.toggle('active', isItalic);
        if (btnU) btnU.classList.toggle('active', isUnderline);
    }

    // Initialize on load
    window.addEventListener('load', window.initWysiwyg);

})();
