# Retro Wiki App - Project Context & Technical Blueprint

## 1. Project Identity & Vision

- **Name**: RetroWiki 2k25 (`webapp2_wiki`)
- **Version**: v3.0
- **Aesthetic**: Authentic late-90s / early-2000s web (inspired by classic Wikipedia, Craigslist, and vintage forum archives). Brutalist, utilitarian, standard blue/purple links, `<hr>` dividers, web-safe system fonts, and HTML `<table>` page layouts.
- **Tech Stack**: Vanilla HTML5, CSS3, ES6 JavaScript, and Supabase.
- **Philosophy**: **Zero build tools, zero bundlers, zero framework dependencies.** Everything executes natively in the browser. Instant development cycle: edit file → refresh browser.

---

## 2. Repository & Directory Structure

```
webapp2_wiki/
├── index.html                      ← Public Home & Article Index (search, A-Z jump links, pagination)
├── CONTEXT.md                      ← Detailed project context, rules, and technical architecture
├── CONTEXT_old.md                  ← Archived previous context
├── readme_1.md                     ← Original architecture migration notes
├── generate-config.ps1             ← PowerShell script: generates supabase.config.js from .devops/.env
├── generate-config.sh              ← Bash script: generates supabase.config.js from .devops/.env
│
├── .devops/                        ← Environment & local secrets
│   └── .env                        ← API keys & Supabase credentials (git-ignored)
│
├── css/                            ← Modular Stylesheet Architecture
│   ├── main.css                    ← Master stylesheet importing core/ and components/
│   ├── core/
│   │   ├── tokens.css              ← CSS custom properties (colors, borders, fonts)
│   │   ├── reset.css               ← Base element reset & typography fallbacks
│   │   ├── layout.css              ← Table layout styles, Zen mode, zoom levels
│   │   └── utilities.css           ← Spacing, text helpers, responsive helpers
│   ├── components/
│   │   ├── header.css              ← Vintage header bar & control buttons
│   │   ├── sidebar.css             ← Sidebar navigation, category/tag lists
│   │   ├── content.css             ← Main content cell & typography
│   │   ├── articles.css            ← Article card index & search results
│   │   ├── forms.css               ← Retro form inputs, textareas, selects
│   │   ├── buttons.css             ← 3D bevel buttons and vintage toggles
│   │   ├── gallery.css             ← Retro masonry gallery & lightbox styling
│   │   ├── modal.css               ← Dialogs & popup overlays
│   │   └── footer.css              ← Footer text, hit counter, version badges
│   └── themes/                     ← Dynamic Theming System
│       ├── themes.json             ← Registry of all available themes
│       ├── default/theme.css       ← Retro Classic (Dark default)
│       ├── retro-green/theme.css   ← Cyberpunk Terminal (Green CRT scanlines)
│       ├── light-mode/theme.css    ← Clean Light Mode
│       ├── windows-98/theme.css    ← Windows 98 desktop & 3D beveled windows
│       ├── luxury/theme.css        ← Luxury Vogue (Dark elegant gold)
│       ├── medieval/theme.css      ← Medieval Scroll (Parchment & fantasy RPG)
│       ├── raunchy/theme.css       ← Raunchy (Edgy neon aesthetic)
│       ├── raunchy-3/theme.css     ← Raunchy III (Ultra-light neon pink)
│       ├── raunchy-4/theme.css     ← Raunchy 4 (Refined neon edition)
│       ├── nes-classic/theme.css   ← NES Classic (8-bit Nintendo palette)
│       └── dark-theme/theme.css    ← Modern glassmorphism dark theme
│
├── pages/                          ← Application Views
│   ├── article.html                ← Public single article viewer (?id=UUID)
│   ├── other/
│   │   └── tags.html               ← Interactive tag cloud & directory
│   └── admin/                      ← Admin Portal (Requires Supabase Auth)
│       ├── login.html              ← Admin authentication (login / signup)
│       ├── editor.html             ← Modular article creator & WYSIWYG editor (?id=UUID for edit)
│       ├── editor_bkp.html         ← Legacy monolithic editor backup
│       ├── ai-creator.html         ← Fast AI article generator (Google Gemini)
│       ├── advanced-ai-creator.html← Multi-model AI studio (Gemini, GPT-4o, Claude 3.5, Grok) + Quill
│       ├── json-importer.html      ← Batch article importer via structured JSON
│       └── modules/                ← Modular Editor Sub-components
│           ├── editor.core.js      ← Form lifecycle, tags pill manager, rating toggle, save logic
│           ├── editor.wysiwyg.js   ← ContentEditable commands, tables, images, video embeds
│           ├── editor.toolbar.js   ← Action buttons & formatting bar
│           ├── editor.preview.js   ← Live preview generator & synchronization
│           ├── editor.tabs.js      ← Switching between Editor, HTML Source, and Preview
│           └── editor.fetch.js     ← Loading existing article data for editing
│
├── src/                            ← Centralized Business Logic & Utilities
│   ├── config/
│   │   ├── app.config.js           ← Path resolution (`getDepth()`), feature flags
│   │   ├── supabase.config.js      ← Runtime Supabase & LLM API keys (generated, git-ignored)
│   │   └── supabase.config.example.js ← Template for configuration
│   ├── services/                   ← Data Access Layer (DAL)
│   │   ├── article.service.js      ← CRUD, Booru search parsing, view increment, tag normalizer
│   │   ├── storage.service.js      ← Supabase Storage uploads/downloads (`wiki-content` bucket)
│   │   └── category.service.js     ← Dynamic category retrieval & aggregation
│   └── shared/                     ← Global Shared Modules
│       ├── utils.js                ← Supabase client init, auth verification, URL params, dates
│       ├── layout.js               ← Table layout DOM injector, Zen mode, Zoom, responsive menu
│       ├── theme-loader.js         ← FOUC-free dynamic stylesheet switcher & registry loader
│       └── lightbox.js             ← Singleton image/video lightbox with pan, zoom, fit modes
│
├── Readme/                         ← Project Documentation, Instructions & Prompts
│   ├── INSTRUCTIONS.md             ← Step-by-step Supabase table & storage bucket setup guide
│   ├── Founding_prompt.md          ← Original design prompt & aesthetic requirements
│   ├── gallery_lightbox_controls.md← Spec for the retro masonry gallery & lightbox module
│   ├── gallery_lightbox_controls_2.md
│   ├── prompt_1_initial_refinement.md
│   ├── prompt_1_initial_refinement_output.md
│   └── prompt_2_AI_assisted_articles.md
│
└── tmp/                            ← Offline Utility & Scratch Scripts
    ├── html_to_gallery_converter.html ← Converts raw images into retro gallery HTML
    ├── video_gallery_figure_edit_v2.html ← Video gallery markup builder
    ├── generate_seq.html           ← Sequence generator
    ├── html_editor.html            ← Standalone scratch editor
    ├── table.html                  ← Retro table experiments
    └── theme.css                   ← Theme scratchpad
```

