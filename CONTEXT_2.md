Here is a detailed breakdown of how the **RetroWiki 2k25** application works under the hood.

---

### 1. High-Level Architecture & Tech Stack

- **Stack**: Vanilla HTML5, JavaScript (ES6+), Vanilla CSS, and **Supabase** (Database + Storage). No bundlers, compilers, or heavy frameworks are required.
- **Design Philosophy**: Late 90s / Early 2000s retro brutalist aesthetic. 
  - **Layout Rule**: All core page layouts rely strictly on HTML `<table>` elements (flexbox/grid are avoided for the primary layout structure).
  - **Theme System**: Dynamic CSS swapping with multiple retro themes (Retro Classic, Cyberpunk Terminal, Windows 98, Minecraft, Light Mode).

---

### 2. Database Tables & Content Storage Architecture

The application uses a **hybrid architecture** that separates post metadata from post body HTML content for fast query performance.

#### **Supabase SQL Table: `wiki_articles`**
Stores post index data and metadata:
- `id`: UUID (Primary Key)
- `title`: Text (Article title)
- `category`: Text (Category classification)
- `tags`: Text[] (Array of normalized, lowercase tag strings, e.g., `['react', 'javascript']`)
- `ratings`: Text (`NR` = Not Rated, `M` = Mature, `P` = Prohibited, `X` = Restricted)
- `bucket_path`: Text (Filepath linking to the stored HTML content file in Supabase Storage)
- `views`: Integer (View counter)
- `created_at` / `updated_at`: Timestamptz

#### **Supabase Storage Bucket: `wiki-content`**
- Rather than storing large HTML strings directly inside SQL rows, the raw HTML body content is uploaded to Supabase Storage as `.html` files.
- Files are saved in date-partitioned paths:
  `data/posts/YYYY/MM/DD/HH/[timestamp]_[safe_title].html`

---

### 3. Post (Article) Lifecycle & Features

#### **A. Search & Indexing ([index.html](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/index.html), [article.service.js](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/src/services/article.service.js))**
- **Booru-style Advanced Search Query Parsing**:
  - `word`: Searches both title and tags.
  - `tag1 tag2`: Must contain **both** tags (AND).
  - `-tag`: Exclude articles with this tag (NOT).
  - `~tag1 ~tag2`: Match articles with **either** tag (OR).
  - `web*`: Wildcard prefix search.
- **Ratings Filter**: The sidebar "Show R-Rated content" setting filters out `M`, `P`, and `X` rated posts by default.
- **A-Z Jump Bar**: Quick jump filters for browsing articles alphabetically.

#### **B. Article View & Masonry Galleries ([article.html](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/pages/article.html))**
- Reads the article `?id=UUID` from the URL parameters.
- Fetches article metadata from `wiki_articles` table via [`ArticleService.getById()`](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/src/services/article.service.js#L158).
- Downloads the raw HTML content file via [`StorageService.downloadAsText()`](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/src/services/storage.service.js#L54).
- **Masonry Layout**: Automatically formats `.retro-gallery` image containers into dynamic columns (`formatGalleries()`). Users can resize column count dynamically using floating gallery controls (`-` / `+`).
- **View Counter**: Increments the `views` column automatically in the database via [`ArticleService.incrementViews()`](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/src/services/article.service.js#L207).

#### **C. Post Creation & Editing ([editor.html](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/pages/admin/editor.html), [editor.core.js](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/pages/admin/modules/editor.core.js))**
- Requires Supabase Admin Authentication (redirects to `login.html` if unauthenticated).
- Provides multiple editing tools via tabs:
  - **Write Article**: Code editor with HTML snippet toolbar (Bold, Italic, Headers, Image, Video, Gallery).
  - **WYSIWYG**: Visual rich-text editor using `contenteditable`.
  - **Fetch URLs**: Extract `<img>` tags from raw HTML input.
- **Two-Phase Save Operation**:
  1. Uploads content HTML payload to Supabase Storage bucket first -> receives `bucket_path`.
  2. Creates or updates record in `wiki_articles` table with `bucket_path` and metadata.

---

### 4. Info Lightbox System ([lightbox.js](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/src/shared/lightbox.js))

The Lightbox module provides fullscreen image inspection for images rendered inside articles:

- **Injection**: On page load, `Lightbox.init()` injects the `#lightbox` modal overlay into `<body>`.
- **Image Click Attachment**: `Lightbox.attach('#article-content img')` makes images clickable with zoom cursor.
- **Control Modes**:
  - `[D]` **Default (Fit)**: Fits image within 90% viewport bounds with aspect ratio preservation (`object-fit: contain`).
  - `[O]` **Original (100%)**: Displays image in original dimensions.
  - `[C]` **Crop / Zoom**: Fills screen width/height for panning.
  - `[S]` **Stretch**: Forces image stretch to full screen height/width.
  - `[ [ ] ]` **Toggle Fullscreen**: Invokes browser `requestFullscreen()` API.
- **Mouse Drag & Pan**: Dragging with the mouse updates 2D translation coordinates (`translateX`, `translateY`).
- **Keyboard Shortcut**: Pressing `Escape` closes the lightbox modal.

---

### 5. Layout, Menus & Theme System ([layout.js](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/src/shared/layout.js))

The application uses an **injection pattern** to maintain a consistent retro layout across all pages without duplicate HTML markup:

1. **Skeleton Injection**: `initLayout()` runs on `DOMContentLoaded`. It wraps existing page content inside a retro table structure (`.main-layout`).
2. **Header Bar**:
   - Hamburger menu toggle (`[≡]`) for mobile sidebar.
   - Page title & retro version badge.
   - Zoom controls (`[-]`, `[D]`, `[+]`) to scale page zoom from `0.5x` to `2.0x`.
   - Zen Mode toggle & Light/Dark quick toggle.
3. **Sidebar Navigation & Menus**:
   - **Navigation**: Links to Home/Search, Create New, AI Creators, JSON Importer, and Admin Login/Logout link (updates dynamically based on auth status).
   - **Categories**: Dynamically queried from `wiki_articles` via [`CategoryService.getAll()`](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/src/services/category.service.js) and populated as clickable sub-navigation links.
   - **Tags Link**: Points to tags index page.
   - **Settings Fold**: Dropdown to switch themes and checkbox to toggle R-Rated content visibility.
4. **Themes Engine ([theme-loader.js](file:///d:/projects_2/Github-Repo/github_account_2/webapp2_wiki/src/shared/theme-loader.js))**:
   - Reads registered themes from `src/themes/themes.json`.
   - Swaps `<link id="theme-stylesheet">` on the fly without refreshing the page and persists the selection in `localStorage`.