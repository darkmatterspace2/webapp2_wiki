# RetroWiki 2k25 — Comprehensive Project Context & Architecture

> **Aesthetic & Vision**: A brutalist, late-90s / early-2000s serverless wiki application designed with HTML `<table>` layouts, monospaced typography, zero border-radii, classic hyperlink styling, and multi-theme personalization, powered by vanilla web technologies and Supabase.

---

## 1. Project Overview & Guiding Principles

### Core Identity
- **Name**: RetroWiki 2k25 (v3.0)
- **Tech Stack**: Vanilla HTML5, Vanilla CSS3 (Custom Properties), Vanilla ES6+ JavaScript, and **Supabase** (PostgreSQL Database + Object Storage + GoTrue Auth).
- **Zero Build Tools**: No webpack, Vite, bundlers, Babel, npm dependencies, or runtime compilers. Every file runs directly in the browser.

### Key Architectural & Design Rules
1. **Layout Rule**: Core page layout must rely on HTML `<table>` elements (`.main-layout`). **Never** use CSS Flexbox or Grid for the outer page shell. Flexbox is permitted only for micro-components (e.g., toolbar ribbon, masonry gallery flex columns).
2. **Retro Brutalist Aesthetics**:
   - **Zero Border-Radius**: All buttons, inputs, tables, containers, and dialogs must have `border-radius: 0`.
   - **Classic Hyperlinks**: Blue (`#0000ee`) unvisited, Purple (`#551a8b`) visited, standard underline, or theme-scoped retro palette.
   - **Monospaced & Web-Safe Typography**: Courier New, Lucida Console, Monaco, system monospaced, and fallbacks.
   - **Vintage Controls**: Bracketed buttons (e.g., `[ Edit ]`, `[+]`, `[-]`, `[X]`), inset/outset beveled borders, and scanline terminal aesthetics.
3. **Two-Phase Article Storage**:
   - **Always** upload the raw HTML payload to Supabase Storage (`wiki-content` bucket) **first**.
   - Obtain the generated `bucket_path`.
   - **Then** insert or update the article metadata record in the `wiki_articles` database table with the `bucket_path`.
4. **Centralized Service Access**: Never execute raw Supabase queries directly inside inline HTML event handlers. Always route through `ArticleService`, `StorageService`, `CategoryService`, or `AppUtils`.
5. **Path Portability**: All pages and layout scripts must resolve relative roots using `APP_CONFIG.getDepth()` so the app runs identically from root (`index.html`), subdirectories (`pages/`), or sub-subdirectories (`pages/admin/`, `pages/other/`).

---

## 2. Directory & File Structure