---

## 3. Database & Storage Architecture (Supabase)

The project uses a split-storage strategy: **metadata in PostgreSQL**, and **article HTML content in Supabase Storage**.

### Database Schema (`wiki_articles` table)

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary Key |
| `title` | `text` | NOT NULL | Article title |
| `category` | `text` | NOT NULL | Article category (e.g. `Architecture`, `Hardware`, `Software`) |
| `tags` | `text[]` | `'{}'` | Array of normalized tags (lowercased, underscores instead of spaces) |
| `ratings` | `text` | `'NR'` | Content rating: `NR` (Not Rated), `M` (Mature), `P` (Parental), `X` (Adult) |
| `bucket_path` | `text` | NOT NULL | Relative path to the `.html` file in Supabase Storage |
| `views` | `int` | `0` | Total view count (incremented on article page load) |
| `user_id` | `uuid` | NULL | Reference to `auth.users(id)` of author/admin |
| `created_at` | `timestamptz` | `now()` | Record creation timestamp |
| `updated_at` | `timestamptz` | `now()` | Last update timestamp |

### Row Level Security (RLS) Policies
- **Read (SELECT)**: Public access (`true`) for all users.
- **Write (INSERT, UPDATE, DELETE)**: Gated strictly to authenticated users (`auth.role() = 'authenticated'`).

### Object Storage (`wiki-content` bucket)
- **Bucket**: `wiki-content` (Public bucket recommended for direct CDN fetch).
- **Date-Partitioned Path Scheme**:
  ```
  data/posts/YYYY/MM/DD/HH/{timestamp}_{sanitized_title}.html
  ```
- **Critical Invariant**:
  When creating or editing an article, **the HTML content MUST be successfully uploaded to the bucket FIRST**. Only after obtaining the validated `bucket_path` should the metadata record be created or updated in the `wiki_articles` table.

---

## 4. Services & Data Access Layer (`src/services/`)

### `ArticleService` (`src/services/article.service.js`)
Centralized CRUD and search operations.
- `getList({ page, limit, category, search, showRRated })`:
  - Standard pagination: uses Supabase `.range(from, to)`.
  - Advanced search: automatically switches to client-side filtering if search operators are detected.
  - Rating filter: filters out `("M", "P", "X")` unless `showRRated` is enabled.
