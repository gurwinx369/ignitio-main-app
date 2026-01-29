#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting JupyterLite build process..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if JupyterLite is installed
echo -e "${BLUE}📦 Checking JupyterLite installation...${NC}"
if ! command -v jupyter &> /dev/null; then
    echo -e "${RED}❌ JupyterLite is not installed${NC}"
    echo "Please run: pip install jupyterlite-core jupyterlite-pyodide-kernel"
    exit 1
fi
echo -e "${GREEN}✓ JupyterLite found${NC}"

# Step 2: Check if notebooks directory exists
echo -e "${BLUE}📁 Checking notebooks directory...${NC}"
if [ ! -d "features/notebooks" ]; then
    echo -e "${RED}❌ features/notebooks/ directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Notebooks directory found${NC}"

# Step 3: Count notebooks
NOTEBOOK_COUNT=$(find notebooks -name "*.ipynb" | wc -l)
echo -e "${GREEN}✓ Found ${NOTEBOOK_COUNT} notebook(s)${NC}"

# Step 4: Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf public/jupyter
mkdir -p public/jupyter
echo -e "${GREEN}✓ Cleaned${NC}"

# Step 5: Build JupyterLite
echo -e "${BLUE}🔨 Building JupyterLite with notebooks...${NC}"
jupyter lite build \
  --contents features/notebooks/ \
  --output-dir public/jupyter \
  --config jupyter-lite.json

echo -e "${GREEN}✓ Build complete${NC}"

# Step 6: Verify build output
echo -e "${BLUE}🔍 Verifying build output...${NC}"

# Check if essential files exist
if [ ! -f "public/jupyter/lab/index.html" ]; then
    echo -e "${RED}❌ Missing lab/index.html${NC}"
    exit 1
fi

# Check if notebooks were copied
BUILT_NOTEBOOKS=$(find public/jupyter -name "*.ipynb" | wc -l)
echo -e "${GREEN}✓ Built with ${BUILT_NOTEBOOKS} notebook(s)${NC}"

# List the structure
echo -e "${BLUE}📂 Build structure:${NC}"
tree -L 3 public/jupyter || ls -R public/jupyter

echo -e "${GREEN}✅ JupyterLite build successful!${NC}"
