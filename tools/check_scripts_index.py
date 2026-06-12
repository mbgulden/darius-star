import os
import re

base_dir = "/home/ubuntu/work/darius-star"
js_dir = os.path.join(base_dir, "js")

# Get list of JS files
js_files = []
for root, dirs, files in os.walk(js_dir):
    for file in files:
        if file.endswith(".js"):
            js_files.append(os.path.relpath(os.path.join(root, file), base_dir))

print(f"Found {len(js_files)} JS files.")

# Regex patterns for declarations
class_pat = re.compile(r'class\s+([A-Za-z0-9_]+)')
func_pat = re.compile(r'function\s+([A-Za-z0-9_]+)')
var_pat = re.compile(r'(?:const|let|var)\s+([A-Za-z0-9_]+)\s*(?:=|,|;)')

# Let's read index.html script tags
index_path = os.path.join(base_dir, "index.html")
with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

script_tags = re.findall(r'<script\s+src=["\'](js/[^"\']+)["\']\s*></script>', index_content)
print(f"Loaded in index.html ({len(script_tags)} scripts):")
for idx, tag in enumerate(script_tags):
    print(f"  {idx+1}. {tag}")

# Check which files are not loaded in index.html
not_loaded = [f for f in js_files if f not in script_tags]
print(f"\nNot loaded in index.html ({len(not_loaded)} scripts):")
for f in not_loaded:
    print(f"  {f}")
