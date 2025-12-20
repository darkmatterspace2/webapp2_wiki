# Retro Wiki App - Project Context

## Project Identity
- **Name**: Retro Wiki 2k25
- **Aesthetic**: Late 90s/Early 2000s, Brutalist, HTML Tables, Fallback fonts.
- **Tech**: Vanilla HTML/JS/CSS + Supabase.

## Architecture
### 1. Separation of Concerns
- **Metadata**: Stored in Supabase Database (`wiki_articles` table).
- **Content**: Stored in Supabase Storage (`wiki-content` bucket) as HTML files.
- **Frontend**: Pure Static HTML/JS. No build step required (unless deploying).

### 2. Database Schema (`wiki_articles`)
- `id`: UUID (PK)
- `title`: Text
- `category`: Text
- `tags`: Text[]
- `bucket_path`: Text (Critical: links DB row to Storage file)
- `views`: Int
- `created_at`: Timestamptz

### 3. Key Design Rules
- **NEVER** use Flexbox/Grid for main layout. Use `<table>`.
- **NEVER** use modern rounded corners (border-radius: 0).
- **ALWAYS** use standard blue/purple colors for links unless in high-contrast dark mode.
- **ALWAYS** ensure file uploads to Bucket happen BEFORE DB insert.

## Development Workflow
1. Edit `index.html` structure.
2. Edit `app.js` for logic.
3. No compile needed. Just refresh.
