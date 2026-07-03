#!/bin/bash
# Darius Star Asset Pipeline Wrapper
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Darius Star Asset Pipeline...${NC}"

# Check for Python 3
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed."
    exit 1
fi

# Ensure we are in the repo root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR/.."

# Run the Python pipeline
python3 tools/asset_pipeline.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Asset pipeline completed successfully!${NC}"
else
    echo "Asset pipeline failed."
    exit 1
fi
