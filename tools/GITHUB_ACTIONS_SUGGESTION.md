# Darius Star Asset Pipeline
# Suggested GitHub Actions Workflow for CI/CD (Cloudflare Pages / GitHub Pages)
# Save this as .github/workflows/asset-pipeline.yml if you have the necessary permissions.

# name: Asset Pipeline
#
# on:
#   push:
#     branches: [ main ]
#     paths:
#       - 'assets/**'
#       - 'tools/**'
#   pull_request:
#     branches: [ main ]
#
# jobs:
#   build:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#
#       - name: Set up Python
#         uses: actions/setup-python@v5
#         with:
#           python-with: '3.10'
#
#       - name: Install dependencies
#         run: |
#           python -m pip install --upgrade pip
#           pip install Pillow
#
#       - name: Run Asset Pipeline
#         run: |
#           chmod +x tools/asset_pipeline.sh
#           ./tools/asset_pipeline.sh
#
#       - name: Verify Manifest
#         run: |
#           if [ ! -f assets/ASSET_MANIFEST.json ]; then
#             echo "Manifest not generated!"
#             exit 1
#           fi
