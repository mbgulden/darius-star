import os
import re

base_dir = "/home/ubuntu/work/darius-star"
js_dir = os.path.join(base_dir, "js")

# Find all JS files
js_files = []
for root, dirs, files in os.walk(js_dir):
    for file in files:
        if file.endswith(".js"):
            js_files.append(os.path.join(root, file))

# We also check index.html
html_files = [os.path.join(base_dir, "index.html")]

all_files = js_files + html_files

# Standard browser/JS globals to ignore
ignored_globals = {
    'Math', 'console', 'window', 'document', 'localStorage', 'sessionStorage',
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Image', 'AudioContext',
    'Audio', 'requestAnimationFrame', 'cancelAnimationFrame', 'Array', 'Object', 'String',
    'Number', 'Boolean', 'RegExp', 'Date', 'JSON', 'Error', 'Promise', 'navigator', 'screen',
    'location', 'history', 'alert', 'confirm', 'prompt', 'parseInt', 'parseFloat', 'isNaN',
    'decodeURIComponent', 'encodeURIComponent', 'eval', 'Map', 'Set', 'length', 'width', 'height',
    'x', 'y', 'ctx', 'canvas', 'dt', 'e', 'i', 'j', 'k', 'n', 's', 't', 'p', 'r', 'g', 'b', 'a',
    'url', 'img', 'audio', 'video', 'src', 'id', 'name', 'type', 'state', 'value', 'options',
    'Event', 'MouseEvent', 'TouchEvent', 'KeyboardEvent', 'self', 'globalThis', 'URL', 'fetch',
    'localStorage', 'FileReader', 'Uint8Array', 'Float32Array', 'XMLHttpRequest', 'FormData'
}

# Patterns
# Match top-level function declarations
func_decl = re.compile(r'^\s*function\s+([A-Za-z0-9_]+)\s*\(')
# Match top-level class declarations
class_decl = re.compile(r'^\s*class\s+([A-Za-z0-9_]+)')
# Match top-level variable declarations (const, let, var)
var_decl = re.compile(r'^\s*(?:const|let|var)\s+([A-Za-z0-9_]+)\s*(?:=|,|;)')

declarations = {} # name -> list of (file, type)
usages = {} # name -> list of files

for file_path in all_files:
    rel_path = os.path.relpath(file_path, base_dir)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Simple lexical scanner for usages
    # Find all words (identifiers)
    words = set(re.findall(r'\b[A-Za-z_][A-Za-z0-9_]*\b', content))
    for word in words:
        if word not in usages:
            usages[word] = []
        usages[word].append(rel_path)

    # Let's find declarations line-by-line
    lines = content.split('\n')
    for idx, line in enumerate(lines):
        # We check top-level-ish (no leading whitespace or very little)
        # To be safe, we allow up to 8 leading spaces
        stripped = line.lstrip()
        leading_spaces = len(line) - len(stripped)
        if leading_spaces > 8:
            continue
            
        # Match function
        m = func_decl.match(line)
        if m:
            name = m.group(1)
            if name not in declarations:
                declarations[name] = []
            declarations[name].append((rel_path, "function", idx+1))
            continue
            
        # Match class
        m = class_decl.match(line)
        if m:
            name = m.group(1)
            if name not in declarations:
                declarations[name] = []
            declarations[name].append((rel_path, "class", idx+1))
            continue
            
        # Match variable
        m = var_decl.match(line)
        if m:
            name = m.group(1)
            if name not in declarations:
                declarations[name] = []
            declarations[name].append((rel_path, "variable", idx+1))

print("=== DEFECTIONS (Multiple Declarations / Collisions) ===")
duplicate_count = 0
for name, decls in declarations.items():
    if len(decls) > 1:
        print(f"Global '{name}' declared multiple times:")
        for file, dtype, line in decls:
            print(f"  - {file}:{line} ({dtype})")
        duplicate_count += 1

print(f"\nTotal duplicates/collisions: {duplicate_count}")

print("\n=== DEAD CODE (Declared but never used elsewhere) ===")
dead_count = 0
for name, decls in declarations.items():
    # If the only file that contains this word is the file(s) that declare it, it's dead code!
    decl_files = {d[0] for d in decls}
    usage_files = set(usages.get(name, []))
    other_usage_files = usage_files - decl_files
    if not other_usage_files:
        # Check if it is used in index.html (which is in other_usage_files since we separate it)
        # and not in ignored globals
        if name not in ignored_globals:
            print(f"Global '{name}' declared in {list(decl_files)} but not used in any other file.")
            dead_count += 1

print(f"\nTotal dead code globals: {dead_count}")
