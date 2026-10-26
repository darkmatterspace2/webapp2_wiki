/**
 * EDITOR CORE
 * Handles application state, authentication, categories, tag chips & autocomplete,
 * draft auto-save/restore, live metrics, and data saving.
 */

window.editingId = null;
window.existingBucketPath = null;
window.articleTags = [];
window.allCategories = [];
window.allExistingTags = [];
window.isFormDirty = false;
window.autoSaveTimer = null;

window.initEditor = async function () {
    console.log("[Editor] Initializing...");
    const sbClient = AppUtils.initSupabase();

    // 1. Auth Check
    const user = await AppUtils.checkAuth(sbClient);
    if (!user) {
        alert("Restricted Area. Please Login.");
        window.location.href = 'login.html';
        return;
    }

    // 2. Load Categories and Tags in parallel
    await Promise.all([
        window.loadCategories(),
        window.loadExistingTags()
    ]);

    // 3. Check Edit Mode
    window.editingId = AppUtils.getParam('edit') || AppUtils.getParam('id');
    if (window.editingId) {
        console.log("[Editor] Edit mode for ID:", window.editingId);
        await window.loadArticleForEdit(window.editingId);
    } else {
        // New article mode: check for unsaved draft
        window.checkDraft();
    }

    // 4. Bind UI Event Listeners
    window.bindEditorEvents();

    // 5. Start Auto-Save (Every 15 seconds)
    window.startAutoSave();
};

// ==========================================
// CATEGORY HANDLING
// ==========================================

window.loadCategories = async function (selectedCat = '') {
    try {
        const showR = await AppUtils.isRRatedAllowed();
        const categories = await CategoryService.getAll(showR);
        window.allCategories = categories || [];

        const select = document.getElementById('edit-category-select');
        if (!select) return;

        select.innerHTML = '<option value="">-- Choose Category --</option>';

        window.allCategories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            select.appendChild(opt);
        });

        // Add "+ Add New Category..." option
        const newOpt = document.createElement('option');
        newOpt.value = '__NEW__';
        newOpt.textContent = '+ [ Add New Category... ]';
        select.appendChild(newOpt);

        if (selectedCat) {
            window.setCategoryValue(selectedCat);
        }
    } catch (err) {
        console.warn("[Editor] Failed loading categories:", err);
    }
};

window.setCategoryValue = function (cat) {
    const select = document.getElementById('edit-category-select');
    const customInput = document.getElementById('custom-category-input');
    const customWrapper = document.getElementById('custom-category-wrapper');

    if (!select) return;

    if (window.allCategories.includes(cat)) {
        select.value = cat;
        if (customWrapper) customWrapper.style.display = 'none';
        if (customInput) customInput.value = '';
    } else if (cat) {
        // Custom / existing category not in the safe list
        // Add it to the select options so it is displayed properly
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        const newOpt = select.querySelector('option[value="__NEW__"]');
        if (newOpt) {
            select.insertBefore(opt, newOpt);
        } else {
            select.appendChild(opt);
        }
        window.allCategories.push(cat);
        select.value = cat;
        if (customWrapper) customWrapper.style.display = 'none';
        if (customInput) customInput.value = '';
    }
};

window.handleCategorySelectChange = function () {
    const select = document.getElementById('edit-category-select');
    const customWrapper = document.getElementById('custom-category-wrapper');
    const customInput = document.getElementById('custom-category-input');

    if (select.value === '__NEW__') {
        customWrapper.style.display = 'flex';
        customInput.focus();
    } else {
        customWrapper.style.display = 'none';
    }
    window.markDirty();
};

window.toggleNewCategoryInput = function () {
    const select = document.getElementById('edit-category-select');
    const customWrapper = document.getElementById('custom-category-wrapper');
    const customInput = document.getElementById('custom-category-input');

    if (customWrapper.style.display === 'flex') {
        customWrapper.style.display = 'none';
        select.value = '';
    } else {
        select.value = '__NEW__';
        customWrapper.style.display = 'flex';
        customInput.focus();
    }
    window.markDirty();
};

// ==========================================
// TAG CHIPS & AUTOCOMPLETE
// ==========================================

