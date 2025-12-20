You are an expert full-stack web developer specializing in ultra-lightweight, high-performance websites.

Build a complete, production-ready webapp like wikipedia and a link directory with a deliberate retro aesthetic inspired by late-90s / early-2000s sites (think classic Craigslist or old-school forum archives).

**Core Requirements**:
- Fully static site (no backend, no database).
- Extremely lightweight: total page < 200 KB, instant load even on slow connections
- Pure HTML5 + minimal inline CSS + tiny vanilla JavaScript only
- No frameworks, no React, no Bootstrap, no external libraries except optional placeholder images
- Visual style: 100% authentic 1998–2005 web. Use only HTML tables for layout, blue underlined hyperlinks, <hr> rules, <h1><h2> headers, tiny thumbnails (max 80×60 px), no rounded corners, no shadows, no flexbox/grid, no modern CSS
- dark/light mode toggle - Dark by default.
- Typography: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif – clean and broad-compatible.
- make width compatible with any aspect ratio desktop or mobile  (span across the screen both landscape and potrait).

**Other Requirements**
- Ensure full responsiveness for mobile/desktop without media queries if possible, or with very few.
- Footer: Minimal – copyright, "Last updated" date, basic links.
- Responsiveness: Fluid widths with minimal media queries (e.g., stack sidebar below on small screens) to work on mobile without complexity.
- Interactivity: Only the mode toggle (vanilla JS with localStorage persistence) and perhaps a simple client-side search filter for the link.
- "Visitor Counter" (Retro Fun): A classic 90s hit counter in the footer using localStorage to increment a view count (client-side only). Displays "You are visitor #X" – nostalgic and harmless.
- Alphabetical Jump Links : For long directories: A row of A-Z text links at the top that scroll to anchored sections (e.g., <a href="#A">A</a>). Zero JS needed.
- Table of Contents Auto-Generator: Tiny JS scans <h2>/<h3> headings and builds a clickable TOC in the sidebar – like early wikis.
- "Back to Top" with Page Scroll Progress: A subtle "% scrolled" text in footer that updates live (via scroll event), doubling as a jump-to-top link.
- Simple "Copy Link to This Section": Next to headings: A small [¶] link that copies the anchor URL to clipboard (navigator.clipboard API, fallback alert).
- "Night Reading Mode" Variant : Mono Night Mode — Near-black background with layered greys for distraction-free reading.
- Quick Category Filter Dropdown: <select> menu in header that filters main list by category (client-side hide/show rows).
- "View as List / Table" Toggle: Button swaps between <ul> list view and <table> view via class toggle – useful for directories.
- "Related Links" Section: Manually curated or tiny JS random 3-5 related entries at bottom of articles.
- Minimal Animation-Free Hover Effects: Just color change on links/tables (e.g., background tint) – CSS only.
- "Download This Page as HTML" Button: JS generates a data:URI blob of current page for offline save.       
- Word/Character Count for Articles: Footer shows "X words" – tiny JS count on load.
- "Go to Bottom" Link: Complementary to top link – for quick scanning long pages.
- "Zen Mode" Toggle: Hides sidebar and nav for distraction-free reading – one class toggle.  
- Download button to download article or page content.            


**Technical specs**:
- One main file: index.html
- Optional style.css (< 2 KB) or everything inline
- Optional script.js (only the live search filter function)
- Fast-loading thumbnails with fallback
- All external links open in new tab (_blank)
- Valid HTML5, proper semantic headings, good SEO basics (title, meta description)

**Output format**:
1. Complete index.html
3. style.css (if used)
4. script.js
5. Clear instructions: just open index.html locally or deploy to GitHub Pages/Netlify/Free host

Deliver a fully working, nostalgic, blazing-fast directory site that feels like the internet circa 2002 – ugly but incredibly functional and instantly usable.