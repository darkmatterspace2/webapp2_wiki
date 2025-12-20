# Retro Wiki 2k25 - Complete Project Context

## 🎯 Project Vision
A Wikipedia-like wiki + link directory web application with a **deliberate retro aesthetic** inspired by late-90s/early-2000s websites (think classic Craigslist or old-school forum archives).

---

## 🏷️ Project Identity
| Property | Value |
|----------|-------|
| **Name** | Retro Wiki 2k25 |
| **Aesthetic** | Late 90s/Early 2000s, Brutalist, HTML Tables, System fonts |
| **Stack** | Vanilla HTML + CSS + JavaScript + Supabase (BaaS) |
| **Deployment** | 100% Static - GitHub Pages / Netlify / Any Static Host |

---

## 📁 Project Structure

```
/
├── index.html              # Public Article List / Home
├── article.html            # Public Article Detail View (?id=UUID)
├── style.css               # Global Styles (~4KB)
├── app.js                  # Main Application Logic (~16KB)
├── config.js               # Supabase + API Keys Configuration
│
├── assets/
│   ├── css/
│   │   └── gallery.css     # Gallery-specific styles
│   └── js/
│       ├── layout.js       # Shared UI: Header, Sidebar, Footer injection
│       ├── gallery.js      # Gallery functionality
│       └── utils.js        # Shared Supabase helpers & formatting
│
├── admin/
│   ├── login.html          # Admin Login / Signup
│   ├── editor.html         # Manual Article Create/Edit
│   ├── ai-creator.html     # AI-Powered Article Generator (Gemini)
│   ├── advanced-ai-creator.html  # Advanced AI Article Generator
│   ├── json-importer.html  # Bulk JSON Article Import
│   └── gallery-editor.html # Gallery Management
│
├── other_misc/
│   ├── html_editor_v1.html # Standalone HTML Editor v1
│   ├── html_editor_v2.html # Standalone HTML Editor v2
│   ├── html_to_image_gallery_converter.html
│   ├── html_to_video_gallery_converter.html
│   ├── image_gallery_v2.html
│   └── useful_links.html   # Curated Links Collection
│
└── Readme/
    ├── Founding_prompt.md  # Original AI generation prompt
    ├── prompt_1_initial_refinement.md
    ├── prompt_1_initial_refinement_output.md
    └── prompt_2_AI_assisted_articles.md
```

---

## 🏗️ Architecture

### 1. Separation of Concerns
| Layer | Storage | Description |
|-------|---------|-------------|
| **Metadata** | Supabase Database (`wiki_articles` table) | Title, category, tags, views, timestamps |
| **Content** | Supabase Storage (`wiki-content` bucket) | Actual HTML article files |
| **Frontend** | Static HTML/JS/CSS | No build step required |

### 2. Database Schema (`wiki_articles`)
```sql
create table wiki_articles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  category text not null,
  tags text[] default '{}',
  bucket_path text not null,  -- Links DB row to Storage file
  views int default 0,
  rating text default 'NR',   -- Content rating: NR, M, P, X
  user_id uuid references auth.users(id)
);
```

### 3. Storage Structure
- **Bucket Name**: `wiki-content`
- **Access**: Public read, authenticated write
- **Content**: HTML files stored with paths referenced in `bucket_path`

---

## 🎨 Critical Design Rules

> ⚠️ These rules are INVIOLABLE for maintaining the retro aesthetic:

1. **Layout**: Use `<table>` for main layout. **NEVER** use Flexbox/Grid for page structure.
2. **Corners**: **NEVER** use rounded corners (`border-radius: 0` everywhere).
3. **Links**: Use standard blue/purple link colors unless in high-contrast dark mode.
4. **Typography**: System fonts only: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
5. **File Operations**: Upload content to Storage bucket **BEFORE** DB insert.
6. **Target**: Total page < 200 KB, instant load on slow connections.

---

## ✨ Core Features

### Public Features
- 📰 Article listing with pagination
- 🔍 Live client-side search filter
- 📂 Category filtering via dropdown and sidebar
- 🌓 Dark/Light mode toggle (Dark default)
- 📖 "Zen Mode" - hides sidebar for distraction-free reading
- 📊 Table of Contents auto-generator (scans H2/H3 headings)
- 🔗 A-Z alphabetical jump links
- 📋 "Copy Link to Section" buttons on headings
- 👁️ View counter (localStorage-based retro hit counter)
- ⬆️⬇️ Back to Top / Go to Bottom links
- 📥 Download article as HTML
- 📝 Word/Character count in footer

