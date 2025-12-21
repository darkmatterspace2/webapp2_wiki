// Shared Layout Injector
// Injects the table structure, uses centralized services

document.addEventListener("DOMContentLoaded", () => {
    initLayout();
});

function initLayout() {
    // 1. Preserve Content
    const originalContent = document.body.innerHTML;

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

    // 3. Get root path using APP_CONFIG
    const rootPath = window.APP_CONFIG ? APP_CONFIG.getDepth() : './';

    // 4. Define Layout HTML
    const layoutHTML = `
    <table class="main-layout" border="1" cellpadding="0" cellspacing="0">
        <!-- HEADER ROW -->
        <tr>
            <td colspan="2" class="header-cell">
                <div class="header-content">
                    <div>
                        <a href="${rootPath}index.html" style="text-decoration: none; color: inherit;">
                            <span style="font-size: 24px; font-weight: bold;">RetroWiki</span>
                            <span style="font-size: 10px; vertical-align: super;">v2.0</span>
                        </a>
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
                    <li><a href="${rootPath}pages/admin/editor.html">Create New</a></li>
                    <li><a href="${rootPath}pages/admin/ai-creator.html">AI Creator (Basic)</a></li>
                    <li><a href="${rootPath}pages/admin/advanced-ai-creator.html">Advanced Creator (Pro)</a></li>
                    <li><a href="${rootPath}pages/admin/json-importer.html">JSON Importer</a></li>
                    <li><a href="#" id="auth-link">Admin Login</a></li>
                </ul>

                <hr>

                <b>Categories</b>
                <ul id="category-list">
                    <li><a href="${rootPath}index.html">All</a></li>
                    <!-- Populated via JS -->
                </ul>

                <hr>
                
                <div style="margin-bottom: 20px;">
                    <details>
                        <summary style="font-size: 12px; cursor: pointer; font-weight: bold; margin-bottom: 5px;">Settings</summary>
                        
                        <div style="font-size: 12px; font-weight: bold; margin-top: 10px;">Theme:</div>
                        <select id="theme-selector" style="width: 100%; font-size: 11px; margin-top: 5px;">
                            <option value="default">Retro Classic</option>
                            <option value="retro-green">Matrix Green</option>
                            <option value="light-mode">Light Mode</option>
                        </select>
                        
                        <br><br>
                        
                        <div style="margin-left: 5px;">
                            <label style="font-size: 12px; cursor: pointer;">
                                <input type="checkbox" id="show-r-rated-checkbox">
                                Show R Rated content
                            </label>
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

    <!-- Back to Top Button -->
    <button id="back-to-top" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" 
        style="display: none; position: fixed; bottom: 20px; right: 20px; z-index: 999; 
               padding: 10px 15px; background: #333; color: #fff; border: 2px solid #666; 
               cursor: pointer; font-family: inherit; font-size: 12px;">
        ▲ Top
    </button>
    `;

    // 5. Inject
    document.body.innerHTML = layoutHTML;
    document.getElementById('main-content-cell').innerHTML = originalContent;

    // 6. Post-Inject Logic
    updateAuthLink(rootPath);
    setupRRatedCheckbox();
    setupThemeSelector();
    loadCategories(rootPath);

    // Initialize theme loader if available
    if (window.ThemeLoader) {
        ThemeLoader.init();
    }

    // Setup Back to Top button
    setupBackToTop();

    // Expose layout functions
    window.Layout = {
        toggleZenMode,
        toggleTheme
    };
}

// Helper: Toggle Theme (legacy button)
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

// Helper: Toggle Zen
function toggleZenMode() {
    document.body.classList.toggle('zen-mode');
    const isZen = document.body.classList.contains('zen-mode');
    localStorage.setItem('zenMode', isZen);
}

// Helper: Update Login/Logout Link
async function updateAuthLink(rootPath) {
    if (!window.AppUtils) return;

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
        link.href = rootPath + "pages/admin/login.html";
        link.onclick = null;
    }
}

// Helper: Setup R-rated Checkbox
function setupRRatedCheckbox() {
    const cb = document.getElementById('show-r-rated-checkbox');
    if (!cb) return;

    const isChecked = localStorage.getItem('show_r_rated') === 'true';
    cb.checked = isChecked;

    cb.addEventListener('change', () => {
        localStorage.setItem('show_r_rated', cb.checked);
        window.location.reload();
    });
}

// Helper: Setup Theme Selector (new dropdown)
function setupThemeSelector() {
    const selector = document.getElementById('theme-selector');
    if (!selector) return;

    // Load current theme
    const currentTheme = localStorage.getItem('selected-theme') || 'default';
    selector.value = currentTheme;

    selector.addEventListener('change', async () => {
        const themeId = selector.value;
        if (window.ThemeLoader) {
            await ThemeLoader.applyTheme(themeId);
        }
        localStorage.setItem('selected-theme', themeId);
        window.location.reload(); // Reload to fully apply theme
    });
}

// Helper: Load Categories (uses CategoryService if available)
async function loadCategories(rootPath) {
    const showR = localStorage.getItem('show_r_rated') === 'true';
    let categories = [];

    // Use CategoryService if available, fallback to direct query
    if (window.CategoryService) {
        try {
            categories = await CategoryService.getAll(showR);
        } catch (e) {
            console.error('Failed to load categories:', e);
            return;
        }
    } else if (window.AppUtils) {
        // Fallback for backward compatibility
        const sbClient = window.AppUtils.initSupabase();
        if (!sbClient) return;

        let query = sbClient.from('wiki_articles').select('category');
        if (!showR) {
            query = query.not("ratings", "in", '("M","P","X")');
        }

        const { data } = await query;
        if (data) {
            categories = [...new Set(data.map(i => i.category))].filter(Boolean).sort();
        }
    }

    const list = document.getElementById('category-list');
    list.innerHTML = `<li><a href="${rootPath}index.html">All</a></li>`;

    categories.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${rootPath}index.html?cat=${encodeURIComponent(cat)}">${cat}</a>`;
        list.appendChild(li);
    });
}

// Helper: Setup Back to Top button
function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
        }
    });
}
