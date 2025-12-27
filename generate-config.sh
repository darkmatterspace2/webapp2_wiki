#!/bin/sh

# This script generates src/config/supabase.config.js from Environment Variables
# It is intended to be run during the build process (e.g. on Netlify/Vercel)

echo "Generating src/config/supabase.config.js..."

cat <<EOF > src/config/supabase.config.js
// SUPABASE & API CONFIGURATION
// Generated Configuration

window.SUPABASE_URL = "${SUPABASE_URL}";
window.SUPABASE_ANON_KEY = "${SUPABASE_ANON_KEY}";

// AI API Keys
window.GEMINI_API_KEY = "${GEMINI_API_KEY}";
window.OPENAI_API_KEY = "${OPENAI_API_KEY}";
window.ANTHROPIC_API_KEY = "${ANTHROPIC_API_KEY}";
window.XAI_API_KEY = "${XAI_API_KEY}";
EOF

echo "Done."
