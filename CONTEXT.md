# Retro Wiki App - Project Context

## Project Identity
- **Name**: Retro Wiki 2k25
- **Aesthetic**: Late 90s/Early 2000s, Brutalist, HTML Tables, Fallback fonts.
- **Tech**: Vanilla HTML/JS/CSS + Supabase (No build tools!)

## Architecture

### Folder Structure (Modular)
```
webapp2_wiki/
├── index.html              ← Home page (root)
├── style.css               ← Main stylesheet
├── src/                    ← Source code
│   ├── config/             ← Configuration
│   │   ├── app.config.js      ← Paths, feature flags
│   │   └── supabase.config.js ← API credentials
│   ├── services/           ← Data Access Layer
│   │   ├── article.service.js ← Article CRUD
│   │   ├── storage.service.js ← File storage ops
│   │   └── category.service.js← Category queries
│   ├── shared/             ← Shared utilities
│   │   ├── utils.js           ← Helpers
│   │   └── layout.js          ← Table layout injector
│   └── themes/             ← Theme system
│       ├── theme-loader.js    ← Dynamic theme loader
│       ├── themes.json        ← Theme registry
│       └── [theme-folders]/   ← Theme CSS files
└── pages/                  ← HTML pages
    ├── article.html
    └── admin/              ← Admin tools
        ├── editor.html
        ├── ai-creator.html
        ├── advanced-ai-creator.html
        ├── json-importer.html
        └── login.html
```

### Database Schema (`wiki_articles`)
- `id`: UUID (PK)
- `title`: Text
- `category`: Text
- `tags`: Text[]
- `ratings`: Text (NR, M, P, X)
- `bucket_path`: Text (links to Storage file)
- `views`: Int
- `created_at`: Timestamptz

### Content Storage
- **Metadata**: Supabase Database (`wiki_articles` table)
- **Content**: Supabase Storage (`wiki-content` bucket) as HTML files

## Key Design Rules
- **NEVER** use Flexbox/Grid for main layout. Use `<table>`.
- **NEVER** use modern rounded corners (border-radius: 0).
- **ALWAYS** use standard blue/purple colors for links.
- **ALWAYS** ensure file uploads to Bucket happen BEFORE DB insert.
- **ALWAYS** use services (ArticleService, StorageService) for DB operations.

## Adding New Features

### Adding a Theme
1. Create folder: `src/themes/my-theme/`
2. Add `theme.css` with your overrides
3. Register in `src/themes/themes.json`
4. Done! Theme appears in Settings dropdown.

### Adding a Service/Query
1. Add function to appropriate service file in `src/services/`
2. Import service in HTML pages via `<script>` tag
3. Call via `ServiceName.methodName()`

## Development Workflow
1. Edit pages in `pages/` or root `index.html`
2. Use services from `src/services/` for database ops
3. No compile needed. Just refresh.
