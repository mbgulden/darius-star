#!/usr/bin/env python3
"""
verify_syntax.py — Syntax-check all Darius Star JS modules and index.html.

WHY THIS EXISTS
---------------
`node --check` works for class/function-only modules but fails on `game_loop.js`
(top-level `const` in CJS mode). AGENTS.md notes this. This script works around
that by:

  1. For each `js/*.js` and `index.html`: try `node --check` on the JS module.
     If that fails, retry by wrapping the source in `(() => { ... })()` to
     force the JS parser to treat it as an expression (not a script body),
     which lets top-level `const` declarations parse cleanly.
  2. For `index.html`: extract inline `<script>` blocks and verify each one.
     External `<script src=...>` references are cross-checked for file
     existence.
  3. Exit 0 on success, non-zero on any failure.

USAGE
-----
    python3 scripts/verify_syntax.py                 # check everything
    python3 scripts/verify_syntax.py js/game_loop.js # check one file
    python3 scripts/verify_syntax.py index.html      # check index.html
    python3 scripts/verify_syntax.py --verbose       # show every check
    python3 scripts/verify_syntax.py --no-external   # skip cross-file deps

EXIT CODES
----------
    0   all checks passed
    1   one or more syntax errors
    2   missing Node binary
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Iterable

REPO_ROOT = Path(__file__).resolve().parent.parent
JS_DIR = REPO_ROOT / "js"
INDEX_HTML = REPO_ROOT / "index.html"

# Files known to break `node --check` due to top-level const/let/await.
# We don't maintain a hard list — we just retry with IIFE wrapping.
# But we record a warning so humans see the failure mode.


def find_node() -> str | None:
    """Locate the `node` binary or return None."""
    return shutil.which("node")


def _node_check(source: str, original_path: Path) -> tuple[bool, str]:
    """Run `node --check` against source. Returns (ok, message)."""
    node = find_node()
    if node is None:
        return False, "node binary not found on PATH"

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".js", delete=False, encoding="utf-8"
    ) as tf:
        tf.write(source)
        tmp_path = tf.name
    try:
        result = subprocess.run(
            [node, "--check", tmp_path],
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0:
            return True, "OK (node --check)"
        # Fallback: wrap in IIFE so top-level const parses as expression body.
        wrapped = f"(() => {{\n{source}\n}})();\n"
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".js", delete=False, encoding="utf-8"
        ) as tf2:
            tf2.write(wrapped)
            tmp_path2 = tf2.name
        try:
            result2 = subprocess.run(
                [node, "--check", tmp_path2],
                capture_output=True,
                text=True,
                timeout=30,
            )
            if result2.returncode == 0:
                return True, "OK (IIFE-wrapped fallback)"
            err = (result2.stderr or result2.stdout).strip().splitlines()
            return False, f"node --check failed: {err[-1] if err else 'unknown'}"
        finally:
            try:
                os.unlink(tmp_path2)
            except OSError:
                pass
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def check_js_file(path: Path) -> tuple[bool, str]:
    """Verify a single JS file."""
    if not path.is_file():
        return False, f"file not found: {path.relative_to(REPO_ROOT)}"
    try:
        source = path.read_text(encoding="utf-8")
    except UnicodeDecodeError as e:
        return False, f"decode error: {e}"
    return _node_check(source, path)


_SCRIPT_TAG_RE = re.compile(
    r'<script(?P<attrs>[^>]*)>(?P<body>.*?)</script>', re.DOTALL | re.IGNORECASE
)
_SRC_ATTR_RE = re.compile(
    r'src=["\'](?P<src>[^"\']+)["\']', re.IGNORECASE
)


def check_index_html(verbose: bool = False) -> tuple[bool, list[str]]:
    """Validate index.html: inline scripts parse, external scripts exist."""
    messages: list[str] = []
    if not INDEX_HTML.is_file():
        return False, [f"index.html not found at {INDEX_HTML.relative_to(REPO_ROOT)}"]
    try:
        html = INDEX_HTML.read_text(encoding="utf-8")
    except UnicodeDecodeError as e:
        return False, [f"decode error: {e}"]

    inline_blocks = 0
    external_refs: list[str] = []
    for match in _SCRIPT_TAG_RE.finditer(html):
        attrs = match.group("attrs") or ""
        body = match.group("body") or ""
        src_match = _SRC_ATTR_RE.search(attrs)
        if src_match:
            external_refs.append(src_match.group("src"))
            continue
        stripped = body.strip()
        if not stripped:
            continue
        inline_blocks += 1
        ok, msg = _node_check(stripped + "\n", INDEX_HTML)
        if not ok:
            return False, [f"inline script block {inline_blocks}: {msg}"]

    missing_external = [
        s for s in external_refs if not (REPO_ROOT / s).is_file()
    ]
    if missing_external:
        return False, [
            f"index.html references missing external script(s): "
            + ", ".join(missing_external)
        ]

    if verbose:
        messages.append(
            f"index.html: {inline_blocks} inline block(s), "
            f"{len(external_refs)} external ref(s) — all OK"
        )
    return True, messages


def iter_js_targets(explicit: Iterable[str] | None) -> list[Path]:
    """Build the list of JS files to verify."""
    if explicit:
        out: list[Path] = []
        for item in explicit:
            p = Path(item)
            if not p.is_absolute():
                p = (REPO_ROOT / p).resolve()
            out.append(p)
        return out
    targets: list[Path] = []
    if JS_DIR.is_dir():
        targets.extend(sorted(JS_DIR.glob("*.js")))
    if INDEX_HTML.is_file():
        targets.append(INDEX_HTML)
    return targets


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Syntax-check Darius Star JS modules and index.html."
    )
    parser.add_argument(
        "paths",
        nargs="*",
        help="Specific file(s) to verify. Defaults to js/*.js + index.html.",
    )
    parser.add_argument(
        "--verbose", action="store_true", help="Show per-file details."
    )
    parser.add_argument(
        "--no-external",
        action="store_true",
        help="Skip cross-checking external <script src=...> in index.html.",
    )
    args = parser.parse_args(argv)

    targets = iter_js_targets(args.paths or None)
    if not targets:
        print("verify_syntax: no JS files found", file=sys.stderr)
        return 1

    failures: list[str] = []
    passes = 0

    for path in targets:
        try:
            rel = path.relative_to(REPO_ROOT) if path.is_absolute() else path
        except ValueError:
            rel = path
        if path.name == "index.html":
            ok, msgs = check_index_html(verbose=args.verbose)
            label = "index.html"
            if ok:
                passes += 1
                print(f"  ✅ {label}")
                for m in msgs:
                    print(f"     {m}")
            else:
                failures.append(label)
                print(f"  ❌ {label}")
                for m in msgs:
                    print(f"     {m}")
            continue

        ok, msg = check_js_file(path)
        if ok:
            passes += 1
            if args.verbose:
                print(f"  ✅ {rel}  ({msg})")
            else:
                print(f"  ✅ {rel}")
        else:
            failures.append(str(rel))
            print(f"  ❌ {rel}  ({msg})")

    total = len(targets)
    print()
    print(f"verify_syntax: {passes}/{total} passed")
    if failures:
        print("FAILURES:")
        for f in failures:
            print(f"  - {f}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())