### Admin Features (Authenticated)
- ✏️ WYSIWYG Article Editor
- 🤖 AI-Powered Article Generation (Gemini API)
- 📦 Bulk JSON Article Import
- 🖼️ Gallery Editor
- 🔒 Row Level Security (RLS) on database

### Content Rating System
- **NR**: Not Rated (default, safe)
- **M**: Mature
- **P**: Parental Guidance
- **X**: Adult/Explicit
- Sidebar toggle to show/hide R-rated content (M, P, X)

---

## 🔧 Configuration (`config.js`)

```javascript
window.SUPABASE_URL = "your_supabase_url";
window.SUPABASE_ANON_KEY = "your_anon_key";
window.GEMINI_API_KEY = "your_gemini_key";  // For AI article generation
// Optional: OPENAI_API_KEY, ANTHROPIC_API_KEY, XAI_API_KEY
```

---

## 🚀 Setup Instructions

### 1. Supabase Setup
1. Create project at [Supabase](https://supabase.com)
2. Copy **Settings > API** `URL` and `anon` key to `config.js`

### 2. Database Setup
Run this SQL in Supabase SQL Editor:
```sql
-- Create Table
create table wiki_articles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  title text not null,
  category text not null,
  tags text[] default '{}',
  bucket_path text not null,
  views int default 0,
  rating text default 'NR',
  user_id uuid references auth.users(id)
);

-- Enable RLS
alter table wiki_articles enable row level security;

-- Policies
create policy "Public read" on wiki_articles for select using (true);
create policy "Auth insert" on wiki_articles for insert with check (auth.role() = 'authenticated');
create policy "Auth update" on wiki_articles for update using (auth.role() = 'authenticated');
create policy "Auth delete" on wiki_articles for delete using (auth.role() = 'authenticated');
```

### 3. Storage Setup
1. Create bucket named `wiki-content`
2. Set to **Public** for easy reads
3. Add policy for authenticated uploads

### 4. Run Locally
Just open `index.html` in browser - no build step needed!

### 5. Deploy
Drag folder to Netlify Drop, or push to GitHub Pages.

---

## 🔑 Key Files to Understand

| File | Purpose |
|------|---------|
| `app.js` | Main application logic: routing, CRUD, state management |
| `assets/js/layout.js` | Injects table-based layout skeleton into all pages |
| `assets/js/utils.js` | Supabase client init, date formatting, URL params |
| `index.html` | Home page - article listing |
| `article.html` | Single article viewer (fetches by `?id=UUID`) |
| `admin/editor.html` | Article creation/editing form |
| `admin/ai-creator.html` | AI-powered article generator using Gemini |

---

## 🧠 State Management (`app.js`)

```javascript
const STATE = {
    user: null,           // Current admin user
    currentPage: 1,       // Pagination
    itemsPerPage: 10,
    currentCategory: 'all',
    searchQuery: '',
    articleCache: {},     // Simple cache for loaded articles
    editingId: null       // ID of article being edited
};
```

---

## 📖 Important Code Patterns

### Supabase Client Naming
The Supabase client is named `sbClient` (not `supabase`) to avoid conflicts with the global Supabase library.

### Content Loading Flow
1. Fetch article metadata from `wiki_articles` table
2. Get `bucket_path` from metadata
3. Fetch HTML content from Storage using `bucket_path`
4. Render content in article view

### Article Save Flow
1. Upload HTML content to Storage bucket FIRST
2. Insert/Update metadata row with `bucket_path` reference
3. If upload fails, abort before touching database

---

## 🎯 Development Workflow

1. Edit HTML structure in relevant `.html` file
2. Edit logic in `app.js` or page-specific `<script>` blocks
3. No compile needed - just refresh browser
4. Use browser DevTools for debugging
5. Test both light and dark themes
6. Verify mobile responsiveness

---

## ⚠️ Common Pitfalls

1. **Don't use modern CSS layouts** - Stick to tables for main structure
2. **Don't add build tools** - Keep it pure static
3. **Always upload to Storage first** - Before DB operations
4. **Check authentication** - Admin features require login
5. **Content ratings** - Remember to filter R-rated content appropriately

---

## 📚 Related Resources

- **Supabase Docs**: https://supabase.com/docs
- **Gemini API**: https://ai.google.dev/
- **Retro Web Inspiration**: archive.org Wayback Machine

---

*Last Updated: December 2024*
