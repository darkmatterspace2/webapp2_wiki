// Shared Layout Injector
// Injects the table structure into a specific container or wraps the body content.
// Ideally, the page should have a <div id="page-content"></div> inside the content cell, 
// OR we construct the wrapper around the existing body content.

// Strategy: The HTML pages will contain ONLY the content of the "content-cell". 
// This script will wipe `document.body` and rebuild the Table Layout, inserting the original info.

document.addEventListener("DOMContentLoaded", () => {
    initLayout();
});

function initLayout() {
    // 1. Preserve Content
    const originalContent = document.body.innerHTML;
    const bodyClass = document.body.className; // preserve classes like zen-mode
    const onLoadFn = document.body.onload; // preserve logic? better to use events.

    // 2. Setup Base Theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.dataset.theme = 'light';
        document.body.classList.remove('dark-mode');
    } else {
        document.body.classList.add('dark-mode');
    }

    // Zen Mode
    if (localStorage.getItem('zenMode') === 'true') {
        document.body.classList.add('zen-mode');
    }

    // 3. Define Layout HTML
    // Note: We use absolute paths for links to ensure they work from subdirs (like /admin/)
    // Assuming app is at root. If sub-path, we might need a base_url.
    // For local file usage, relative paths are tricky if depth varies. 
    // We will attempt to detect depth or just use relatively robust paths.
    // Hack: Check if we are in 'admin' folder.
    const isInAdmin = window.location.pathname.includes('/admin/');
    const rootPath = isInAdmin ? '../' : './';

    const layoutHTML = `
    <table class="main-layout" border="1" cellpadding="0" cellspacing="0">
        <!-- HEADER ROW -->
        <tr>
            <td colspan="2" class="header-cell">
                <div class="header-content">
                    <div>
                        <span style="font-size: 24px; font-weight: bold;">RetroWiki</span>
                        <span style="font-size: 10px; vertical-align: super;">v2.0</span>
                    </div>
                    <div>
                        <button onclick="Layout.toggleZenMode()">[ Zen Mode ]</button>
                        <button onclick="Layout.toggleTheme()">[ Light/Dark ]</button>
                    </div>
                </div>
            </td>
        </tr>

        <!-- MAIN BODY ROW -->
        <tr>
            <!-- SIDEBAR -->
            <td class="sidebar-cell" id="sidebar">
                <div style="text-align: center; margin-bottom: 20px;">
                     <!-- Loading Spinner Placeholder -->
                     <span id="loading-indicator" style="display:none; color: yellow; background: blue; font-weight: bold;">LOADING...</span>
                </div>

                <b>Navigation</b>
                <ul>
                    <li><a href="${rootPath}index.html">Home / Search</a></li>
                    <li><a href="${rootPath}admin/editor.html">Create New</a></li>
                    <li><a href="${rootPath}admin/ai-creator.html">AI Creator (Basic)</a></li>
                    <li><a href="${rootPath}admin/advanced-ai-creator.html">Advanced Creator (Pro)</a></li>
                    <li><a href="${rootPath}admin/json-importer.html">JSON Importer</a></li>
                    <li><a href="${rootPath}other_misc/useful_links.html">Useful Links</a></li>
                    <li><a href="#" id="auth-link">Admin Login</a></li>
                </ul>

                <hr>

                <b>Categories</b>
                <ul id="category-list">
                    <li><a href="${rootPath}index.html">All</a></li>
                    <!-- We will populate this via JS if we can, or static -->
                </ul>

                <hr>

                <b>Tag Search</b>
                <div style="margin: 5px 0;">
                    <input type="text" id="tag-search-input" placeholder="Enter tag..." style="width: 80%; font-size: 12px;">
                    <button onclick="Layout.searchByTag()" style="font-size: 11px;">Go</button>
                </div>

                <hr>
                
                <div style="margin-bottom: 20px;">
                    <details>
                        <summary style="font-size: 12px; cursor: pointer; font-weight: bold; margin-bottom: 5px;">Settings</summary>
                            <div style="font-size: 12px; font-weight: bold;">Theme:</div>
                            <label style="font-size: 12px; cursor: pointer;">
                                <input type="radio" name="theme-radio" value="light" id="theme-light"> Light
                            </label>
                            <label style="font-size: 12px; cursor: pointer;">
                                <input type="radio" name="theme-radio" value="dark" id="theme-dark"> Dark
                            </label>
                        <br>                        
                        <div style="margin-left: 5px;">
                            <label style="font-size: 12px; cursor: pointer;">
                                <input type="checkbox" id="show-r-rated-checkbox">
                                Show R Rated content
                            </label>
                            <br><br>
                            

                        </div>
                    </details>
                </div>

                <div style="text-align: center;">
                    <small>Optimized for<br>Netscape 4.0</small>
                </div>
            </td>

            <!-- CONTENT AREA -->
            <td class="content-cell" id="main-content-cell">
                <!-- ORIGINAL CONTENT GOES HERE -->
            </td>
        </tr>

        <!-- FOOTER ROW -->
        <tr>
            <td colspan="2" class="footer-cell">
                <center>
                    You are visitor number: 
                    <div class="visitor-counter" id="visitor-count">08472</div>
                    <br>
                    &copy; 1999-2025 RetroWiki Inc. All rights reserved. 
                </center>
            </td>
        </tr>
    </table>
    `;

    // 4. Inject
    document.body.innerHTML = layoutHTML;
    document.getElementById('main-content-cell').innerHTML = originalContent;

    // 5. Post-Inject Logic
    updateAuthLink(rootPath);
    // 5. Post-Inject Logic
    updateAuthLink(rootPath);
    setupRRatedCheckbox();
    setupThemeRadios();
    loadCategories(rootPath);
    loadCategories(rootPath);

    // Expose layout functions
    window.Layout = {
        toggleZenMode,
        toggleTheme,
        searchByTag
    };
}

