#!/bin/bash
set -e

echo "🔍 Checking JupyterLite build status..."

# If build already exists, skip
if [ -d "public/jupyter/build" ] && [ "$(ls -A public/jupyter/build)" ]; then
    echo "✅ JupyterLite build already exists, skipping rebuild"
    exit 0
fi

echo "⚠️  No JupyterLite build found. Please build locally and commit."
echo "   Run: pip install jupyterlab jupyterlite-core jupyterlite-pyodide-kernel"
echo "   Then: jupyter lite build --contents features/notebooks --output-dir public/jupyter/build"
exit 0