- `getById(id)`: Fetches single article metadata.
- `create(articleData)`: Sanitizes tags and inserts record.
- `update(id, updates)`: Sanitizes tags and updates record.
- `delete(id)`: Removes record by UUID.
- `incrementViews(id, currentViews)`: Increments article view counter by +1.
- `_normalizeTags(articleData)`:
  - Trims whitespace.
  - Converts to lowercase.
  - Replaces spaces with underscores (`_`).
  - Strips special characters: `[!@#$%^&*()+=\[\]{};:'",.<>?\\|`~]`.
- `_parseSearchQuery(searchStr)`:
  - **Booru-style search syntax**:
    - `term`: Matches if term is found in title OR in tags.
    - `tag1 tag2`: AND query (must have both).
    - `-tag`: Exclusion / NOT query (must not have this tag).
    - `~tag1 ~tag2`: OR query (must have at least one).
    - `term*`: Wildcard prefix match.

### `StorageService` (`src/services/storage.service.js`)
Supabase Object Storage management for `wiki-content`.
- `generateArticlePath(title)`: Computes the date-based upload path (`data/posts/YYYY/MM/DD/HH/...`).
- `uploadArticle(title, content)`: Helper to upload an HTML string and return the bucket path.
- `upload(path, content, contentType)`: Direct blob upload with upsert enabled.
- `download(path)` & `downloadAsText(path)`: Fetches HTML content as text for display in article viewer or editor.
- `delete(path)`: Deletes file from bucket.
- `getPublicUrl(path)`: Generates public CDN URL.

### `CategoryService` (`src/services/category.service.js`)
- `getAll(showRRated)`: Fetches distinct categories across articles, excluding mature ratings when appropriate, and returns an alphabetically sorted list for the sidebar.

### `AppUtils` (`src/shared/utils.js`)
- `initSupabase()`: Creates Supabase client using credentials from `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`. Enforces `storage: window.localStorage` to bypass Android IndexedDB bugs.
- `checkAuth(supabase)`: Verifies if current session has an authenticated user.
- `getParam(name)`: Retrieves query parameter from `window.location.search`.
- `formatDate(dateStr)`: Standard localized date formatter.
- `showLoading(boolean)`: Controls visibility of `#loading-indicator`.

---

## 5. UI Layout, Theming & Lightbox Engine

### Dynamic Table Layout Injector (`src/shared/layout.js`)
To maintain the authentic retro web experience while avoiding code duplication across HTML files:
1. `layout.js` intercepts `DOMContentLoaded`.
2. Preserves the current page content from `document.body.innerHTML`.
3. Re-renders the page wrapped inside a classic table structure:
   ```html
   <div id="layout-wrapper">
     <table class="main-layout" border="1" cellpadding="0" cellspacing="0">
       <tr><!-- Header Row (Logo, Zoom Controls, Zen Toggle, Theme Toggle) --></tr>
       <tr>
         <td class="sidebar-cell"><!-- Navigation, Categories, Tags, Theme Selector --></td>
         <td class="content-cell"><!-- Injected Page Content --></td>
       </tr>
       <tr><!-- Footer Row (Visitor count, version, copyright) --></tr>
     </table>
   </div>
   ```
4. **Path Resolution via `APP_CONFIG.getDepth()`**:
   Calculates directory depth based on `window.location.pathname` (`./`, `../`, `../../`), allowing the header, links, themes, and services to load flawlessly regardless of URL nesting.
5. **Zen Mode**: Toggles `.zen-mode` on `<body>`, hiding the sidebar to maximize reading area (`localStorage.zenMode`).
6. **Zoom Controller**: Buttons `[-]`, `[D]`, `[+]` adjust root font size/scaling (`Layout.zoom()`).

### Theming System (`src/shared/theme-loader.js` & `css/themes/`)
- Registered in `css/themes/themes.json`.
- Dynamic stylesheet link `#theme-stylesheet` is injected into `<head>`.
- Supports 11 themes:
  - `default`: Retro Classic (Dark default)
  - `retro-green`: Cyberpunk CRT Terminal
  - `light-mode`: Clean Light
  - `windows-98`: Windows 98 desktop with beveled teal chrome
  - `luxury`: Luxury Vogue (Gold on dark)
  - `medieval`: Medieval Scroll (Parchment RPG)
  - `raunchy`, `raunchy-3`, `raunchy-4`: Edgy neon editions
  - `nes-classic`: 8-bit NES palette & pixel font style
  - `dark-theme`: Premium glassmorphism dark mode
- Executes immediately on script load to eliminate Flash of Unstyled Content (FOUC).

