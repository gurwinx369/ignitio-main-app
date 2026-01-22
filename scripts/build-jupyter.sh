#!/bin/bash

# Exit on any error
set -e

echo "🔨 Building JupyterLite for Next.js..."
echo ""

# Check if jupyter lite is installed
if ! command -v jupyter &> /dev/null; then
    echo "❌ JupyterLite not found!"
    echo "📦 Installing JupyterLite..."
    pip3 install jupyterlite-core jupyterlite-pyodide-kernel
    echo "✅ Installation complete!"
    echo ""
fi

# Clean previous build
if [ -d "public/jupyter" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf public/jupyter
fi

# Build JupyterLite
echo "🏗️  Building JupyterLite..."
jupyter lite build \
  --contents notebooks \
  --output-dir public/jupyter \
  --lite-dir public/jupyter

# Check if build was successful
if [ -d "public/jupyter" ]; then
    echo ""
    echo "✅ JupyterLite built successfully!"
    echo "📁 Output directory: public/jupyter"
    echo "📝 Files:"
    ls -lh public/jupyter/lab/
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Run 'npm run dev' to test locally"
    echo "   2. Visit http://localhost:3000"
    echo "   3. Navigate to your practice page"
else
    echo "❌ Build failed!"
    exit 1
fi
