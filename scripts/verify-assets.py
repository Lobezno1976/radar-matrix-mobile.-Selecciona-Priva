#!/usr/bin/env python3
"""Check local script references and JavaScript syntax without executing the engine."""
import pathlib
import re
import subprocess
import sys
import tempfile
from urllib.parse import urlsplit

root = pathlib.Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
scripts = re.findall(r'<script\b[^>]*\bsrc=["\']([^"\']+)["\']', html, re.I)
errors = []
local = []
for src in scripts:
    url = urlsplit(src)
    if url.scheme or url.netloc:
        continue
    path = url.path.removeprefix("./")
    target = (root / path).resolve()
    if not target.is_relative_to(root) or not target.is_file():
        errors.append(f"Missing or unsafe script: {src}")
    else:
        local.append(target)
for target in dict.fromkeys(local):
    result = subprocess.run(["node", "--check", str(target)], capture_output=True, text=True)
    if result.returncode:
        errors.append(f"Syntax error in {target.name}: {result.stderr.strip()}")
inline = re.findall(r'<script\b(?![^>]*\bsrc=)[^>]*>(.*?)</script>', html, re.I | re.S)
for index, source in enumerate(inline, 1):
    if not source.strip():
        continue
    with tempfile.TemporaryDirectory() as tmp:
        path = pathlib.Path(tmp) / f"inline-{index}.js"
        path.write_text(source, encoding="utf-8")
        result = subprocess.run(["node", "--check", str(path)], capture_output=True, text=True)
        if result.returncode:
            errors.append(f"Inline script {index} syntax error: {result.stderr.strip()}")
for error in errors:
    print("FAIL:", error, file=sys.stderr)
if errors:
    sys.exit(1)
print(f"PASS: {len(local)} local script references present and JavaScript syntax checked; runtime behavior NOT verified.")
