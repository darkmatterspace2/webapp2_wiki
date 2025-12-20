// RetroWiki 2k25 Application Logic

// --- GLOBALS & STATE ---
let supabase;
const STATE = {
    user: null, // Admin user
    currentPage: 1,
    itemsPerPage: 10,
    currentCategory: 'all',
    searchQuery: '',
    articleCache: {}, // Simple cache for loaded articles
    editingId: null // ID of article being edited
};

// --- INITIALIZATION ---
async function initApp() {
    console.log("Welcome to RetroWiki 2k25");

    // Theme Init
    if (localStorage.getItem('theme') === 'light') {
        document.body.dataset.theme = 'light';
        document.body.classList.remove('dark-mode');
    }

    // Zen Mode Init
    if (localStorage.getItem('zenMode') === 'true') {
        document.body.classList.add('zen-mode');
    }

    // Supabase Init
    if (window.SUPABASE_URL && window.SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
        supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

        // Check Session
        const { data: { session } } = await supabase.auth.getSession();
        STATE.user = session?.user || null;
        updateUIAuth();

        // Load Initial Data
        fetchCategories();
        fetchArticles();
    } else {
        alert("CRITICAL ERROR: Supabase keys not running. Please configure config.js");
    }

    // Router Init
    window.onpopstate = (event) => {
        if (event.state) router.navigate(event.state.view, event.state.params, false);
    };

    // Render Alphabet Jump Links
    renderJumpLinks();
}

// --- ROUTER ---
const router = {
    navigate: (view, params = {}, pushHistory = true) => {
        // Hide all views
        ['view-home', 'view-article', 'view-create', 'view-login'].forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });

        // Show target view
        document.getElementById(`view-${view}`).classList.remove('hidden');
        window.scrollTo(0, 0);

        if (pushHistory) {
            history.pushState({ view, params }, '', `#${view}`);
        }

        // View specific logic
        if (view === 'home') {
            fetchArticles();
        } else if (view === 'create') {
            if (!STATE.user) {
                alert("ACCESS DENIED: Admins only.");
                router.navigate('login');
                return;
            }
            resetEditor();
        } else if (view === 'login') {
            // just show form
        }
    }
};

// --- AUTHENTICATION ---
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("LOGIN FAILED: " + error.message);
    } else {
        STATE.user = data.user;
        updateUIAuth();
        router.navigate('home');
    }
}

async function handleSignUp(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) return alert("Please enter email and password.");

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        alert("SIGN UP FAILED: " + error.message);
    } else {
        alert("Sign Up Successful! Check your email for confirmation link, or if auto-confirm is on, you can now login.");
        // If auto-confirm is on (Supabase default for dev sometimes), they might be logged in. 
        // But usually requires email verification.
        if (data.session) {
            STATE.user = data.session.user;
            updateUIAuth();
            router.navigate('home');
        }
    }
}

function updateUIAuth() {
    // Show/Hide admin elements
    const adminLink = document.querySelector('a[href="#"][onclick*="showAdminLogin"]');
    if (STATE.user) {
        adminLink.textContent = "Logout (" + STATE.user.email + ")";
        adminLink.onclick = async () => {
            await supabase.auth.signOut();
            STATE.user = null;
            updateUIAuth();
            alert("Logged out successfully.");
            router.navigate('home');
            return false;
        };
    } else {
        adminLink.textContent = "Admin Login";
        adminLink.onclick = () => { showAdminLogin(); return false; };
    }
}

function showAdminLogin() {
    router.navigate('login');
}


// --- DATA FETCHING (DB) ---
async function fetchArticles() {
    showLoading(true);
    const from = (STATE.currentPage - 1) * STATE.itemsPerPage;
    const to = from + STATE.itemsPerPage - 1;

    let query = supabase
        .from('wiki_articles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (STATE.currentCategory !== 'all') {
        query = query.eq('category', STATE.currentCategory);
    }

    if (STATE.searchQuery) {
        query = query.ilike('title', `%${STATE.searchQuery}%`);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching articles:", error);
        alert("Error retrieving data matrix.");
    } else {
        renderArticleList(data);
        updatePagination(count);
    }
    showLoading(false);
}

