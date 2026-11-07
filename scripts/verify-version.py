#!/usr/bin/env python3
"""Fail closed on version inconsistencies; does not certify runtime behavior."""
import json
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parents[1]
manifest = json.loads((root / "radar-version.json").read_text(encoding="utf-8"))
active = manifest["canonical_version"]
previous = manifest["previous_version"]
html = (root / "index.html").read_text(encoding="utf-8")
title = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
errors = []
if not title or active not in title.group(1):
    errors.append("HTML title does not match canonical version")
if previous == active:
    errors.append("Rollback version cannot be active version")
if manifest.get("previous_role") != "rollback_only":
    errors.append("Previous version must be rollback_only")
if manifest.get("validation_status") not in ("not_verified", "verified"):
    errors.append("Invalid validation status")
if manifest.get("validation_status") == "verified":
    errors.append("Do not mark verified without an evidence-based test pipeline")
for error in errors:
    print("FAIL:", error, file=sys.stderr)
if errors:
    sys.exit(1)
print(f"PASS: version identity {active}; {previous} rollback only. Engine and deployment NOT verified.")
