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
    <div id="layout-wrapper">
        <div class="layout-scroll">
            <table class="main-layout" border="1" cellpadding="0" cellspacing="0">
                <colgroup>
                    <col class="col-sidebar">
                    <col class="col-content">
                </colgroup>
                <!-- HEADER ROW -->
                <tr>
                    <td colspan="2" class="header-cell">
                        <div class="header-content">
                            <div style="display: flex; align-items: center;">
                                <button onclick="Layout.toggleSidebar()" class="btn-header btn-hamburger" title="Toggle Menu" style="margin-right: 10px;">[≡]</button>
                                <a href="${rootPath}index.html" style="text-decoration: none; color: inherit;">
                                    <span style="font-size: 24px; font-weight: bold;">RetroWiki</span>
                                    <span style="font-size: 10px; vertical-align: super;">v3.0</span>
                                </a>
                            </div>
                            <div>
                                <button onclick="Layout.zoom(-0.1)" class="btn-header" title="Zoom Out">[-]</button>
                                <button onclick="Layout.resetZoom()" class="btn-header" title="Reset Default Size">[D]</button>
                                <button onclick="Layout.zoom(0.1)" class="btn-header" title="Zoom In">[+]</button>
                                <button id="btn-zen" onclick="Layout.toggleZenMode()" class="btn-header">[ Zen Mode ]</button>
                                <button id="btn-theme" onclick="Layout.toggleTheme()" class="btn-header">[ Light Mode ]</button>
                            </div>
                        </div>
                    </td>
                </tr>

                <!-- MAIN BODY ROW -->
                <tr>
                    <!-- SIDEBAR -->
                    <td class="sidebar-cell" id="sidebar">
                        <div class="sidebar-mobile-header" style="text-align: right; margin-bottom: 10px; display: none;">
                            <button onclick="Layout.toggleSidebar()" class="btn-header" style="color: red;">[X] Close</button>
                        </div>

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

                        <b>Tags</b>
                        <ul id="tag-list">
                            <li><a href="${rootPath}/pages/other/tags.html">All</a></li>
                            <!-- Populated via JS -->
                        </ul>

                        <hr>
                        
                        <div style="margin-bottom: 20px;">
                            <details>
                                <summary style="font-size: 12px; cursor: pointer; font-weight: bold; margin-bottom: 5px;">Settings</summary>
                                
                                <div style="font-size: 12px; font-weight: bold; margin-top: 10px;">Theme:<br>L - Lightweight<br>H - Heavy</div>
                                <select id="theme-selector" style="width: 100%; font-size: 11px; margin-top: 5px;">
                                    <option value="default">Retro Classic</option>
                                    <option value="retro-green">Cyberpunk Terminal</option>
                                    <option value="light-mode">Light Mode</option>
                                    <option value="windows-98">Windows 98</option>
                                    <option value="minecraft">Minecraft</option>
                                </select>
                                
                                <br><br>
                                
                                <div id="r-rated-container" style="margin-left: 5px; display: none;">
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
        </div>

        <!-- SIDEBAR OVERLAY -->
        <div id="sidebar-overlay" onclick="Layout.toggleSidebar()" style="display: none;"></div>

        <!-- Back to Top Button -->
        <button id="back-to-top" onclick="
            const scrollContainer = document.querySelector('.layout-scroll');
            if (scrollContainer && getComputedStyle(scrollContainer).overflowY === 'auto') {
                scrollContainer.scrollTo({top: 0, behavior: 'smooth'});
            } else {
                window.scrollTo({top: 0, behavior: 'smooth'});
            }
        ">
            ▲
        </button>

        <!-- Floating Controls Dock (Responsive & Collapsible) -->
        <div class="gallery-float-controls" id="float-controls">
            <button id="float-btn-toggle" onclick="Layout.toggleFloatDock()" title="Minimize / Expand Dock" class="btn-float-handle">
                <span id="float-dock-icon">⚙</span>
            </button>
            <div class="float-dock-content" id="float-dock-content">
                <button onclick="Layout.scrollToTop()" title="Scroll to Top" class="btn-float-action">▲</button>
                <button onclick="Layout.toggleSidebar()" title="Toggle Navigation Sidebar" class="btn-float-action">≡</button>
                <button id="float-btn-zen" onclick="Layout.toggleZenMode()" title="Toggle Zen Mode (Clean Reading)" class="btn-float-action">Z</button>
                <button id="float-btn-theme" onclick="Layout.toggleTheme()" title="Toggle Light / Dark Mode" class="btn-float-action">◑</button>

                <div class="float-gallery-group" id="float-gallery-group">
                    <div class="float-divider"></div>
                    <button onclick="Layout.changeGalleryCols(-1)" title="Fewer Columns (Larger Images)" class="btn-float-action">−</button>
                    <div class="float-gallery-cols" id="float-gallery-cols" onclick="Layout.resetGalleryCols()" title="Columns (Click to reset to 3)">3C</div>
                    <button onclick="Layout.changeGalleryCols(1)" title="More Columns (Smaller Images)" class="btn-float-action">+</button>
                </div>

                <div class="float-divider"></div>
                <button onclick="Layout.scrollToBottom()" title="Scroll to Bottom" class="btn-float-action">▼</button>
            </div>
        </div>
    </div>
    `;

    // 5. Inject
    document.body.innerHTML = layoutHTML;
    document.getElementById('main-content-cell').innerHTML = originalContent;

    // 6. Post-Inject Logic
    updateAuthLink(rootPath);
    setupRRatedCheckbox();
    setupThemeSelector();
    loadCategories(rootPath);
    initZoom(); // New Zoom Init

    // Initialize theme loader if available
    if (window.ThemeLoader) {
        ThemeLoader.init();
    }

    // Update Toggle Button States
    updateToggleButtons();

    // Setup Back to Top button & Floating Controls Dock
    setupBackToTop();
    initFloatDock();

    // Expose layout functions
    window.Layout = {
        toggleSidebar,
        toggleZenMode,
        toggleTheme,
        zoom,
        resetZoom,
        changeGalleryCols,
        resetGalleryCols,
        updateGalleryColsIndicator,
        checkGalleryPresence,
        scrollToTop,
        scrollToBottom,
        toggleFloatDock
    };
}

// SIDEBAR TOGGLE LOGIC
function toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
    const overlay = document.getElementById('sidebar-overlay');
    if (document.body.classList.contains('sidebar-open')) {
        if (overlay) overlay.style.display = 'block';
    } else {
        if (overlay) overlay.style.display = 'none';
    }
}

// ZOOM LOGIC
let currentZoom = parseFloat(localStorage.getItem('pageZoom')) || 1.0;

function initZoom() {
    document.body.style.zoom = currentZoom;
}

function zoom(delta) {
    currentZoom += delta;
    // Clamp zoom between 0.5x and 2.0x
    currentZoom = Math.min(Math.max(currentZoom, 0.5), 2.0);
    document.body.style.zoom = currentZoom;
    localStorage.setItem('pageZoom', currentZoom);
}

function resetZoom() {
    currentZoom = 1.0;
    document.body.style.zoom = currentZoom;
    localStorage.setItem('pageZoom', currentZoom);
}

// FLOAT DOCK CONTROLS & HELPERS
function initFloatDock() {
    const isMinimized = localStorage.getItem('floatDockMinimized') === 'true';
    const dock = document.getElementById('float-controls');
    const icon = document.getElementById('float-dock-icon');
    if (dock && isMinimized) {
        dock.classList.add('minimized');
        if (icon) icon.textContent = '+';
    }
    checkGalleryPresence();
}

function toggleFloatDock() {
    const dock = document.getElementById('float-controls');
    const icon = document.getElementById('float-dock-icon');
    if (!dock) return;
    dock.classList.toggle('minimized');
    const isMinimized = dock.classList.contains('minimized');
    if (icon) icon.textContent = isMinimized ? '+' : '⚙';
    localStorage.setItem('floatDockMinimized', isMinimized);
}

function scrollToTop() {
    const scrollContainer = document.querySelector('.layout-scroll');
    if (scrollContainer && getComputedStyle(scrollContainer).overflowY === 'auto') {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToBottom() {
    const scrollContainer = document.querySelector('.layout-scroll');
    if (scrollContainer && getComputedStyle(scrollContainer).overflowY === 'auto') {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
    }
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// GALLERY COLS LOGIC
function changeGalleryCols(delta) {
    if (window.changeGalleryColumns) {
        window.changeGalleryColumns(delta);
    } else {
        const cols = (window.currentGalleryCols || 3) + delta;
        const clamped = Math.min(Math.max(cols, 1), 6);
        window.currentGalleryCols = clamped;
        updateGalleryColsIndicator(clamped);
    }
}

function resetGalleryCols() {
    if (window.changeGalleryColumns) {
        const current = window.currentGalleryCols || 3;
        window.changeGalleryColumns(3 - current);
    } else {
        window.currentGalleryCols = 3;
        updateGalleryColsIndicator(3);
    }
}

function updateGalleryColsIndicator(cols) {
    const el = document.getElementById('float-gallery-cols');
    if (el) {
        const val = cols || window.currentGalleryCols || 3;
        el.textContent = val + 'C';
    }
}

function checkGalleryPresence() {
    const group = document.getElementById('float-gallery-group');
    if (!group) return;
    const hasGalleries = document.querySelector('.retro-gallery') !== null;
    group.style.display = hasGalleries ? 'flex' : 'none';
    if (hasGalleries) {
        updateGalleryColsIndicator();
    }
}

// UPDATE BTN STATES
function updateToggleButtons() {
    // Zen (Header + Float Dock)
    const isZen = document.body.classList.contains('zen-mode');
    const btnZen = document.getElementById('btn-zen');
    const floatBtnZen = document.getElementById('float-btn-zen');
    if (btnZen) btnZen.classList.toggle('active', isZen);
    if (floatBtnZen) floatBtnZen.classList.toggle('active', isZen);

    // Theme (Header + Float Dock)
    const isLight = document.body.dataset.theme === 'light' || localStorage.getItem('theme') === 'light' || localStorage.getItem('selected-theme') === 'light-mode';
    const btnTheme = document.getElementById('btn-theme');
    const floatBtnTheme = document.getElementById('float-btn-theme');
    if (btnTheme) btnTheme.classList.toggle('active', isLight);
    if (floatBtnTheme) {
        floatBtnTheme.classList.toggle('active', isLight);
        floatBtnTheme.textContent = isLight ? '☼' : '◑';
    }
}

// Helper: Toggle Theme
async function toggleTheme() {
    // Current state check
    const currentId = localStorage.getItem('selected-theme') || 'default';
    const isLight = currentId === 'light-mode';

    let newThemeId = 'default';
    if (!isLight) {
        newThemeId = 'light-mode';
    }

    // Apply via ThemeLoader (No Reload!)
    if (window.ThemeLoader) {
        await ThemeLoader.applyTheme(newThemeId);
    }

    // Update State
    localStorage.setItem('selected-theme', newThemeId);

    // Update UI elements
    const selector = document.getElementById('theme-selector');
    if (selector) selector.value = newThemeId;

    updateToggleButtons();
}

// Helper: Toggle Zen
function toggleZenMode() {
    document.body.classList.toggle('zen-mode');
    const isZen = document.body.classList.contains('zen-mode');
    localStorage.setItem('zenMode', isZen);
    updateToggleButtons();
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
            localStorage.setItem('show_r_rated', 'false');
            window.location.href = rootPath + "index.html";
        };
    } else {
        link.textContent = "Admin Login";
        link.href = rootPath + "pages/admin/login.html";
        link.onclick = null;
    }
}

// Helper: Setup R-rated Checkbox (visible only when logged in)
async function setupRRatedCheckbox() {
    const container = document.getElementById('r-rated-container');
    const cb = document.getElementById('show-r-rated-checkbox');
    if (!cb) return;

    if (window.AppUtils) {
        const sbClient = window.AppUtils.initSupabase();
        if (sbClient) {
            const user = await window.AppUtils.checkAuth(sbClient);
            if (user) {
                if (container) container.style.display = 'block';
            } else {
                if (container) container.style.display = 'none';
                localStorage.setItem('show_r_rated', 'false');
                return;
            }
        }
    }

    const isChecked = localStorage.getItem('show_r_rated') === 'true';
    cb.checked = isChecked;

    cb.addEventListener('change', () => {
        localStorage.setItem('show_r_rated', cb.checked);
        window.location.reload();
    });
}

// Helper: Setup Theme Selector (new dropdown)
async function setupThemeSelector() {
    const selector = document.getElementById('theme-selector');
    if (!selector) return;

    // Dynamic Population from Registry
    if (window.ThemeLoader) {
        try {
            const registry = await ThemeLoader.loadRegistry();
            if (registry && registry.themes) {
                selector.innerHTML = ''; // Clear hardcoded
                registry.themes.forEach(theme => {
                    const option = document.createElement('option');
                    option.value = theme.id;
                    option.textContent = theme.name;
                    selector.appendChild(option);
                });
            }
        } catch (e) {
            console.warn("Error populating theme selector", e);
        }
    }

    // Load current theme
    const currentTheme = localStorage.getItem('selected-theme') || 'default';
    selector.value = currentTheme;

    selector.addEventListener('change', async () => {
        const themeId = selector.value;
        if (window.ThemeLoader) {
            await ThemeLoader.applyTheme(themeId);
        }
        localStorage.setItem('selected-theme', themeId);
        // NO RELOAD NEEDED
        updateToggleButtons();
    });
}

// Helper: Load Categories (uses CategoryService if available)
async function loadCategories(rootPath) {
    const showR = window.AppUtils ? await window.AppUtils.isRRatedAllowed() : false;
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
