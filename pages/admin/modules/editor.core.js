/**
 * EDITOR CORE
 * Handles application state, authentication, data loading, and saving.
 */

window.editingId = null;
window.existingBucketPath = null;

window.initEditor = async function () {
    console.log("[Editor] Initializing...");
    const sbClient = AppUtils.initSupabase();

    // Auth Check
    const user = await AppUtils.checkAuth(sbClient);
    if (!user) {
        alert("Restricted Area. Please Login.");
        window.location.href = 'login.html';
        return;
    }

    // Check Edit Mode
    window.editingId = AppUtils.getParam('edit') || AppUtils.getParam('id');
    if (window.editingId) {
        console.log("[Editor] Edit mode for ID:", window.editingId);
        await window.loadArticleForEdit(window.editingId);
    }
};

window.loadArticleForEdit = async function (id) {
    document.getElementById('editor-title').innerText = "Edit Article";
    AppUtils.showLoading(true);

    try {
        // Use ArticleService to get metadata
        const meta = await ArticleService.getById(id);
        window.existingBucketPath = meta.bucket_path;

        // Use StorageService to get content
        const content = await StorageService.downloadAsText(meta.bucket_path);

        // Populate Form
        document.getElementById('edit-title').value = meta.title;
        document.getElementById('edit-category').value = meta.category;
        document.getElementById('edit-tags').value = (meta.tags || []).join(', ');
        document.getElementById('edit-rating').value = meta.ratings || "NR";
        document.getElementById('edit-content').value = content;

    } catch (err) {
        console.error('[EDITOR] Error:', err);
        alert("Error loading article: " + err.message);
    }

    AppUtils.showLoading(false);
};

window.handleSave = async function (e) {
    e.preventDefault();
    AppUtils.showLoading(true);

    const title = document.getElementById('edit-title').value;
    const category = document.getElementById('edit-category').value;
    const tags = document.getElementById('edit-tags').value.split(',').map(t => t.trim()).filter(Boolean);
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
            // If we created a new article, we need its ID to continue editing
            if (newArticle && newArticle.length > 0) {
                window.editingId = newArticle[0].id; // Supabase returns array
                window.existingBucketPath = bucketPath;
            }
        }

        alert("Success!");

        // Check if we should redirect or stay
        const submitter = e.submitter;
        if (submitter && submitter.name === 'save-continue') {
            console.log("Keeping editor open...");
            // If it was a new article, update URL without reload so refresh works
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
        alert("Error: " + error.message);
    }

    AppUtils.showLoading(false);
};

// Bind init to window load
window.onload = window.initEditor;
