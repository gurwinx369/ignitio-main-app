#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Hybrid JupyterLite build process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if Python is available
echo -e "${BLUE}🐍 Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found: $(python3 --version)${NC}"

# Step 2: Create and activate virtual environment
echo -e "${BLUE}📦 Setting up virtual environment...${NC}"
if [ -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  Removing existing virtual environment...${NC}"
    rm -rf .venv
fi

python3 -m venv .venv
source .venv/bin/activate
echo -e "${GREEN}✓ Virtual environment created and activated${NC}"

# Step 3: Upgrade pip
echo -e "${BLUE}⬆️  Upgrading pip...${NC}"
pip install --upgrade pip --quiet
echo -e "${GREEN}✓ pip upgraded${NC}"

# Step 4: Install ALL required packages (including nbconvert for HTML generation)
echo -e "${BLUE}📥 Installing packages...${NC}"
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt --quiet
else
    pip install jupyterlite-core jupyterlite-pyodide-kernel jupyter-server nbconvert --quiet
fi
echo -e "${GREEN}✓ All packages installed${NC}"

# Step 5: Verify installation
echo -e "${BLUE}📦 Verifying installation...${NC}"
if ! command -v jupyter &> /dev/null; then
    echo -e "${RED}❌ Installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Jupyter tools ready: $(jupyter --version | head -n 1)${NC}"

# Step 6: Check notebooks directory
echo -e "${BLUE}📁 Checking notebooks directory...${NC}"
if [ ! -d "features/notebooks" ]; then
    echo -e "${RED}❌ features/notebooks/ directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Notebooks directory found${NC}"

# Step 7: Count notebooks
NOTEBOOK_COUNT=$(find features/notebooks -name "*.ipynb" 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Found ${NOTEBOOK_COUNT} notebook(s)${NC}"

# Step 8: Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
rm -rf public/jupyter
rm -rf public/notebooks-static
mkdir -p public/jupyter
mkdir -p public/notebooks-static
echo -e "${GREEN}✓ Cleaned${NC}"

# ============================================
# STEP 9: BUILD STATIC HTML (Fast Loading)
# ============================================
echo -e "${BLUE}📄 Building static HTML notebooks (for fast display)...${NC}"
CONVERTED_COUNT=0

# shellcheck disable=SC2044
for notebook in $(find features/notebooks -name "*.ipynb"); do
    # Get relative path
    rel_path="${notebook#features/notebooks/}"
    dir_path=$(dirname "$rel_path")
    file_name=$(basename "$rel_path" .ipynb)

    # Create directory structure
    mkdir -p "public/notebooks-static/$dir_path"

    # Convert to HTML with custom template for better styling
    jupyter nbconvert \
        --to html \
        "$notebook" \
        --output-dir="public/notebooks-static/$dir_path" \
        --output="$file_name" \
        --template lab \
        --no-prompt \
        2>/dev/null

    CONVERTED_COUNT=$((CONVERTED_COUNT + 1))
    echo -e "${GREEN}  ✓ Static HTML: $rel_path${NC}"
done

echo -e "${GREEN}✓ Generated ${CONVERTED_COUNT} static HTML notebooks${NC}"

# ============================================
# STEP 10: BUILD JUPYTERLITE (Interactive)
# ============================================
echo -e "${BLUE}🔨 Building JupyterLite (for interactive mode)...${NC}"

# Create jupyter-lite.json if it doesn't exist
if [ ! -f "jupyter-lite.json" ]; then
    echo -e "${YELLOW}⚠️  Creating jupyter-lite.json with RetroLab config${NC}"
    cat > jupyter-lite.json << 'JSONEOF'
{
  "jupyter-lite-schema-version": 0,
  "jupyter-config-data": {
    "appName": "Git & GitHub Learning",
    "appVersion": "0.1.0",
    "disabledExtensions": [],
    "settingsOverrides": {}
  },
  "jupyter-lite-applications": {
    "lab": true,
    "retro": true
  }
}
JSONEOF
fi

jupyter lite build \
  --apps lab retro \
  --contents features/notebooks/ \
  --output-dir public/jupyter \
  --config jupyter-lite.json

echo -e "${GREEN}✓ JupyterLite build complete (with Lab + Retro)${NC}"

# Step 11: Verify builds
echo -e "${BLUE}🔍 Verifying outputs...${NC}"

# Check static HTML
STATIC_HTML_COUNT=$(find public/notebooks-static -name "*.html" 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Static HTML files: ${STATIC_HTML_COUNT}${NC}"

# Check JupyterLite
if [ ! -f "public/jupyter/lab/index.html" ]; then
    echo -e "${RED}❌ Missing JupyterLite lab/index.html${NC}"
    exit 1
fi
echo -e "${GREEN}✓ JupyterLite ready${NC}"

# Step 12: Create index page for static notebooks
echo -e "${BLUE}📋 Creating static notebook index...${NC}"
cat > public/notebooks-static/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Git & GitHub Notebooks</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        h1 {
            color: white;
            text-align: center;
            margin-bottom: 40px;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .category {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .category h2 {
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 12px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        ul { list-style: none; }
        li { margin: 12px 0; }
        a {
            color: #667eea;
            text-decoration: none;
            font-size: 16px;
            display: block;
            padding: 12px 16px;
            background: #f7fafc;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            transition: all 0.2s;
        }
        a:hover {
            background: #edf2f7;
            transform: translateX(4px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Git & GitHub Learning Path</h1>

        <div class="category">
            <h2>Beginner Level</h2>
            <ul>
                <li><a href="beginner/A1-setup-sprint.html">A1: Setup Sprint - Install & Configure Git</a></li>
                <li><a href="beginner/A2-first-repo-forge.html">A2: First Repo Forge - Create Your First Repository</a></li>
                <li><a href="beginner/A3-stage-and-ship.html">A3: Stage and Ship - Basic Git Workflow</a></li>
            </ul>
        </div>

        <div class="category">
            <h2>Intermediate Level</h2>
            <ul>
                <li><a href="intermediate/B1-staging-strategist.html">B1: Staging Strategist - Advanced Staging</a></li>
                <li><a href="intermediate/B2-branch-basics.html">B2: Branch Basics - Branching & Merging</a></li>
                <li><a href="intermediate/B3-history-hacker.html">B3: History Hacker - Git History Management</a></li>
            </ul>
        </div>

        <div class="category">
            <h2>Advanced Level</h2>
            <ul>
                <li><a href="advanced/C1-remote-rider.html">C1: Remote Rider - Working with Remotes</a></li>
                <li><a href="advanced/C2-fork-and-pr-agent.html">C2: Fork and PR Agent - Collaboration Workflow</a></li>
                <li><a href="advanced/C3-collab-captain.html">C3: Collab Captain - Advanced Collaboration</a></li>
            </ul>
        </div>
    </div>
</body>
</html>
EOF
echo -e "${GREEN}✓ Index page created${NC}"

# Step 13: Display build structure
echo -e "${BLUE}📂 Build structure:${NC}"
echo -e "${GREEN}Static HTML:${NC}"
if command -v tree &> /dev/null; then
    tree -L 2 public/notebooks-static
else
    # shellcheck disable=SC2012
    ls -lR public/notebooks-static | head -n 30
fi

# Step 14: Deactivate virtual environment
deactivate
echo -e "${GREEN}✓ Virtual environment deactivated${NC}"

echo -e "${GREEN}✅ Hybrid build successful!${NC}"
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  - Notebooks found: ${NOTEBOOK_COUNT}"
echo -e "  - Static HTML generated: ${STATIC_HTML_COUNT}"
echo -e "  - JupyterLite ready: ✓"
echo -e "  - Static output: public/notebooks-static/"
echo -e "  - Interactive output: public/jupyter/"