### Retro Gallery & Lightbox (`src/shared/lightbox.js` & `css/components/gallery.css`)
- **Retro Masonry**: Flexbox masonry grid (`.retro-gallery.cols-3`) with borderless touching thumbnails and hover captions.
- **Singleton Lightbox (`window.Lightbox`)**:
  - Dynamically injects `#lightbox` overlay.
  - Supports both images and HTML5 videos.
  - Multi-mode display:
    - `[Fit]`: Scale to fit within viewport.
    - `[100%]`: Render at natural image dimensions.
    - `[Fill]`: Crop/cover to fill screen.
    - `[Stretch]`: Stretch to screen boundaries.
  - Drag-to-pan support when zoomed or panning across oversized media.
  - Full keyboard control: `Escape` (close), `Left`/`Right` arrows (navigate gallery), `Space` (play/pause video).

---

## 6. Admin Tools & AI Studio (`pages/admin/`)

### Modular Article Editor (`pages/admin/editor.html`)
The editor provides a full WYSIWYG experience tailored for retro markup without requiring external WYSIWYG dependencies:
- **`editor.core.js`**: Form lifecycle, validation, auth guard, tag chip input with auto-normalization, rating selector.
- **`editor.wysiwyg.js`**: `document.execCommand` wrappers, retro table generator, media inserters.
- **`editor.toolbar.js`**: Buttons for headings, retro divider (`<hr>`), blockquotes, code, tables.
- **`editor.preview.js`**: Live iframe/tab preview rendering using the app's stylesheets.
- **`editor.tabs.js`**: Seamless switching between Visual Editor, Raw HTML Source, and Live Preview tabs.
- **`editor.fetch.js`**: Detects `?id=UUID` in URL, fetches metadata + bucket HTML, and populates fields for editing.

### AI Article Generators
1. **`pages/admin/ai-creator.html`**:
   - Lightweight article generator powered by Google Gemini (Gemini 2.5 Flash).
   - Prompt input → generate article → review/edit → refine iteratively → save directly to Supabase.
2. **`pages/admin/advanced-ai-creator.html`**:
   - Multi-provider AI Studio with Quill editor.
   - Supports: Google Gemini, OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), and xAI (Grok).
   - Generates retro-formatted HTML, tags, category, and summary.
3. **`pages/admin/json-importer.html`**:
   - Ingests pre-generated JSON files (e.g. from local scripts or external LLMs).
   - JSON Schema:
     ```json
     {
       "title": "Article Title",
       "category": "Technology",
       "tags": "hardware, storage, vintage",
       "ratings": "NR",
       "content_html": "<p>Article HTML markup here...</p>"
     }
     ```
   - Automatically handles uploading the HTML to Storage and inserting the record into the DB.

---

## 7. Environment & Configuration Workflow

### Secret Management
- Secrets are stored in `.devops/.env` (git-ignored):
  ```env
  SUPABASE_URL=https://xyzcompany.supabase.co
  SUPABASE_ANON_KEY=eyJhbGciOi...
  GEMINI_API_KEY=AIzaSy...
  OPENAI_API_KEY=sk-...
  ANTHROPIC_API_KEY=sk-ant-...
  XAI_API_KEY=xai-...
  ```

### Config Generation
- **Windows (PowerShell)**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\generate-config.ps1
  ```
- **Linux / macOS (Bash)**:
  ```bash
  chmod +x generate-config.sh
  ./generate-config.sh
  ```
- Output: `src/config/supabase.config.js` (git-ignored, exposes keys on `window`).

---

## 8. Non-Negotiable Development Rules

1. **Retro Layout Law**:
   - **NEVER** replace the outer page layout with CSS Grid or Flexbox. The application shell must remain an HTML `<table>`.
   - **NEVER** apply modern border-radius (`border-radius: 0` is strictly enforced across core elements).
   - **NEVER** use modern subtle pastel links—stick to standard high-contrast blue (`#0000ee`) and purple (`#551a8b`).
2. **Data Pipeline Law**:
   - **ALWAYS** route database operations through `ArticleService` and `CategoryService`. Never call `supabase.from()` directly inside view pages.
   - **ALWAYS** upload HTML content to Supabase Storage (`StorageService`) **BEFORE** inserting or updating the database row.
   - **ALWAYS** pass tags through `ArticleService._normalizeTags()` before persisting.
3. **Relative Pathing Law**:
   - **ALWAYS** use `APP_CONFIG.getDepth()` when constructing links, image URLs, or script paths in shared scripts to ensure pages work from root, `/pages/`, `/pages/other/`, and `/pages/admin/`.
4. **Zero Build Tools Law**:
   - Keep scripts ES6/vanilla and CSS modular. All additions must be directly runnable in modern browsers without compilation or bundler steps.

