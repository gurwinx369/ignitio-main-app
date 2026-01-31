#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting JupyterLite build process..."

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

# Step 4: Install JupyterLite
echo -e "${BLUE}📥 Installing JupyterLite packages...${NC}"
pip install jupyterlite-core jupyterlite-pyodide-kernel --quiet
echo -e "${GREEN}✓ JupyterLite packages installed${NC}"

# Step 5: Verify JupyterLite installation
echo -e "${BLUE}📦 Verifying JupyterLite installation...${NC}"
if ! command -v jupyter &> /dev/null; then
    echo -e "${RED}❌ JupyterLite installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ JupyterLite found: $(jupyter --version | head -n 1)${NC}"

# Step 6: Check if notebooks directory exists
echo -e "${BLUE}📁 Checking notebooks directory...${NC}"
if [ ! -d "features/notebooks" ]; then
    echo -e "${RED}❌ features/notebooks/ directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Notebooks directory found${NC}"

# Step 7: Count notebooks
NOTEBOOK_COUNT=$(find features/notebooks -name "*.ipynb" 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Found ${NOTEBOOK_COUNT} notebook(s)${NC}"

# Step 8: Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf public/jupyter
mkdir -p public/jupyter
echo -e "${GREEN}✓ Cleaned${NC}"

# Step 9: Build JupyterLite
echo -e "${BLUE}🔨 Building JupyterLite with notebooks...${NC}"
if [ -f "jupyter-lite.json" ]; then
    jupyter lite build \
      --contents features/notebooks/ \
      --output-dir public/jupyter \
      --config jupyter-lite.json
else
    echo -e "${YELLOW}⚠️  jupyter-lite.json not found, building without config${NC}"
    jupyter lite build \
      --contents features/notebooks/ \
      --output-dir public/jupyter
fi
echo -e "${GREEN}✓ Build complete${NC}"

# Step 10: Verify build output
echo -e "${BLUE}🔍 Verifying build output...${NC}"

# Check if essential files exist
if [ ! -f "public/jupyter/lab/index.html" ]; then
    echo -e "${RED}❌ Missing lab/index.html${NC}"
    exit 1
fi
echo -e "${GREEN}✓ lab/index.html exists${NC}"

# Check if notebooks were copied
BUILT_NOTEBOOKS=$(find public/jupyter -name "*.ipynb" 2>/dev/null | wc -l)
echo -e "${GREEN}✓ Built with ${BUILT_NOTEBOOKS} notebook(s)${NC}"

# Step 11: List the structure
echo -e "${BLUE}📂 Build structure:${NC}"
if command -v tree &> /dev/null; then
    tree -L 3 public/jupyter
else
    ls -lR public/jupyter | head -n 50
fi

# Step 12: Deactivate virtual environment
deactivate
echo -e "${GREEN}✓ Virtual environment deactivated${NC}"

echo -e "${GREEN}✅ JupyterLite build successful!${NC}"
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  - Notebooks found: ${NOTEBOOK_COUNT}"
echo -e "  - Notebooks built: ${BUILT_NOTEBOOKS}"
echo -e "  - Output directory: public/jupyter"