async function fetchCategories() {
    const { data } = await supabase.from('wiki_articles').select('category');
    if (data) {
        const categories = [...new Set(data.map(i => i.category))].sort();
        const list = document.getElementById('category-list');
        // Keep "All"
        list.innerHTML = '<li><a href="#" onclick="filterByCategory(\'all\'); return false;">All</a></li>';

        categories.forEach(cat => {
            if (!cat) return;
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" onclick="filterByCategory('${cat}'); return false;">${cat}</a>`;
            list.appendChild(li);
        });
    }
}

// --- ARTICLE VIEWING (DB + STORAGE) ---
async function openArticle(id) {
    showLoading(true);

    // 1. Fetch Metadata
    const { data: meta, error } = await supabase
        .from('wiki_articles')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !meta) {
        alert("FILE NOT FOUND: " + (error?.message || "Unknown ID"));
        showLoading(false);
        return;
    }

    // 2. Fetch Content from Storage
    // Construct public URL or download directly. 
    // Since it's a private bucket usually, we use download. 
    // If public bucket, use getPublicUrl. Assuming public read for now as per "Public User: Read-only".

    const { data: fileData, error: fileError } = await supabase
        .storage
        .from('wiki-content')
        .download(meta.bucket_path);

    if (fileError) {
        alert("CORRUPTED DATA: Could not retrieve file content.");
        console.error(fileError);
        showLoading(false);
        return;
    }

    const textContent = await fileData.text();

    // 3. Render
    STATE.currentArticle = meta; // Store for valid "Back" navigation or "Edit"
    renderArticleView(meta, textContent);

    // 4. Increment View (fire and forget)
    supabase.rpc('increment_view', { row_id: id }); // We'll need a stored proc or simple update
    // Simple update fallback if RPC not made:
    const newViews = (meta.views || 0) + 1;
    supabase.from('wiki_articles').update({ views: newViews }).eq('id', id).then(() => { });

    router.navigate('article', { id }, false); // Don't push duplicates if already navigating
    showLoading(false);
}

function renderArticleView(meta, content) {
    document.getElementById('article-title').textContent = meta.title;
    document.getElementById('article-meta').textContent = `Category: ${meta.category} | Created: ${new Date(meta.created_at).toLocaleDateString()} | Views: ${meta.views}`;
    document.getElementById('article-body').innerHTML = content;

    // Admin Controls
    const adminActions = document.getElementById('admin-actions');
    if (STATE.user) {
        adminActions.classList.remove('hidden');
    } else {
        adminActions.classList.add('hidden');
    }

    // TOC
    generateTOC();
}

