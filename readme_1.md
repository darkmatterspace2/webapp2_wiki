/
├── index.html          # Public Article List / Home
├── article.html        # Public Article Detail View (?id=...)
├── style.css           # Global Styles
├── config.js           # Supabase Config
├── assets/
│   └── js/
│       ├── layout.js   # Injects Header, Sidebar, Footer (Shared UI)
│       └── utils.js    # Shared Supabase helpers & formatting
└── admin/
    ├── login.html      # Admin Login / Signup
    ├── editor.html     # Create / Edit Article
    └── js/
        └── admin.js    # Admin-specific logic (Auth check, Editor logic)

Component Breakdown
[NEW] 
assets/js/layout.js
Function: initLayout()
Injects the <table> skeleton (Header, Sidebar, Footer) into a container div on every page.
Handles highlighting the current active nav link.
Initializes "Zen Mode" and "Theme" from localStorage.
[NEW] 
assets/js/utils.js
Functions: initSupabase(), formatDate(), getParam(name).
Centralizes the Supabase client creation.
[MODIFY] 
index.html
Remove all "views" except the Home/List logic.
Remove 
app.js
 dependency, import assets/js/utils.js and assets/js/layout.js.
Add local script for fetching list.
[NEW] 
article.html
Dedicated page for viewing a single article.
Reads ?id=UUID from URL.
Fetches metadata and content.
[NEW] 
admin/login.html
Standalone login page.
Redirects to ../../index.html (or Dashboard) on success.
[NEW] 
admin/editor.html
Standalone editor page.
Checks Auth on load (redirects to login if null).
Handles Create and Edit (via ?id=UUID).