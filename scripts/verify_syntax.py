#!/usr/bin/env python3
import os
import sys
import subprocess
from pathlib import Path

def main():
    repo_root = Path(__file__).resolve().parent.parent
    js_dir = repo_root / "js"
    
    print("Checking syntax of all JS files recursively...")
    error_count = 0
    
    # Recursively find all .js files
    js_files = []
    for root, dirs, files in os.walk(js_dir):
        for file in files:
            if file.endswith('.js'):
                js_files.append(Path(root) / file)
                
    js_files.sort()
    
    for fp in js_files:
        rel_path = fp.relative_to(repo_root)
        # Use node's vm.Script to check syntax
        node_code = """
const fs = require('fs');
const vm = require('vm');
try {
    const code = fs.readFileSync(process.argv[1], 'utf8');
    new vm.Script(code, { filename: process.argv[1] });
    process.exit(0);
} catch (err) {
    console.error('Syntax error:', err.message);
    console.error(err.stack);
    process.exit(1);
}
"""
        res = subprocess.run(
            ["node", "-e", node_code, str(fp)],
            capture_output=True,
            text=True
        )
        if res.returncode != 0:
            print(f"❌ {rel_path} has syntax errors:")
            print(res.stderr.strip())
            error_count += 1
        else:
            print(f"✅ {rel_path} is valid.")
            
    print(f"\nSyntax verification complete. Total errors: {error_count}")
    if error_count > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()
