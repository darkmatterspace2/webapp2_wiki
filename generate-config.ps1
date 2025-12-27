# PowerShell Script to generate src/config/supabase.config.js from .devops/.env
## Generate Config: Run the following command in your terminal:
## powershell -ExecutionPolicy Bypass -File .\generate-config.ps1
Write-Host "Generating src/config/supabase.config.js..."

$envPath = ".devops\.env"
$configPath = "src\config\supabase.config.js"

# 1. Load variables from .env if it exists
if (Test-Path $envPath) {
    Write-Host "Loading variables from $envPath..."
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^(?<key>[^#=]+)=(?<value>.*)$') {
            $key = $Matches['key'].Trim()
            $value = $Matches['value'].Trim()
            
            # Set as process environment variables (temporary options)
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            
            # Or just use them directly variables
            New-Variable -Name $key -Value $value -Force
        }
    }
} else {
    Write-Warning ".env file not found at $envPath"
}

# 2. Read environment variables (either from .env we just loaded, or system envs)
# Note: Use $env:VAR_NAME to access them. Failsafe to empty string if missing.

$SUPABASE_URL = $env:SUPABASE_URL
$SUPABASE_ANON_KEY = $env:SUPABASE_ANON_KEY
$GEMINI_API_KEY = $env:GEMINI_API_KEY
$OPENAI_API_KEY = $env:OPENAI_API_KEY
$ANTHROPIC_API_KEY = $env:ANTHROPIC_API_KEY
$XAI_API_KEY = $env:XAI_API_KEY

# 3. Create the file content
$content = @"
// SUPABASE & API CONFIGURATION
// Generated Configuration

window.SUPABASE_URL = "$SUPABASE_URL";
window.SUPABASE_ANON_KEY = "$SUPABASE_ANON_KEY";

// AI API Keys
window.GEMINI_API_KEY = "$GEMINI_API_KEY";
window.OPENAI_API_KEY = "$OPENAI_API_KEY";
window.ANTHROPIC_API_KEY = "$ANTHROPIC_API_KEY";
window.XAI_API_KEY = "$XAI_API_KEY";
"@

# 4. Write to file (UTF8)
$content | Set-Content -Path $configPath -Encoding UTF8

Write-Host "Done. Config file generated at $configPath"