```
webapp2_wiki/
├── index.html                      # Public Home: Booru search, A-Z jump bar, category filters, paginated list
├── CONTEXT.md                      # Primary project context & documentation (this file)
├── generate-config.ps1             # PowerShell script: compiles .devops/.env into src/config/supabase.config.js
├── generate-config.sh              # Bash script: compiles .devops/.env into src/config/supabase.config.js
├── .devops/
│   └── .env                        # Local environment variables & API keys (gitignored)
├── css/
│   ├── main.css                    # Master stylesheet importing core/ and components/
│   ├── core/
│   │   ├── tokens.css              # Global CSS custom properties (colors, borders, fonts)
│   │   ├── reset.css               # HTML reset enforcing zero border-radius & box-sizing
│   │   ├── layout.css              # Main table layout structure, zen mode, zoom rules
│   │   └── utilities.css           # Utility classes (text alignments, visibilities, helpers)
│   ├── components/
│   │   ├── header.css              # Header bar, branding, zoom, and theme toggles
│   │   ├── sidebar.css             # Left sidebar navigation, category lists, mobile drawer
│   │   ├── content.css             # Main article content area styling
│   │   ├── articles.css            # Article card items, jump links, pagination indicators
│   │   ├── forms.css               # Form inputs, selects, textareas, checkboxes
│   │   ├── buttons.css             # Retro bracketed and beveled button variants
│   │   ├── gallery.css             # Masonry gallery layout (.retro-gallery), captions, float controls
│   │   ├── modal.css               # Preview overlays, confirmation dialogs, lightbox modal
│   │   └── footer.css              # Footer layout and copyright notices
│   └── themes/
│       ├── themes.json             # Registry of all installed themes
│       ├── default/theme.css       # Retro Classic (dark retro aesthetic)
│       ├── dark-theme/theme.css    # Premium glassmorphism dark theme with cyan accents
│       ├── light-mode/theme.css    # Clean high-contrast light theme
│       ├── windows-98/theme.css    # Classic Win98 3D beveled borders & teal desktop
│       ├── retro-green/theme.css   # Cyberpunk green-on-black CRT terminal with scanlines
│       ├── nes-classic/theme.css   # 8-bit Nintendo pixel-art styling
│       ├── medieval/theme.css      # Ancient RPG parchment scroll theme
│       ├── luxury/theme.css        # Elegant dark luxury theme
│       ├── raunchy/theme.css       # Bold neon palette
│       ├── raunchy-3/theme.css     # Neon pink edition III
│       └── raunchy-4/theme.css     # Neon pink edition IV
├── pages/
│   ├── article.html                # Public article view: fetches HTML body, lightbox, views counter
│   ├── other/
│   │   └── tags.html               # Tag cloud page with frequency sizing and alphabetical grouping
│   └── admin/
│       ├── login.html              # Admin login & signup (Supabase GoTrue Auth)
│       ├── editor.html             # Advanced article editor (Raw HTML, WYSIWYG, Preview, Scraping)
│       ├── editor_bkp.html         # Editor fallback backup
│       ├── ai-creator.html         # Basic AI generator (Google Gemini)
│       ├── advanced-ai-creator.html# Multi-provider AI Studio (Gemini, GPT-4o, Claude 3.5, Grok)
│       ├── json-importer.html      # Batch JSON import with Wikipedia infobox prompt templates
│       └── modules/
│           ├── editor.core.js      # State, auth guard, auto-save, categories, tag chips, save lifecycle
│           ├── editor.wysiwyg.js   # Word-style WYSIWYG ribbon, floating media inspector, clipboard paste
│           ├── editor.toolbar.js   # HTML snippet insertion toolbar (Bold, Header, Table, Media, etc.)
│           ├── editor.preview.js   # Live preview renderer with dynamic gallery column calculation
│           ├── editor.tabs.js      # Tab switching between Editor, WYSIWYG, Fetch, and AI
│           └── editor.fetch.js     # Image extractor tool from pasted HTML sources
├── src/
│   ├── config/
│   │   ├── app.config.js           # Feature flags, basePath, dynamic depth calculator (APP_CONFIG)
│   │   ├── supabase.config.js      # Generated runtime config (Supabase URL, Anon Key, AI keys)
│   │   └── supabase.config.example.js # Template for environment config
│   ├── services/
│   │   ├── article.service.js      # Supabase CRUD, Booru search, tag normalization, archives, stats
│   │   ├── storage.service.js      # Supabase Storage operations (bucket upload/download/delete)
│   │   └── category.service.js     # Unique category queries and article counts
│   └── shared/
│       ├── utils.js                # AppUtils: initSupabase, checkAuth, getParam, formatDate, showLoading
│       ├── layout.js               # Shared Layout Injector: builds retro table frame on every page
│       ├── theme-loader.js         # ThemeLoader: dynamic theme switcher with localStorage persistence
│       └── lightbox.js             # Lightbox: fullscreen image viewer with Fit/Original/Crop/Stretch & Drag-Pan
└── Readme/                         # Setup guides, prompt templates, and feature specifications
```

---

## 3. Database Schema & Storage Architecture

The application adopts a **hybrid storage pattern**: structured metadata is indexed in PostgreSQL via Supabase Database, while potentially large HTML body content is stored as individual files in Supabase Storage.

### PostgreSQL Table: `wiki_articles`

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary Key |
| `title` | `text` | *required* | Article headline / title |
| `category` | `text` | *required* | Primary classification category |
| `tags` | `text[]` | `'{}'` | Normalized tag array (e.g. `['react', 'web_dev']`) |
| `ratings` | `text` | `'NR'` | Content rating: `NR` (Not Rated), `M` (Mature), `P` (Prohibited), `X` (Restricted) |
| `bucket_path` | `text` | *required* | Path to HTML file in Supabase Storage |
| `views` | `int` | `0` | Incremental view count |
| `user_id` | `uuid` | `null` | Optional reference to `auth.users(id)` |
| `created_at` | `timestamptz`| `now()` | Creation timestamp |
| `updated_at` | `timestamptz`| `now()` | Last update timestamp |

### Supabase Storage Bucket: `wiki-content`
- Content is saved as raw HTML files partitioned by date and title:
  ```
  data/posts/YYYY/MM/DD/HH/[timestamp]_[sanitized_title].html
  ```
- Public bucket can be enabled for reading; authenticated policies are enforced for uploads, updates, and deletions.

