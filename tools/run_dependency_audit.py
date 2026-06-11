import os
import re

base_dir = "/home/ubuntu/work/darius-star"

# Standard JS / Browser globals to ignore
js_globals = {
    'Math', 'console', 'window', 'document', 'localStorage', 'sessionStorage',
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Image', 'AudioContext',
    'Audio', 'requestAnimationFrame', 'cancelAnimationFrame', 'Array', 'Object', 'String',
    'Number', 'Boolean', 'RegExp', 'Date', 'JSON', 'Error', 'Promise', 'navigator', 'screen',
    'location', 'history', 'alert', 'confirm', 'prompt', 'parseInt', 'parseFloat', 'isNaN',
    'decodeURIComponent', 'encodeURIComponent', 'eval', 'Map', 'Set', 'length', 'width', 'height',
    'ctx', 'canvas', 'dt', 'e', 'i', 'j', 'k', 'n', 's', 't', 'p', 'r', 'g', 'b', 'a', 'x', 'y',
    'url', 'img', 'audio', 'video', 'src', 'id', 'name', 'type', 'state', 'value', 'options',
    'Event', 'MouseEvent', 'TouchEvent', 'KeyboardEvent', 'self', 'globalThis', 'URL', 'fetch',
    'FileReader', 'Uint8Array', 'Float32Array', 'XMLHttpRequest', 'FormData', 'URLSearchParams',
    'localStorage', 'localStorageKey', 'Math', 'PI', 'sin', 'cos', 'tan', 'abs', 'min', 'max',
    'random', 'floor', 'ceil', 'round', 'sqrt', 'pow', 'atan2', 'innerWidth', 'innerHeight',
    'webkitAudioContext', 'location', 'href', 'search', 'WebSocket', 'localStorage', 'sessionStorage',
    'Image', 'Audio', 'HTMLElement', 'Element', 'Node', 'Document', 'Window', 'request',
    'undefined', 'null', 'true', 'false', 'arguments', 'this', 'super'
}

# Python/JS Keywords to ignore
keywords = {
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete',
    'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in',
    'instanceof', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
    'void', 'while', 'with', 'yield', 'let', 'static', 'enum', 'await', 'implements', 'package',
    'protected', 'static', 'interface', 'private', 'public'
}

ignore_all = js_globals.union(keywords)

# Get the script load order from index.html
index_path = os.path.join(base_dir, "index.html")
with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

# Find all <script src="..."> tags in index.html
loaded_scripts = re.findall(r'<script\s+src=["\'](js/[^"\']+)["\']\s*></script>', index_content)

print(f"Loaded {len(loaded_scripts)} scripts from index.html in order.")

# Scan all JS files in js/ to find all declarations
js_dir = os.path.join(base_dir, "js")
all_js_files = []
for root, dirs, files in os.walk(js_dir):
    for file in files:
        if file.endswith(".js"):
            all_js_files.append(os.path.relpath(os.path.join(root, file), base_dir))

# Find definitions in each file
defs = {} # file -> set of defined globals
for file in all_js_files:
    file_path = os.path.join(base_dir, file)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    file_defs = set()
    # Check function declarations
    funcs = re.findall(r'^\s*function\s+([A-Za-z0-9_]+)\s*\(', content, re.MULTILINE)
    # Check class declarations
    classes = re.findall(r'^\s*class\s+([A-Za-z0-9_]+)', content, re.MULTILINE)
    # Check var/let/const declarations (only top-level-ish with 0 to 8 spaces of indent)
    for line in content.split('\n'):
        stripped = line.lstrip()
        leading = len(line) - len(stripped)
        if leading <= 8:
            m = re.match(r'^(?:const|let|var)\s+([A-Za-z0-9_]+)\s*(?:=|,|;)', stripped)
            if m:
                file_defs.add(m.group(1))
    
    file_defs.update(funcs)
    file_defs.update(classes)
    defs[file] = file_defs

# Create global map of definition -> file
global_defs = {}
for file, file_defs in defs.items():
    for d in file_defs:
        if d not in global_defs:
            global_defs[d] = []
        global_defs[d].append(file)

# Scan loaded scripts for references and check load order
print("\n=== Dependency & Load Order Audit ===")
violations_count = 0
for idx, script in enumerate(loaded_scripts):
    script_path = os.path.join(base_dir, script)
    if not os.path.exists(script_path):
        print(f"⚠️  Script '{script}' listed in index.html but file does not exist (404)!")
        violations_count += 1
        continue
        
    with open(script_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Find all words (possible references)
    words = set(re.findall(r'\b[A-Za-z_][A-Za-z0-9_]*\b', content))
    referenced = words - ignore_all - defs[script]
    
    # Check if any referenced word is a global defined in another file
    for ref in referenced:
        if ref in global_defs:
            def_files = global_defs[ref]
            # Check if all definition files are loaded after this script
            for df in def_files:
                if df in loaded_scripts:
                    df_idx = loaded_scripts.index(df)
                    if df_idx > idx:
                        # Loaded after! This is a load order violation if used at script load time.
                        # Note: If it's used inside a function, it's lazy binding and usually fine
                        # unless that function is called at load time.
                        # Let's print this warning.
                        print(f"⚠️  {script} references '{ref}' which is defined in {df} (loaded LATER at position {df_idx+1})")
                        violations_count += 1

print(f"\nTotal load order dependencies flagged: {violations_count}")
