# Role
You are an expert Full-Stack Developer specializing in high-performance, vanilla JavaScript applications and Supabase integration. You excel at creating "retro-futuristic" web apps that look like 1998 but run like 2025.

# Project Overview
Build a standalone "Wiki/Knowledge Base" web application. 
**Aesthetic:** Strict late-90s/early-2000s web design (brutalist, HTML tables, system fonts).
**Tech Stack:** Pure HTML5, Vanilla CSS, Vanilla JavaScript. **NO Frameworks** (No React, Vue, Bootstrap, Tailwind).
**Backend:** Supabase (Database + Auth + Storage Buckets).

# Core Requirements

## 1. Design & UI (The "Retro Vibe")
- **Layout:** Use HTML `<table>` for layout or raw CSS floats. No Flexbox/Grid unless absolutely necessary for mobile fallback.
- **Style:** Blue underlined links, standard `<h1>`-`<h3>`, specific background colors (gray/beige), no rounded corners, no drop shadows.
- **Responsiveness:** Fluid width (100%). Must look good on mobile and desktop.
- **Dark/Light Mode:** Default to Dark Mode (high contrast terminal style). Toggle persists via localStorage.
- **UI Elements:**
  - "Visitor Counter" in footer (simulated or real).
  - "Back to Top" link with scroll percentage.
  - "Zen Mode" toggle (hides sidebar/nav).
  - Alphabetical Jump Links (A-Z) at the top.
  - Auto-generated Table of Contents (TOC) for articles.

## 2. Backend Architecture (Supabase)
You must implement a full backend connection using the Supabase JS Client (via CDN).

### A. Database Schema
Create a table `wiki_articles` with:
- `id` (UUID, primary key)
- `title` (text)
- `category` (text, for filtering)
- `tags` (text array or string)
- `bucket_path` (text - stores the reference to the file in Storage)
- `views` (int, default 0)
- `created_at`, `updated_at`

### B. File Storage (Crucial)
- **Strategy:** The actual text content of the wiki article must be stored as an HTML or Markdown file inside a Supabase Storage Bucket named `wiki-content`.
- The Database record only holds metadata and the `bucket_path`.

### C. Authentication & Roles
- **Admin:** Can Create, Read, Update, Delete (CRUD). Can upload files to the bucket.
- **Public User:** Read-only access. Can view articles, search, and filter.
- Implement a simple Admin Login page.

## 3. Functionality
- **CRUD Operations:**
  - **Create:** Form to input title/category and a rich text area (or textarea) for content. On save, upload content to Bucket -> get path -> save metadata to DB.
  - **Read:** Fetch list from DB. When clicking an article, fetch the content file from Bucket and render it.
  - **Update:** Edit metadata and overwrite the file in the Bucket.
  - **Delete:** Remove row from DB and file from Bucket.
- **Data Handling:** Implement Server-side Pagination (limit/offset), Sorting (Date/Alphabetical), and Filtering (by Category).
- **Search:** Real-time search against the `title` and `category` columns in the DB.
- **Security:**
  - Implement Row Level Security (RLS) policies (SQL).
  - Sanitize all HTML content before rendering to prevent XSS.
  - Never expose Service Keys (use Anon key only).

## 4. Documentation & Context (Mandatory Output)
You must generate specific documentation files to ensure future consistency.

# Deliverables (Output Format)

**1. Project Structure:**
- `index.html` (Main app, includes logic for routing between list/view/admin via JS).
- `style.css` (The retro styling).
- `app.js` (All CRUD logic, Supabase connection, UI state management).
- `config.js` (Supabase keys placeholder).

**2. Context & Documentation Files:**
- `CONTEXT.md`: A system prompt file for future AI generations. It must summarize the project structure, the "Bucket vs DB" logic, and the Retro design rules.
- `INSTRUCTIONS.md`: A user guide explaining:
  - How to set up the Supabase project.
  - **The exact SQL queries** to run in the Supabase SQL Editor to create tables and RLS policies.
  - How to create the Storage Bucket and set policies.
  - How to deploy (GitHub Pages/Netlify).

# Implementation Instructions
- **Performance:** Keep the initial load under 200KB (excluding article content). Use lazy loading for the list.
- **Security:** Ensure input sanitization is robust against XSS/Injection.
- **Code Style:** Clean, commented Vanilla JS. Use `async/await` for Supabase calls.

**Generate the code and the documentation files now.**