### Row Level Security (RLS) Policies
```sql
alter table wiki_articles enable row level security;

-- Public can view all articles
create policy "Public Articles are viewable by everyone"
  on wiki_articles for select using ( true );

-- Only authenticated users (Admins) can modify articles
create policy "Admins can insert articles"
  on wiki_articles for insert with check ( auth.role() = 'authenticated' );

create policy "Admins can update articles"
  on wiki_articles for update using ( auth.role() = 'authenticated' );

create policy "Admins can delete articles"
  on wiki_articles for delete using ( auth.role() = 'authenticated' );
```

---

## 4. Services & Core Modules

### 1. `ArticleService` ([`src/services/article.service.js`](file:///c:/MyDrive_1/project_2/Github-Repo/github_account_2/webapp2_wiki/src/services/article.service.js))
- **`_normalizeTags(articleData)`**: Trims whitespace, forces lowercase, converts internal spaces to underscores (`foo bar` -> `foo_bar`), and strips special characters (`[!@#$%^&*...+...]`).
- **`_parseSearchQuery(searchStr)`**: Parses advanced Booru-style search tokens:
  - `word`: Matched against title and tags.
  - `tag1 tag2`: Must contain **both** tags (AND condition).
  - `-tag`: Must **not** contain tag (NOT condition).
  - `~tag1 ~tag2`: Contains **either** tag (OR condition).
  - `prefix*`: Wildcard prefix match.
- **`getList(options)`**:
  - Accepts `page`, `limit`, `category`, `search`, `showRRated`, `sortBy` (`created_at`, `updated_at`, `views`, `title`), `sortAsc`, `dateFrom`, `dateTo`.
  - When advanced search tokens are detected, fetches a broader candidate batch (up to 500) and executes accurate multi-clause filtering client-side before paginating.
- **`getById(id)`**: Fetches a single article row by UUID.
- **`getRandom(showRRated)`**: Returns a random article ID for a "Random Article" feature.
- **`getStats(showRRated)`**: Aggregates total articles, total views, and unique category count.
- **`getArchiveIndex(showRRated)`**: Builds a Year -> Month -> Count archive tree.
- **`getPopularTags(limit, showRRated)`** & **`getAllTags(showRRated)`**: Frequency-sorted tag aggregation.
- **`create(data)`**, **`update(id, updates)`**, **`delete(id)`**, **`incrementViews(id, currentViews)`**.

### 2. `StorageService` ([`src/services/storage.service.js`](file:///c:/MyDrive_1/project_2/Github-Repo/github_account_2/webapp2_wiki/src/services/storage.service.js))
- **`generateArticlePath(title)`**: Computes date-partitioned storage key.
- **`uploadArticle(title, content)`**: Uploads HTML content to `wiki-content` bucket, returning the bucket key.
- **`downloadAsText(path)`**: Downloads HTML payload from storage as a UTF-8 string.
- **`delete(path)`**: Removes an HTML file from the bucket upon article deletion.
- **`getPublicUrl(path)`**: Generates public storage URL.

### 3. `CategoryService` ([`src/services/category.service.js`](file:///c:/MyDrive_1/project_2/Github-Repo/github_account_2/webapp2_wiki/src/services/category.service.js))
- **`getAll(showRRated)`**: Retrieves a deduplicated, alphabetically sorted list of categories.
- **`getCategoriesWithCounts(showRRated)`**: Returns `{ category, count }` objects for sidebar navigation counters.

### 4. `AppUtils` ([`src/shared/utils.js`](file:///c:/MyDrive_1/project_2/Github-Repo/github_account_2/webapp2_wiki/src/shared/utils.js))
- **`initSupabase()`**: Initializes the Supabase client with explicit `localStorage` persistence (bypassing IndexedDB issues on certain mobile browsers).
- **`checkAuth(supabase)`**: Verifies whether an active user session exists.
- **`isRRatedAllowed()`**: Returns `true` only if the user is authenticated **and** has explicitly checked `show_r_rated` in settings.
- **`getParam(name)`**: Reads URL query string parameters.
- **`formatDate(dateStr)`**: Formats dates into localized strings.
- **`showLoading(show)`**: Toggles the global `#loading-indicator` element.

### 5. `APP_CONFIG` ([`src/config/app.config.js`](file:///c:/MyDrive_1/project_2/Github-Repo/github_account_2/webapp2_wiki/src/config/app.config.js))
- **`getDepth()`**: Inspects `window.location.pathname` to calculate the relative path prefix back to the root (`./`, `../`, or `../../`). Prevents broken asset paths across nested directories.
- **`features`**: Feature flags for `themes`, `rRatedFilter`, and `zenMode`.