// --- CRUD OPERATIONS ---
async function handleSaveArticle(e) {
    e.preventDefault();
    if (!STATE.user) return alert("UNAUTHORIZED");

    showLoading(true);
    const title = document.getElementById('edit-title').value;
    const category = document.getElementById('edit-category').value;
    const tags = document.getElementById('edit-tags').value.split(',').map(t => t.trim());
    const content = document.getElementById('edit-content').value;

    // 1. Upload File
    const fileName = `${Date.now()}_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    const fileBlob = new Blob([content], { type: 'text/html' });

    // If Editing, we might want to overwrite or create new. 
    // For simplicity: If editing, overwrite old path if possible? 
    // Actually, creating a new file ensures no caching issues.

    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('wiki-content')
        .upload(fileName, fileBlob, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        alert("UPLOAD FAILED: " + uploadError.message);
        showLoading(false);
        return;
    }

    const bucket_path = uploadData.path;

    // 2. Save Metadata
    const articleData = {
        title,
        category,
        tags,
        bucket_path,
        // user_id: STATE.user.id // If RLS needs it
    };

    let error;
    if (STATE.editingId) {
        // Update existing record
        // Note: We are abandoning the old file in the bucket. A cron job could clean up.
        const { error: dbError } = await supabase
            .from('wiki_articles')
            .update(articleData)
            .eq('id', STATE.editingId);
        error = dbError;
    } else {
        // Insert new
        const { error: dbError } = await supabase
            .from('wiki_articles')
            .insert([articleData]);
        error = dbError;
    }

    if (error) {
        alert("DB ERROR: " + error.message);
    } else {
        alert("Published Successfully!");
        resetEditor();
        router.navigate('home');
        fetchArticles(); // Refresh list
    }
    showLoading(false);
}

async function deleteCurrentArticle() {
    if (!confirm("Are you sure you want to DELETE this entry? This actions is irreversible.")) return;

    const id = STATE.currentArticle.id;
    const path = STATE.currentArticle.bucket_path;

    // 1. Delete from DB
    const { error } = await supabase.from('wiki_articles').delete().eq('id', id);
    if (error) return alert("Delete failed: " + error.message);

    // 2. Delete from Storage (Optional but good)
    await supabase.storage.from('wiki-content').remove([path]);

    alert("Article deleted.");
    router.navigate('home');
}

function editCurrentArticle() {
    STATE.editingId = STATE.currentArticle.id;

    document.getElementById('editor-title').textContent = "Edit Article";
    document.getElementById('edit-title').value = STATE.currentArticle.title;
    document.getElementById('edit-category').value = STATE.currentArticle.category;
    document.getElementById('edit-tags').value = (STATE.currentArticle.tags || []).join(', ');

    // We need to put the content back into the textarea
    // The content is currently in #article-body
    document.getElementById('edit-content').value = document.getElementById('article-body').innerHTML;

    router.navigate('create', {}, false); // Go to editor view
}

function resetEditor() {
    STATE.editingId = null;
    document.getElementById('editor-title').textContent = "Create New Article";
    document.forms[0].reset();
}

// --- UI HELPERS ---
function renderArticleList(articles) {
    const tbody = document.getElementById('article-list-body');
    tbody.innerHTML = '';

    if (articles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" align="center">No data found in matrix.</td></tr>';
        return;
    }

    articles.forEach(art => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td valign="top"><small>${new Date(art.created_at).toLocaleDateString()}</small></td>
            <td valign="top">
                <a href="#" onclick="openArticle('${art.id}'); return false;" style="font-weight: bold;">${art.title}</a>
                <br>
                <small>${(art.tags || []).join(', ')}</small>
            </td>
            <td valign="top">${art.category}</td>
            <td align="right" valign="top">${art.views || 0}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderJumpLinks() {
    const container = document.getElementById('jump-links');
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const links = alphabet.map(char => `<a href="#" onclick="handleSearch('${char}'); return false;">${char}</a>`).join(" | ");
    container.innerHTML = `[ ${links} | <a href="#" onclick="handleSearch(''); return false;">ALL</a> ]`;
}

function generateTOC() {
    const headers = document.querySelectorAll('#article-body h1, #article-body h2, #article-body h3');
    const toc = document.getElementById('article-toc');
    const container = document.getElementById('toc-container');

    toc.innerHTML = '';

    if (headers.length < 2) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    headers.forEach((h, index) => {
        if (!h.id) h.id = `h-${index}`;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${h.id}`;
        a.textContent = h.textContent;
        li.appendChild(a);
        toc.appendChild(li);
    });
}

function handleSearch(val) {
    STATE.searchQuery = val;
    STATE.currentPage = 1;
    fetchArticles();
}

function filterByCategory(cat) {
    STATE.currentCategory = cat;
    STATE.currentPage = 1;
    fetchArticles();
}

function changePage(delta) {
    const newPage = STATE.currentPage + delta;
    if (newPage < 1) return;
    STATE.currentPage = newPage;
    fetchArticles();
}

function updatePagination(totalCount) {
    // Simple logic
    const totalPages = Math.ceil(totalCount / STATE.itemsPerPage);
    document.getElementById('page-indicator').textContent = `Page ${STATE.currentPage} of ${totalPages || 1}`;
}

function toggleZenMode() {
    document.body.classList.toggle('zen-mode');
    const isZen = document.body.classList.contains('zen-mode');
    localStorage.setItem('zenMode', isZen);
}

function toggleTheme() {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.remove('dark-mode');
        document.body.dataset.theme = 'light';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-mode');
        delete document.body.dataset.theme;
        localStorage.setItem('theme', 'dark');
    }
}

function showLoading(isLoading) {
    const indicator = document.getElementById('loading-indicator');
    if (isLoading) indicator.style.display = 'inline-block';
    else indicator.style.display = 'none';
}
