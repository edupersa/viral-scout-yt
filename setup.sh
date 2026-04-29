#!/bin/bash
# ViralScout — Setup script
# Run this once after cloning the repo

set -e

echo "🚀 ViralScoutYt — Setup"
echo "====================="

# Check prerequisites
echo ""
echo "Checking prerequisites..."

command -v docker >/dev/null 2>&1 || { echo "❌ Docker not found. Install: https://docs.docker.com/get-docker/"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not found. Install: https://nodejs.org/"; exit 1; }
command -v python >/dev/null 2>&1 || { echo "❌ Python not found. Install: https://python.org/"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git not found. Install: https://git-scm.com/"; exit 1; }

echo "✅ Docker $(docker --version | grep -oP '\d+\.\d+\.\d+')"
echo "✅ Node $(node --version)"
echo "✅ Python $(python --version | grep -oP '\d+\.\d+\.\d+')"
echo "✅ Git $(git --version | grep -oP '\d+\.\d+\.\d+')"

# Create .env from example
if [ ! -f .env ]; then
    echo ""
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Edit .env and add your API keys before starting!"
    echo "   Required: YOUTUBE_API_KEY, ANTHROPIC_API_KEY, JWT_SECRET"
else
    echo ""
    echo "✅ .env already exists"
fi

# Generate JWT secret if still default
if grep -q "change_this_to_a_random_64_char_hex_string" .env 2>/dev/null; then
    JWT_SECRET=$(python -c "import secrets; print(secrets.token_hex(32))")
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/change_this_to_a_random_64_char_hex_string/$JWT_SECRET/" .env
    else
        sed -i "s/change_this_to_a_random_64_char_hex_string/$JWT_SECRET/" .env
    fi
    echo "✅ JWT_SECRET generated automatically"
fi

echo ""
echo "====================="
echo "Setup complete! Next steps:"
echo ""
echo "  1. Edit .env and add your API keys:"
echo "     - YOUTUBE_API_KEY  → https://console.cloud.google.com/apis/credentials"
echo "     - ANTHROPIC_API_KEY → https://console.anthropic.com/settings/keys"
echo ""
echo "  2. Start the project:"
echo "     docker compose up --build"
echo ""
echo "  3. Open in browser:"
echo "     Frontend: http://localhost:5173"
echo "     Backend:  http://localhost:8000/docs"
echo ""