window.loadExistingTags = async function () {
    try {
        const showR = await AppUtils.isRRatedAllowed();
        const [allTags, popularTags] = await Promise.all([
            ArticleService.getAllTags(showR),
            ArticleService.getPopularTags(10, showR)
        ]);

        window.allExistingTags = allTags || [];

        // Populate Datalist for autocomplete
        const datalist = document.getElementById('tags-datalist');
        if (datalist) {
            datalist.innerHTML = '';
            window.allExistingTags.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                datalist.appendChild(opt);
            });
        }

        // Populate Popular Quick-Add Chips
        const popContainer = document.getElementById('editor-popular-tags');
        if (popContainer) {
            if (popularTags && popularTags.length > 0) {
                popContainer.innerHTML = popularTags.map(pt => 
                    `<a href="javascript:void(0)" onclick="addTag('${pt.tag}')" class="editor-quick-tag" title="Click to add">+ ${pt.tag}</a>`
                ).join(' ');
            } else {
                popContainer.innerHTML = '<span style="color: #666;">none</span>';
            }
        }
    } catch (err) {
        console.warn("[Editor] Failed loading tags:", err);
    }
};

window.normalizeTag = function (tag) {
    return (tag || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[!@#$%^&*()+=\[\]{};:'",.<>?\\|`~]/g, '');
};

window.addTag = function (tagStr) {
    const clean = window.normalizeTag(tagStr);
    if (!clean) return;

    if (!window.articleTags.includes(clean)) {
        window.articleTags.push(clean);
        window.renderTagChips();
        window.markDirty();
    }

    const input = document.getElementById('tag-input');
    if (input) input.value = '';
};

window.removeTag = function (index) {
    if (index >= 0 && index < window.articleTags.length) {
        window.articleTags.splice(index, 1);
        window.renderTagChips();
        window.markDirty();
    }
};

window.renderTagChips = function () {
    const container = document.getElementById('tag-chips-container');
    if (!container) return;

    container.innerHTML = '';
    window.articleTags.forEach((tag, idx) => {
        const chip = document.createElement('span');
        chip.className = 'editor-tag-pill';
        chip.innerHTML = `#${tag} <button type="button" onclick="removeTag(${idx})" title="Remove tag">&times;</button>`;
        container.appendChild(chip);
    });
};

// ==========================================
// LOAD FOR EDIT
// ==========================================

window.loadArticleForEdit = async function (id) {
    document.getElementById('editor-title').innerText = "Edit Article";
    AppUtils.showLoading(true);

    try {
        const meta = await ArticleService.getById(id);
        window.existingBucketPath = meta.bucket_path;

        const content = await StorageService.downloadAsText(meta.bucket_path);

        // Populate Form
        document.getElementById('edit-title').value = meta.title || '';
        document.getElementById('edit-rating').value = meta.ratings || "NR";
        document.getElementById('edit-content').value = content || '';

        // Category
        window.setCategoryValue(meta.category || '');

        // Tags
        window.articleTags = (meta.tags || []).map(t => window.normalizeTag(t)).filter(Boolean);
        window.renderTagChips();

        // Rating explainer badge
        window.updateRatingBadge();

        // Metrics HUD
        window.updateMetrics();

        // Check if there is an unsaved draft that is newer
        window.checkDraft();

        window.isFormDirty = false;

    } catch (err) {
        console.error('[EDITOR] Error loading article:', err);
        alert("Error loading article: " + err.message);
    }

    AppUtils.showLoading(false);
};

// ==========================================
// EVENT BINDINGS & LIVE METRICS
// ==========================================

window.bindEditorEvents = function () {
    const contentTextarea = document.getElementById('edit-content');
    const titleInput = document.getElementById('edit-title');
    const tagInput = document.getElementById('tag-input');
    const ratingSelect = document.getElementById('edit-rating');

    if (contentTextarea) {
        contentTextarea.addEventListener('input', () => {
            window.markDirty();
            window.updateMetrics();
        });
    }

    if (titleInput) {
        titleInput.addEventListener('input', window.markDirty);
    }

    if (ratingSelect) {
        ratingSelect.addEventListener('change', () => {
            window.markDirty();
            window.updateRatingBadge();
        });
    }

    if (tagInput) {
        tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                window.addTag(tagInput.value);
            } else if (e.key === 'Backspace' && !tagInput.value && window.articleTags.length > 0) {
                window.removeTag(window.articleTags.length - 1);
            }
        });

        // Handle selecting from datalist via mouse click
        tagInput.addEventListener('change', () => {
            if (tagInput.value) {
                window.addTag(tagInput.value);
            }
        });
    }

    // Warn before navigating away if form is dirty
    window.addEventListener('beforeunload', (e) => {
        if (window.isFormDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    window.updateRatingBadge();
    window.updateMetrics();
};

window.markDirty = function () {
    window.isFormDirty = true;
};

window.updateRatingBadge = function () {
    const rating = document.getElementById('edit-rating').value;
    const badge = document.getElementById('rating-warning-badge');
    if (!badge) return;

    if (['M', 'P', 'X'].includes(rating)) {
        badge.innerHTML = `<span style="color: #ff4444; font-size: 11px; border: 1px solid #ff4444; padding: 2px 6px; background: rgba(255,0,0,0.1);">⚠ Restricted: Visible only to logged-in users</span>`;
    } else {
        badge.innerHTML = `<span style="color: #00ff66; font-size: 11px; opacity: 0.8;">Public: Visible to everyone</span>`;
    }
};

window.updateMetrics = function () {
    const textarea = document.getElementById('edit-content');
    const metricsEl = document.getElementById('editor-metrics');
    if (!textarea || !metricsEl) return;

    const raw = textarea.value || '';
    // Strip HTML tags for word count
    const stripped = raw.replace(/<[^>]*>/g, ' ');
    const words = stripped.trim() ? stripped.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = raw.length;
    const readTimeMin = Math.max(1, Math.ceil(words / 200));

    metricsEl.innerHTML = `WORDS: <b>${words}</b> &nbsp;|&nbsp; CHARS: <b>${chars.toLocaleString()}</b> &nbsp;|&nbsp; READ TIME: <b>~${readTimeMin} min</b>`;
};

// ==========================================
// DRAFT AUTO-SAVE & RECOVERY
// ==========================================

function getDraftKey() {
    return 'retrowiki_draft_' + (window.editingId || 'new');
}

window.startAutoSave = function () {
    if (window.autoSaveTimer) clearInterval(window.autoSaveTimer);
    window.autoSaveTimer = setInterval(() => {
        if (window.isFormDirty) {
            window.saveDraft();
        }
    }, 15000); // 15 seconds
};

window.saveDraft = function () {
    const title = document.getElementById('edit-title')?.value || '';
    const content = document.getElementById('edit-content')?.value || '';
    const rating = document.getElementById('edit-rating')?.value || 'NR';
    
    // Resolve Category
    const catSelect = document.getElementById('edit-category-select');
    const customInput = document.getElementById('custom-category-input');
    let category = '';
    if (catSelect) {
        category = (catSelect.value === '__NEW__') ? (customInput?.value || '') : catSelect.value;
    }

    if (!title && !content) return; // Don't save empty drafts

    const draft = {
        title,
        category,
        tags: window.articleTags,
        ratings: rating,
        content,
        timestamp: Date.now()
    };

    try {
        localStorage.setItem(getDraftKey(), JSON.stringify(draft));
        const statusEl = document.getElementById('draft-status-indicator');
        if (statusEl) {
            const timeStr = new Date().toLocaleTimeString();
            statusEl.textContent = `[Draft saved ${timeStr}]`;
            setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 3000);
        }
    } catch (e) {
        console.warn("[Editor] Could not write draft to localStorage:", e);
    }
};

window.checkDraft = function () {
    try {
        const saved = localStorage.getItem(getDraftKey());
        if (!saved) return;

        const draft = JSON.parse(saved);
        if (!draft || !draft.timestamp) return;

        const dateStr = new Date(draft.timestamp).toLocaleString();
        const banner = document.getElementById('draft-recovery-banner');
        if (banner) {
            banner.innerHTML = `
                <span>⚠️ <b>Unsaved Auto-Draft found from ${dateStr}</b></span>
                <div>
                    <button type="button" onclick="restoreDraft()" style="margin-right: 8px; font-size: 11px; cursor: pointer; padding: 2px 8px;">Restore Draft</button>
                    <button type="button" onclick="discardDraft()" style="font-size: 11px; cursor: pointer; padding: 2px 8px;">Discard</button>
                </div>
            `;
            banner.style.display = 'flex';
        }
    } catch (e) {
        console.warn("[Editor] Error checking draft:", e);
    }
};

window.restoreDraft = function () {
    try {
        const saved = localStorage.getItem(getDraftKey());
        if (!saved) return;
        const draft = JSON.parse(saved);

        if (draft.title !== undefined) document.getElementById('edit-title').value = draft.title;
        if (draft.ratings !== undefined) {
            document.getElementById('edit-rating').value = draft.ratings;
            window.updateRatingBadge();
        }
        if (draft.category !== undefined) window.setCategoryValue(draft.category);
        if (Array.isArray(draft.tags)) {
            window.articleTags = draft.tags;
            window.renderTagChips();
        }
        if (draft.content !== undefined) {
            document.getElementById('edit-content').value = draft.content;
            window.updateMetrics();
        }

        window.markDirty();
        const banner = document.getElementById('draft-recovery-banner');
        if (banner) banner.style.display = 'none';
        alert("Draft successfully restored!");
    } catch (e) {
        alert("Failed restoring draft: " + e.message);
    }
};

window.discardDraft = function () {
    try {
        localStorage.removeItem(getDraftKey());
        const banner = document.getElementById('draft-recovery-banner');
        if (banner) banner.style.display = 'none';
    } catch (e) {}
};

// ==========================================
// SAVE & PUBLISH
// ==========================================

window.handleSave = async function (e) {
    e.preventDefault();
    AppUtils.showLoading(true);

    const title = document.getElementById('edit-title').value.trim();
    
    // Resolve Category
    const catSelect = document.getElementById('edit-category-select');
    const customInput = document.getElementById('custom-category-input');
    let category = '';

    if (catSelect.value === '__NEW__') {
        category = customInput ? customInput.value.trim() : '';
    } else {
        category = catSelect.value.trim();
    }

    if (!title) {
        alert("Please enter an article title.");
        AppUtils.showLoading(false);
        return;
    }

    if (!category) {
        alert("Please select or enter a category.");
        AppUtils.showLoading(false);
        return;
    }

    const tags = window.articleTags;
    const ratings = document.getElementById('edit-rating').value;
    const content = document.getElementById('edit-content').value;

    try {
        // Upload content using date-based folder structure
        const bucketPath = await StorageService.uploadArticle(title, content);

        // Build payload
        const payload = {
            title,
            category,
            tags,
            ratings,
            bucket_path: bucketPath,
            updated_at: new Date().toISOString()
        };

        if (window.editingId) {
            // Update existing
            await ArticleService.update(window.editingId, payload);
            // Delete old file if path changed
            if (window.existingBucketPath && window.existingBucketPath !== bucketPath) {
                try { await StorageService.delete(window.existingBucketPath); } catch (e) { }
            }
        } else {
            // Create new
            const newArticle = await ArticleService.create(payload);
            if (newArticle && newArticle.length > 0) {
                window.editingId = newArticle[0].id;
                window.existingBucketPath = bucketPath;
            }
        }

        // Successfully saved: Clear local draft & reset dirty state
        try { localStorage.removeItem(getDraftKey()); } catch (e) {}
        window.isFormDirty = false;

        alert("Article successfully published to Net!");

        // Check if we should redirect or stay
        const submitter = e.submitter;
        if (submitter && submitter.name === 'save-continue') {
            console.log("Keeping editor open...");
            if (window.editingId && !window.location.search.includes('edit=')) {
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?edit=' + window.editingId;
                window.history.pushState({ path: newUrl }, '', newUrl);
                document.getElementById('editor-title').innerText = "Edit Article";
            }
        } else {
            window.location.href = '../../index.html';
        }

    } catch (error) {
        console.error('[EDITOR] Save error:', error);
        alert("Error saving article: " + error.message);
    }

    AppUtils.showLoading(false);
};

// Bind init to window load
window.onload = window.initEditor;
