// Shared Layout Injector
// Injects the table structure, uses centralized services, and provides interactive retro HUD features

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

    // CRT Scanline Effect
    if (localStorage.getItem('crtEffect') === 'true') {
        document.body.classList.add('crt-effect');
    }

    // Custom Font Size
    const savedFontSize = localStorage.getItem('articleFontSize');
    if (savedFontSize) {
        document.documentElement.style.setProperty('--font-size-article', savedFontSize + 'px');
    }

    // 3. Get root path using APP_CONFIG
    const rootPath = window.APP_CONFIG ? APP_CONFIG.getDepth() : './';

    // 4. Define Layout HTML
    const layoutHTML = `
    <!-- NEON READING PROGRESS BAR -->
    <div id="reading-progress-bar"></div>

    <!-- EXIT ZEN MODE FLOATING PILL -->
    <button id="btn-exit-zen" onclick="Layout.toggleZenMode()" title="Exit Zen Mode">✕ Exit Zen Mode</button>

    <!-- GLOBAL QUICK SEARCH MODAL -->
    <div id="quick-search-modal" class="retro-quick-search-overlay" onclick="if(event.target===this)Layout.toggleQuickSearch()">
        <div class="retro-quick-search-box">
            <div class="retro-quick-search-header">
                <span>🔍 WIKI QUICK SEARCH</span>
                <button onclick="Layout.toggleQuickSearch()" style="padding: 2px 8px; cursor: pointer;">✕</button>
            </div>
            <div class="retro-quick-search-body">
                <input type="text" id="quick-search-modal-input" placeholder="Type query and press Enter (e.g. react, web*, -draft)..." class="editor-input" style="width: 100%; box-sizing: border-box; padding: 8px; font-size: 13px;">
                <div style="font-size: 11px; color: #888; margin-top: 6px; font-family: monospace; display: flex; justify-content: space-between;">
                    <span>Press Enter to search entire wiki</span>
                    <span>[ESC] to close</span>
                </div>
            </div>
        </div>
    </div>

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
                            <!-- Left: Brand & Telemetry -->
                            <div class="header-brand">
                                <button onclick="Layout.toggleSidebar()" class="btn-header btn-hamburger" title="Toggle Menu" style="margin-right: 4px;">[≡]</button>
                                <a href="${rootPath}index.html" style="text-decoration: none; color: inherit; display: inline-flex; align-items: baseline; gap: 4px;">
                                    <span style="font-size: 22px; font-weight: bold; letter-spacing: -0.5px;">RetroWiki</span>
                                    <span style="font-size: 10px; vertical-align: super; color: #00ff66;">v3.2</span>
                                </a>
                                <!-- Live Telemetry Status Pill -->
                                <span class="header-status-pill" title="System Connection Status">
                                    <span class="status-dot-blink"></span>
                                    <span id="header-status-text">ONLINE</span>
                                    <span style="opacity: 0.5;">|</span>
                                    <span id="header-clock">--:--</span>
                                </span>
                            </div>

                            <!-- Right: Responsive Controls -->
                            <div class="header-controls">
                                <button onclick="Layout.toggleQuickSearch()" class="btn-header" title="Quick Search (Hotkey: /)">
                                    <span class="header-text-long">[ 🔍 Search ]</span>
                                    <span class="header-text-short">🔍</span>
                                </button>
                                <button onclick="Layout.zoom(-0.1)" class="btn-header" title="Zoom Out">[-]</button>
                                <button onclick="Layout.resetZoom()" class="btn-header" title="Reset Default Size">[D]</button>
                                <button onclick="Layout.zoom(0.1)" class="btn-header" title="Zoom In">[+]</button>
                                <button id="btn-zen" onclick="Layout.toggleZenMode()" class="btn-header" title="Toggle Zen Mode">
                                    <span class="header-text-long">[ Zen Mode ]</span>
                                    <span class="header-text-short">🧘</span>
                                </button>
                                <button id="btn-theme" onclick="Layout.toggleTheme()" class="btn-header" title="Toggle Theme">
                                    <span class="header-text-long">[ Theme ]</span>
                                    <span class="header-text-short">◑</span>
                                </button>
                            </div>
                        </div>
                    </td>
                </tr>

                <!-- MAIN BODY ROW -->
                <tr>
                    <!-- SIDEBAR -->
                    <td class="sidebar-cell" id="sidebar">
                        <div class="sidebar-mobile-header" style="text-align: right; margin-bottom: 10px; display: none;">
                            <button onclick="Layout.toggleSidebar()" class="btn-header" style="color: var(--accent-danger, #ff5566); padding: 4px 10px;">✕ Close Menu</button>
                        </div>

                        <div style="text-align: center; margin-bottom: 10px;">
                             <!-- Loading Spinner Placeholder -->
                             <span id="loading-indicator" style="display:none; color: var(--accent-amber, #ffb86c); background: var(--surface-header, #141a23); font-weight: bold; padding: 2px 6px; font-size: 11px; border: 1px solid var(--accent-amber, #ffb86c);">LOADING...</span>
                        </div>

                        <!-- Accordion 1: Navigation -->
                        <details open class="sidebar-accordion">
                            <summary>🧭 Navigation</summary>
                            <div class="sidebar-accordion-body">
                                <ul>
                                    <li><a href="${rootPath}index.html">🏠 Home / Index</a></li>
                                    <li><a href="${rootPath}pages/admin/editor.html">✍ Create Article</a></li>
                                    <li><a href="${rootPath}pages/admin/ai-creator.html">🤖 AI Creator</a></li>
                                    <li><a href="${rootPath}pages/admin/advanced-ai-creator.html">⚡ Advanced AI</a></li>
                                    <li><a href="${rootPath}pages/admin/json-importer.html">📥 JSON Importer</a></li>
                                    <li><a href="#" id="auth-link">🔒 Admin Login</a></li>
                                </ul>
                            </div>
                        </details>

                        <!-- Accordion 2: Categories (with Live Filter & Count Badges) -->
                        <details open class="sidebar-accordion">
                            <summary>📁 Categories</summary>
                            <div class="sidebar-accordion-body">
                                <input type="text" id="sidebar-cat-filter" placeholder="Filter categories..." oninput="Layout.filterSidebarCategories(this.value)" class="sidebar-filter-input">
                                <ul id="category-list">
                                    <li><a href="${rootPath}index.html" class="category-item"><span>All</span></a></li>
                                    <!-- Populated dynamically via JS -->
                                </ul>
                            </div>
                        </details>

                        <!-- Accordion 3: Tags -->
                        <details class="sidebar-accordion">
                            <summary>🏷 Tags</summary>
                            <div class="sidebar-accordion-body">
                                <ul id="tag-list">
                                    <li><a href="${rootPath}index.html">All Tags</a></li>
                                    <!-- Populated via JS -->
                                </ul>
                            </div>
                        </details>

                        <!-- Accordion 4: System Settings -->
                        <details class="sidebar-accordion">
                            <summary>⚙ System Settings</summary>
                            <div class="sidebar-accordion-body">
                                <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; color: var(--text-muted, #8a99ad);">Theme:</div>
                                <select id="theme-selector" style="width: 100%; font-size: 11px; margin-bottom: 8px;">
                                    <option value="default">Retro Classic</option>
                                    <option value="retro-green">Cyberpunk Terminal</option>
                                    <option value="light-mode">Light Mode</option>
                                    <option value="windows-98">Windows 98</option>
                                    <option value="minecraft">Minecraft</option>
                                </select>
                                
                                <div id="r-rated-container" style="margin-bottom: 8px; display: none;">
                                    <label style="font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                        <input type="checkbox" id="show-r-rated-checkbox">
                                         Show R Rated content
                                    </label>
                                </div>

                                <div>
                                    <label style="font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                                        <input type="checkbox" id="crt-effect-checkbox" onchange="Layout.toggleCrtEffect(this.checked)">
                                         CRT Monitor Scanlines
                                    </label>
                                </div>
                            </div>
                        </details>

                        <div style="text-align: center; margin-top: 15px; opacity: 0.8;">
                            <small style="font-size: 10px; color: var(--text-muted, #8a99ad);">Optimized for<br>Netscape 4.0 &amp; 800x600</small>
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
                        <!-- Visitor Counter -->
                        <div>
                            You are visitor number: 
                            <div class="visitor-counter" id="visitor-count">08472</div>
                        </div>

                        <!-- 88x31 Retro Pixel Badges -->
                        <div class="retro-badges-container">
                            <span class="retro-badge-88x31 retro-badge-netscape">
                                <span>NETSCAPE</span>
                                <span style="font-size: 7px; color: #fff;">NOW 4.0</span>
                            </span>
                            <span class="retro-badge-88x31 retro-badge-html">
                                <span>W3C HTML</span>
                                <span style="font-size: 7px; color: #fff;">4.01 VALID</span>
                            </span>
                            <span class="retro-badge-88x31 retro-badge-win98">
                                <span>MADE FOR</span>
                                <span style="font-size: 7px; color: #ffcc00;">WINDOWS 98</span>
                            </span>
                            <span class="retro-badge-88x31 retro-badge-dialup">
                                <span>56K DIALUP</span>
                                <span style="font-size: 7px; color: #00ff66;">FRIENDLY</span>
                            </span>
                        </div>

                        <!-- Quick Utility Links -->
                        <div class="footer-links">
                            <a href="javascript:void(0)" onclick="Layout.scrollToTop()">[ ▲ Back to Top ]</a>
                            &nbsp;|&nbsp;
                            <a href="${rootPath}index.html">[ 🏠 Home Index ]</a>
                            &nbsp;|&nbsp;
                            <a href="javascript:void(0)" onclick="Layout.goToRandomArticle()">[ 🎲 Random Article ]</a>
                            &nbsp;|&nbsp;
                            <a href="${rootPath}pages/admin/editor.html">[ ✍ Editor ]</a>
                        </div>

                        <!-- Brutalist Server Telemetry Bar -->
                        <div class="footer-telemetry">
                            SYS_STATUS: <span style="color: #00ff66;">ONLINE</span> &nbsp;|&nbsp;
                            LATENCY: <span style="color: #00ff66;">24ms</span> &nbsp;|&nbsp;
                            ENCODING: UTF-8 &nbsp;|&nbsp;
                            BUILD: 2026.09-SYS3.2
                        </div>

                        <div style="margin-top: 6px; font-size: 10px; color: #666;">
                            &copy; 1999-2025 RetroWiki Inc. All rights reserved. 
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- SIDEBAR OVERLAY -->
        <div id="sidebar-overlay" onclick="Layout.toggleSidebar()" style="display: none;"></div>

        <!-- Back to Top Button -->
        <button id="back-to-top" onclick="Layout.scrollToTop()">▲</button>

        <!-- Floating Controls Dock (Responsive, Collapsible & Auto-Fading) -->
        <div class="gallery-float-controls" id="float-controls">
            <button id="float-btn-toggle" onclick="Layout.toggleFloatDock()" title="Minimize / Expand Dock" class="btn-float-handle">
                <span id="float-dock-icon">⚙</span>
            </button>
            <div class="float-dock-content" id="float-dock-content">
                <button onclick="Layout.scrollToTop()" title="Scroll to Top" class="btn-float-action">▲</button>
                <button onclick="Layout.toggleSidebar()" title="Toggle Navigation Sidebar" class="btn-float-action">≡</button>
                <button id="float-btn-zen" onclick="Layout.toggleZenMode()" title="Toggle Zen Mode (Clean Reading)" class="btn-float-action">Z</button>
                <button id="float-btn-theme" onclick="Layout.toggleTheme()" title="Toggle Light / Dark Mode" class="btn-float-action">◑</button>

                <!-- Fullscreen & Fullscreen Exit Controls -->
                <div class="float-divider"></div>
                <button id="float-btn-fullscreen" onclick="Layout.enterFullscreen()" title="Fullscreen" class="btn-float-action">⛶</button>
                <button id="float-btn-exit-fullscreen" onclick="Layout.exitFullscreen()" title="Exit Fullscreen" class="btn-float-action">⤡</button>

                <!-- Gallery Column Controls (shown if gallery present) -->
                <div class="float-gallery-group" id="float-gallery-group">
                    <div class="float-divider"></div>
                    <button type="button" onclick="Layout.changeGalleryCols(-1)" title="Fewer Columns (Larger Images)" class="btn-float-action">−</button>
                    <div class="float-gallery-cols" id="float-gallery-cols" onclick="Layout.resetGalleryCols()" title="Columns (Click to reset to default)">3C</div>
                    <button type="button" onclick="Layout.changeGalleryCols(1)" title="More Columns (Smaller Images)" class="btn-float-action">+</button>
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
    setupCrtCheckbox();
    loadCategories(rootPath);
    initZoom();
    initClock();

    // Initialize theme loader if available
    if (window.ThemeLoader) {
        ThemeLoader.init();
    }

    // Update Toggle Button States
    updateToggleButtons();

    // Setup Reading Progress Bar & Back to Top & Dock Auto-Fade
    setupReadingProgress();
    setupBackToTop();
    initFloatDock();
    setupFloatDockAutoFade();
    setupGlobalKeyboardShortcuts(rootPath);
    setupFullscreenListeners();

    // Expose layout functions
    window.Layout = {
        toggleSidebar,
        toggleZenMode,
        toggleTheme,
        toggleCrtEffect,
        toggleQuickSearch,
        enterFullscreen,
        exitFullscreen,
        toggleFullscreen,
        isFullscreen,
        changeTextSize,
        resetTextSize,
        filterSidebarCategories,
        goToRandomArticle,
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

// ==========================================
// CLOCK & TELEMETRY
// ==========================================

function initClock() {
    function updateClock() {
        const el = document.getElementById('header-clock');
        if (!el) return;
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        el.textContent = `${hrs}:${mins}`;
    }
    updateClock();
    setInterval(updateClock, 10000);
}

// ==========================================
// READING PROGRESS BAR
// ==========================================

function setupReadingProgress() {
    function updateProgress() {
        const bar = document.getElementById('reading-progress-bar');
        if (!bar) return;

        const scrollContainer = document.querySelector('.layout-scroll');
        let scrollTop = 0;
        let scrollHeight = 0;
        let clientHeight = 0;

        if (scrollContainer && getComputedStyle(scrollContainer).overflowY === 'auto') {
            scrollTop = scrollContainer.scrollTop;
            scrollHeight = scrollContainer.scrollHeight;
            clientHeight = scrollContainer.clientHeight;
        } else {
            scrollTop = window.scrollY || document.documentElement.scrollTop;
            scrollHeight = document.documentElement.scrollHeight;
            clientHeight = window.innerHeight;
        }

        const maxScroll = scrollHeight - clientHeight;
        const pct = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
        bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    const scrollContainer = document.querySelector('.layout-scroll');
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', updateProgress, { passive: true });
    }
    updateProgress();
}

// ==========================================
// SIDEBAR TOGGLE & ACCORDION FILTERS
// ==========================================

function toggleSidebar() {
    if (window.innerWidth > 768) {
        toggleZenMode();
        return;
    }
    document.body.classList.toggle('sidebar-open');
    const overlay = document.getElementById('sidebar-overlay');
    if (document.body.classList.contains('sidebar-open')) {
        if (overlay) overlay.style.display = 'block';
    } else {
        if (overlay) overlay.style.display = 'none';
    }
}

let cachedSidebarCategories = [];

function filterSidebarCategories(query) {
    const filter = (query || '').toLowerCase().trim();
    const list = document.getElementById('category-list');
    if (!list) return;

    const items = list.querySelectorAll('li');
    items.forEach(li => {
        const text = (li.textContent || '').toLowerCase();
        if (!filter || text.includes(filter) || text.includes('all')) {
            li.style.display = '';
        } else {
            li.style.display = 'none';
        }
    });
}

// ==========================================
// CRT SCANLINE MONITOR EFFECT
// ==========================================

function setupCrtCheckbox() {
    const cb = document.getElementById('crt-effect-checkbox');
    if (!cb) return;
    cb.checked = localStorage.getItem('crtEffect') === 'true';
}

function toggleCrtEffect(enabled) {
    document.body.classList.toggle('crt-effect', enabled);
    localStorage.setItem('crtEffect', enabled);
    const cb = document.getElementById('crt-effect-checkbox');
    if (cb) cb.checked = enabled;
}

// ==========================================
// GLOBAL QUICK SEARCH MODAL
// ==========================================

function toggleQuickSearch(forceOpen) {
    const modal = document.getElementById('quick-search-modal');
    const input = document.getElementById('quick-search-modal-input');
    if (!modal) return;

    const shouldOpen = forceOpen !== undefined ? forceOpen : (modal.style.display !== 'flex');
    modal.style.display = shouldOpen ? 'flex' : 'none';

    if (shouldOpen && input) {
        input.value = '';
        setTimeout(() => input.focus(), 50);
    }
}

function setupGlobalKeyboardShortcuts(rootPath) {
    window.addEventListener('keydown', (e) => {
        const tag = (e.target.tagName || '').toLowerCase();
        const isInputActive = tag === 'input' || tag === 'textarea' || tag === 'select';

        // Modal Enter key to run search
        if (e.key === 'Enter' && e.target.id === 'quick-search-modal-input') {
            const query = e.target.value.trim();
            if (query) {
                window.location.href = `${rootPath}index.html?q=${encodeURIComponent(query)}`;
            }
            return;
        }

        // Escape closes quick search or sidebar
        if (e.key === 'Escape') {
            const modal = document.getElementById('quick-search-modal');
            if (modal && modal.style.display === 'flex') {
                toggleQuickSearch(false);
                return;
            }
            if (document.body.classList.contains('sidebar-open')) {
                toggleSidebar();
                return;
            }
        }

        if (isInputActive) return;

        // '/' key opens Quick Search anywhere (unless on index.html where index has its own search)
        if (e.key === '/') {
            const indexSearch = document.getElementById('search-input');
            if (indexSearch) {
                // Focus page's own search input if on index.html
                e.preventDefault();
                indexSearch.focus();
                indexSearch.select();
            } else {
                e.preventDefault();
                toggleQuickSearch(true);
            }
        }
    });
}

// ==========================================
// FULLSCREEN CONTROLS
// ==========================================

function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
}

function enterFullscreen() {
    const docEl = document.documentElement;
    if (!isFullscreen()) {
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen().catch(err => console.warn('Fullscreen request failed:', err));
        } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
            docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
            docEl.msRequestFullscreen();
        }
    }
    updateFullscreenButtons();
}

function exitFullscreen() {
    if (isFullscreen()) {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.warn('Exit fullscreen failed:', err));
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    updateFullscreenButtons();
}

function toggleFullscreen() {
    if (isFullscreen()) {
        exitFullscreen();
    } else {
        enterFullscreen();
    }
}

function updateFullscreenButtons() {
    const inFS = isFullscreen();
    const btnEnter = document.getElementById('float-btn-fullscreen');
    const btnExit = document.getElementById('float-btn-exit-fullscreen');

    if (btnEnter) {
        btnEnter.classList.toggle('active', inFS);
    }
    if (btnExit) {
        btnExit.classList.toggle('active', inFS);
    }
}

function setupFullscreenListeners() {
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
        document.addEventListener(evt, updateFullscreenButtons);
    });
}

// ==========================================
// TYPOGRAPHY RESIZE (A- / A+)
// ==========================================

let currentArticleFontSize = parseInt(localStorage.getItem('articleFontSize'), 10) || 14;

function changeTextSize(delta) {
    currentArticleFontSize = Math.min(Math.max(currentArticleFontSize + delta, 11), 22);
    document.documentElement.style.setProperty('--font-size-article', currentArticleFontSize + 'px');
    localStorage.setItem('articleFontSize', currentArticleFontSize);

    // Apply inline to article content if present
    const articleBody = document.querySelector('.article-content') || document.getElementById('view-article');
    if (articleBody) {
        articleBody.style.fontSize = currentArticleFontSize + 'px';
    }
}

function resetTextSize() {
    currentArticleFontSize = 14;
    document.documentElement.style.setProperty('--font-size-article', '14px');
    localStorage.removeItem('articleFontSize');
    const articleBody = document.querySelector('.article-content') || document.getElementById('view-article');
    if (articleBody) {
        articleBody.style.fontSize = '';
    }
}

// ==========================================
// RANDOM ARTICLE JUMPER
// ==========================================

async function goToRandomArticle() {
    if (!window.ArticleService) return;
    try {
        const showR = window.AppUtils ? await window.AppUtils.isRRatedAllowed() : false;
        const randomId = await ArticleService.getRandom(showR);
        if (randomId) {
            const rootPath = window.APP_CONFIG ? APP_CONFIG.getDepth() : './';
            window.location.href = `${rootPath}pages/article.html?id=${randomId}`;
        } else {
            alert("No articles found.");
        }
    } catch (e) {
        console.error("Failed jumping to random article:", e);
    }
}

// ==========================================
// ZOOM LOGIC
// ==========================================

let currentZoom = parseFloat(localStorage.getItem('pageZoom')) || 1.0;

function initZoom() {
    document.body.style.zoom = currentZoom;
}

function zoom(delta) {
    currentZoom += delta;
    currentZoom = Math.min(Math.max(currentZoom, 0.5), 2.0);
    document.body.style.zoom = currentZoom;
    localStorage.setItem('pageZoom', currentZoom);
}

function resetZoom() {
    currentZoom = 1.0;
    document.body.style.zoom = currentZoom;
    localStorage.setItem('pageZoom', currentZoom);
}

// ==========================================
// FLOAT DOCK CONTROLS & AUTO-FADE
// ==========================================

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

let floatDockFadeTimer = null;

function setupFloatDockAutoFade() {
    const dock = document.getElementById('float-controls');
    if (!dock) return;

    function wakeDock() {
        dock.classList.remove('dock-idle');
        clearTimeout(floatDockFadeTimer);
        floatDockFadeTimer = setTimeout(() => {
            dock.classList.add('dock-idle');
        }, 2500);
    }

    // Wake on scroll, mousemove, or touch
    window.addEventListener('scroll', wakeDock, { passive: true });
    window.addEventListener('mousemove', wakeDock, { passive: true });
    window.addEventListener('touchstart', wakeDock, { passive: true });

    // Keep active if hovered
    dock.addEventListener('mouseenter', () => {
        clearTimeout(floatDockFadeTimer);
        dock.classList.remove('dock-idle');
    });

    wakeDock();
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

// ==========================================
// GALLERY COLS LOGIC
// ==========================================

function getResponsiveDefaultCols() {
    if (window.getDefaultGalleryCols) return window.getDefaultGalleryCols();
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    return 3;
}

function changeGalleryCols(delta) {
    if (window.changeGalleryColumns) {
        window.changeGalleryColumns(delta);
    } else {
        const defaultCols = getResponsiveDefaultCols();
        const cols = (window.currentGalleryCols || defaultCols) + delta;
        const clamped = Math.min(Math.max(cols, 1), 6);
        window.currentGalleryCols = clamped;
        updateGalleryColsIndicator(clamped);
    }
}

function resetGalleryCols() {
    const defaultCols = getResponsiveDefaultCols();
    if (window.changeGalleryColumns) {
        const current = window.currentGalleryCols || defaultCols;
        window.changeGalleryColumns(defaultCols - current);
    } else {
        window.currentGalleryCols = defaultCols;
        updateGalleryColsIndicator(defaultCols);
    }
}

function updateGalleryColsIndicator(cols) {
    const el = document.getElementById('float-gallery-cols');
    if (el) {
        const defaultCols = getResponsiveDefaultCols();
        const val = (cols !== undefined && cols !== null) ? cols : (window.currentGalleryCols || defaultCols);
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

// ==========================================
// BUTTON STATES & TOGGLES
// ==========================================

function updateToggleButtons() {
    // Zen (Header + Float Dock)
    const isZen = document.body.classList.contains('zen-mode');
    const btnZen = document.getElementById('btn-zen');
    const floatBtnZen = document.getElementById('float-btn-zen');
    if (btnZen) btnZen.classList.toggle('active', isZen);
    if (floatBtnZen) floatBtnZen.classList.toggle('active', isZen);

    const colSidebar = document.querySelector('.col-sidebar');
    const colContent = document.querySelector('.col-content');
    if (colSidebar && colContent) {
        colSidebar.style.width = isZen ? '0px' : '';
        colSidebar.style.display = isZen ? 'none' : '';
        colContent.style.width = isZen ? '100%' : '';
    }

    // Theme (Header + Float Dock)
    const isLight = document.body.dataset.theme === 'light' || localStorage.getItem('theme') === 'light' || localStorage.getItem('selected-theme') === 'light-mode';
    const btnTheme = document.getElementById('btn-theme');
    const floatBtnTheme = document.getElementById('float-btn-theme');
    if (btnTheme) btnTheme.classList.toggle('active', isLight);
    if (floatBtnTheme) {
        floatBtnTheme.classList.toggle('active', isLight);
        floatBtnTheme.textContent = isLight ? '☼' : '◑';
    }

    // Fullscreen state
    updateFullscreenButtons();
}

async function toggleTheme() {
    const currentId = localStorage.getItem('selected-theme') || 'default';
    const isLight = currentId === 'light-mode';
    let newThemeId = isLight ? 'default' : 'light-mode';

    if (window.ThemeLoader) {
        await ThemeLoader.applyTheme(newThemeId);
    }

    localStorage.setItem('selected-theme', newThemeId);
    const selector = document.getElementById('theme-selector');
    if (selector) selector.value = newThemeId;

    updateToggleButtons();
}

function toggleZenMode() {
    document.body.classList.toggle('zen-mode');
    const isZen = document.body.classList.contains('zen-mode');
    localStorage.setItem('zenMode', isZen);
    updateToggleButtons();
    window.dispatchEvent(new Event('resize'));
}

async function updateAuthLink(rootPath) {
    if (!window.AppUtils) return;
    const sbClient = window.AppUtils.initSupabase();
    if (!sbClient) return;

    const user = await window.AppUtils.checkAuth(sbClient);
    const link = document.getElementById('auth-link');
    if (!link) return;

    if (user) {
        link.textContent = "🚪 Logout";
        link.href = "#";
        link.onclick = async (e) => {
            e.preventDefault();
            await sbClient.auth.signOut();
            localStorage.setItem('show_r_rated', 'false');
            window.location.href = rootPath + "index.html";
        };
    } else {
        link.textContent = "🔒 Admin Login";
        link.href = rootPath + "pages/admin/login.html";
        link.onclick = null;
    }
}

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

async function setupThemeSelector() {
    const selector = document.getElementById('theme-selector');
    if (!selector) return;

    if (window.ThemeLoader) {
        try {
            const registry = await ThemeLoader.loadRegistry();
            if (registry && registry.themes) {
                selector.innerHTML = '';
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

    const currentTheme = localStorage.getItem('selected-theme') || 'default';
    selector.value = currentTheme;

    selector.addEventListener('change', async () => {
        const themeId = selector.value;
        if (window.ThemeLoader) {
            await ThemeLoader.applyTheme(themeId);
        }
        localStorage.setItem('selected-theme', themeId);
        updateToggleButtons();
    });
}

// ==========================================
// CATEGORIES WITH ARTICLE COUNTS
// ==========================================

async function loadCategories(rootPath) {
    const showR = window.AppUtils ? await window.AppUtils.isRRatedAllowed() : false;
    let categories = [];

    if (window.CategoryService && window.CategoryService.getCategoriesWithCounts) {
        try {
            categories = await CategoryService.getCategoriesWithCounts(showR);
        } catch (e) {
            console.warn('Failed to load categories with counts:', e);
        }
    }

    // Fallback if getCategoriesWithCounts didn't return
    if (!categories || categories.length === 0) {
        if (window.CategoryService) {
            try {
                const names = await CategoryService.getAll(showR);
                categories = names.map(n => ({ category: n, count: 0 }));
            } catch (e) {}
        }
    }

    cachedSidebarCategories = categories;

    const list = document.getElementById('category-list');
    if (!list) return;

    // Detect active category from URL
    const activeCat = window.AppUtils ? AppUtils.getParam('cat') : null;

    list.innerHTML = `<li><a href="${rootPath}index.html" class="category-item ${!activeCat ? 'active-category' : ''}"><span>[ All Categories ]</span></a></li>`;

    categories.forEach(item => {
        const cat = item.category;
        const count = item.count;
        const isActive = (activeCat === cat);

        const li = document.createElement('li');
        li.innerHTML = `
            <a href="${rootPath}index.html?cat=${encodeURIComponent(cat)}" class="category-item ${isActive ? 'active-category' : ''}">
                <span>${cat}</span>
                ${count > 0 ? `<span class="category-count-badge">[${count}]</span>` : ''}
            </a>
        `;
        list.appendChild(li);
    });
}

function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    function checkScroll() {
        const scrollContainer = document.querySelector('.layout-scroll');
        const scrollY = (scrollContainer && getComputedStyle(scrollContainer).overflowY === 'auto') 
            ? scrollContainer.scrollTop 
            : window.scrollY;

        btn.style.display = (scrollY > 300) ? 'block' : 'none';
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    const scrollContainer = document.querySelector('.layout-scroll');
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', checkScroll, { passive: true });
    }
}