// Helper: Toggle Theme
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

// Helper: Search by Tag
function searchByTag() {
    const input = document.getElementById('tag-search-input');
    if (input && input.value.trim()) {
        const isInAdmin = window.location.pathname.includes('/admin/');
        const rootPath = isInAdmin ? '../' : './';
        window.location.href = rootPath + 'index.html?tag=' + encodeURIComponent(input.value.trim());
    }
}

// Helper: Toggle Zen
function toggleZenMode() {
    document.body.classList.toggle('zen-mode');
    const isZen = document.body.classList.contains('zen-mode');
    localStorage.setItem('zenMode', isZen);
    // Trigger resize for gallery layout recalculation
    window.dispatchEvent(new Event('resize'));
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 300);
}

// Helper: Update Login/Logout Link
async function updateAuthLink(rootPath) {
    // Wait for utils to be ready? We assume utils.js is loaded BEFORE layout.js
    if (!window.AppUtils) return; // verification fail safety

    const sbClient = window.AppUtils.initSupabase();
    if (!sbClient) return;

    const user = await window.AppUtils.checkAuth(sbClient);
    const link = document.getElementById('auth-link');

    if (user) {
        link.textContent = "Logout";
        link.href = "#";
        link.onclick = async (e) => {
            e.preventDefault();
            await sbClient.auth.signOut();
            window.location.href = rootPath + "index.html";
        };
    } else {
        link.textContent = "Admin Login";
        link.href = rootPath + "admin/login.html";
        link.onclick = null;
    }
}

// Helper: Setup R-rated Checkbox
function setupRRatedCheckbox() {
    const cb = document.getElementById('show-r-rated-checkbox');
    if (!cb) return;

    // Load state
    const isChecked = localStorage.getItem('show_r_rated') === 'true';
    cb.checked = isChecked;

    // Save state and reload on change
    cb.addEventListener('change', () => {
        localStorage.setItem('show_r_rated', cb.checked);
        window.location.reload();
    });
}

// Helper: Setup Theme Radios
function setupThemeRadios() {
    const lightRadio = document.getElementById('theme-light');
    const darkRadio = document.getElementById('theme-dark');

    if (!lightRadio || !darkRadio) return;

    // Load initial state
    const currentTheme = localStorage.getItem('theme') || 'dark'; // Default to dark if not set? Or check body class
    if (document.body.classList.contains('dark-mode')) {
        darkRadio.checked = true;
    } else {
        lightRadio.checked = true;
    }

    // Add listeners
    const handleThemeChange = (e) => {
        const val = e.target.value;
        if (val === 'light') {
            document.body.classList.remove('dark-mode');
            document.body.dataset.theme = 'light';
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.add('dark-mode');
            delete document.body.dataset.theme;
            localStorage.setItem('theme', 'dark');
        }
    };

    lightRadio.addEventListener('change', handleThemeChange);
    darkRadio.addEventListener('change', handleThemeChange);
}

// Helper: Load Categories (Simple fetch)
async function loadCategories(rootPath) {
    if (!window.AppUtils) return;
    const sbClient = window.AppUtils.initSupabase();
    if (!sbClient) return;

    const showR = localStorage.getItem('show_r_rated') === 'true';

    let query = sbClient.from('wiki_articles').select('category');

    // Apply filter if "Show R Rated" is NOT checked
    if (!showR) {
        query = query.not("ratings", "in", '("M","P","X")');
    }

    const { data } = await query;
    if (data) {
        const categories = [...new Set(data.map(i => i.category))].sort();
        const list = document.getElementById('category-list');
        list.innerHTML = `<li><a href="${rootPath}index.html">All</a></li>`;

        categories.forEach(cat => {
            if (!cat) return;
            const li = document.createElement('li');
            li.innerHTML = `<a href="${rootPath}index.html?cat=${cat}">${cat}</a>`;
            list.appendChild(li);
        });
    }
}