---

## 5. UI Architecture & Shared Systems

### Shared Layout Injector (`src/shared/layout.js`)
On `DOMContentLoaded`, `initLayout()` dynamically captures the page's original inner markup and wraps it into a classic HTML table framework:
1. **Header Row**:
   - Mobile hamburger toggle (`[≡]`) controlling the sidebar drawer.
   - RetroWiki title & version badge linking back to `index.html`.
   - Page zoom controls: `[-]` (zoom out), `[D]` (reset to 100%), `[+]` (zoom in) scaling CSS `zoom` from 0.5x to 2.0x.
   - Zen Mode button `[ Zen Mode ]`: hides header and sidebar for distraction-free reading.
   - Quick Theme toggle `[ Light Mode ]` / `[ Dark Mode ]`.
2. **Body Row (`.main-layout`)**:
   - **Sidebar Cell (`.sidebar-cell`)**:
     - Navigation links: Home / Search, Create New, AI Creator, Advanced Creator, JSON Importer, Tags Cloud, Admin Login/Logout (dynamic label and action depending on auth state).
     - Category list: Dynamically loaded from `CategoryService`.
     - Settings: Live theme selector dropdown (`#theme-select`) and R-Rated checkbox (`#chk-r-rated`).
   - **Content Cell (`.content-cell`)**:
     - Injects the page-specific markup within `.content-wrapper`.

### Theme Engine (`src/shared/theme-loader.js` & `css/themes/`)
- Dynamic theme switching without full page reload.
- Registered in [`css/themes/themes.json`](file:///c:/MyDrive_1/project_2/Github-Repo/github_account_2/webapp2_wiki/css/themes/themes.json):
  - `default` (Retro Classic)
  - `dark-theme` (Glassmorphism Dark)
  - `light-mode` (Clean Light)
  - `windows-98` (Windows 98 Desktop)
  - `retro-green` (Cyberpunk Terminal)
  - `nes-classic` (8-Bit Nintendo)
  - `medieval` (Parchment RPG Scroll)
  - `luxury` (Vogue Dark)
  - `raunchy`, `raunchy-3`, `raunchy-4` (Neon Editions)
- Selection is persisted in `localStorage.getItem('user_theme')`.

### Singleton Lightbox & Gallery System (`src/shared/lightbox.js` & `css/components/gallery.css`)
- **Masonry Gallery (`.retro-gallery`)**:
  - Dynamic multi-column layout (`.cols-2`, `.cols-3`, `.cols-4`, `.cols-5`).
  - Column count can be adjusted on the fly in `article.html` using the floating gallery controls (`changeGalleryColumns(+1 / -1)`).
  - Hover captions slide out over image thumbnails.
- **Lightbox Overlay (`window.Lightbox`)**:
  - Automatically attached to `#article-content img`.
  - **Modes**:
    - `[D]` **Fit**: Contained inside 90vw / 90vh maintaining aspect ratio.
    - `[O]` **Original**: 1:1 pixel representation.
    - `[C]` **Crop / Fill**: Fills viewport dimensions for panning.
    - `[S]` **Stretch**: Stretches to fill viewport completely.
    - `[ [ ] ]` **Fullscreen**: Invokes HTML5 Fullscreen API.
  - **Mouse Drag & Pan**: Interactive dragging with translation coordinate calculation.
  - **Keyboard Support**: `Escape` key closes the lightbox.

---

## 6. Page Specifications & Features

### 1. Home / Search (`index.html`)
- **A-Z Jump Links Bar**: Quick filtering by title starting letter.
- **Search Bar**: Booru query parsing with live help dropdown.
- **Category Filter Pill**: Displays currently active category with quick clear link.
- **Pagination**: Configurable items per page with Prev/Next indicators.

### 2. Article Viewer (`pages/article.html`)
- Reads article UUID via `?id=UUID`.
- Restricts R-rated articles (`M`, `P`, `X`) from unauthenticated viewers with a retro `[ RESTRICTED CONTENT ]` banner.
- Authenticated admins see inline `[ Edit ]` and `[ Delete ]` controls.
- Fetches HTML body from Supabase Storage and formats masonry galleries (`formatGalleries()`).
- Auto-initializes Lightbox for all images.
- Automatically increments view counter via `ArticleService.incrementViews()`.

### 3. Modular Admin Editor (`pages/admin/editor.html`)
Gated by Supabase authentication (redirects unauthenticated users to `login.html`). Composed of modular scripts in `pages/admin/modules/`:
- **`editor.core.js`**:
  - Manages editor state and edit mode (`?id=UUID` or `?edit=UUID`).
  - Category selector dropdown with `+ [ Add New Category... ]` prompt.
  - Tag chips with input autocomplete from existing database tags.
  - Form dirty tracking with browser exit confirmation (`beforeunload`).
  - Draft auto-save to `localStorage` every 15 seconds with auto-recovery prompt.
  - Live writing metrics: word count, reading time, character count, and embedded image count.
  - Two-phase save execution (Storage first -> Database second).
- **`editor.wysiwyg.js`**:
  - Full Word-style visual editing ribbon (headings, fonts, colors, lists, tables).
  - Interactive Floating Media Inspector: allows clicking images to align (left, center, right, float), resize with presets, add captions, or delete.
  - Direct clipboard image pasting and drag-and-drop file upload.
  - Real-time two-way synchronization between visual editor and raw HTML textarea.
- **`editor.toolbar.js`**:
  - Fast retro snippet buttons for raw HTML mode (`bold`, `italic`, `h2`, `h3`, `code`, `quote`, `link`, `table`, `gallery`).
- **`editor.preview.js`**:
  - In-page preview modal that formats galleries and mirrors the public article view.
- **`editor.fetch.js`**:
  - Scraping helper to extract `<img>` tags from external HTML code snippets.
- **`editor.tabs.js`**:
  - Tab coordinator for switching between Editor, WYSIWYG, Fetch URLs, and AI Assist.

### 4. AI Generation Studios
- **Basic AI Creator (`pages/admin/ai-creator.html`)**:
  - Generates full wiki-formatted articles using Google Gemini (Gemini 2.5).
  - Interactive refinement panel allows requesting revisions (e.g. "Add section on history", "Make more technical").
- **Advanced AI Studio (`pages/admin/advanced-ai-creator.html`)**:
  - Multi-LLM provider support: Google Gemini 2.5, OpenAI GPT-4o, Anthropic Claude 3.5, and xAI Grok Beta.
  - Integrated Quill WYSIWYG editor for immediate post-generation editing.

### 5. JSON Importer (`pages/admin/json-importer.html`)
- Ingests structured JSON containing `{ title, category, tags, content_html }`.
- Includes pre-built prompt templates designed for ChatGPT/Claude to generate complete Wikipedia-style articles with infoboxes and tables of contents.

### 6. Tag Explorer (`pages/other/tags.html`)
- Aggregates and displays all tags weighted by frequency (`tag-size-1` to `tag-size-5`).
- Includes real-time tag search filtering and alphabetized grouping. Clicking any tag navigates to `index.html?q=tag`.

---

## 7. Configuration & DevOps Workflow

### Environment Setup (`.devops/.env`)
API credentials and keys are maintained in `.devops/.env` (gitignored):
```bash
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# AI Model Keys
GEMINI_API_KEY="your-gemini-key"
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
XAI_API_KEY="your-xai-key"
```

### Config Generation Scripts
Because RetroWiki uses no bundlers, runtime JavaScript configuration is generated from `.devops/.env` into `src/config/supabase.config.js`:
- **Windows (PowerShell)**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\generate-config.ps1
  ```
- **Linux / macOS (Bash)**:
  ```bash
  chmod +x generate-config.sh
  ./generate-config.sh
  ```

---

## 8. Extension & Contribution Guide

### How to Add a New Theme
1. Create a theme folder: `css/themes/[theme-name]/`
2. Add `theme.css` defining custom variables or overrides for `:root` and `body` (e.g., `--bg-color`, `--text-color`, `--border-color`, `--link-color`).
3. Register the theme in `css/themes/themes.json`:
   ```json
   {
       "id": "my-theme",
       "name": "My New Theme",
       "description": "Theme description",
       "css": "my-theme/theme.css"
   }
   ```
4. Refresh the application; the theme will automatically appear in the sidebar settings dropdown.

### How to Add a New Service or Query
1. Add modular functions to `src/services/`.
2. Follow the service convention: return plain objects or throw standard errors.
3. Import the service in the target HTML page via `<script src="..."></script>`.
4. Call via `ServiceName.methodName()`.

### How to Maintain Cross-Path Consistency
Whenever creating new pages or editing links:
- Always use `APP_CONFIG.getDepth()` in JavaScript to resolve root-relative paths.
- In static HTML `<head>` tags, ensure relative script and stylesheet paths match the nesting level (`./`, `../`, or `../../`).
- Retain retro brutalist styling: no rounded corners, table-based primary layouts, and bracketed action buttons.

