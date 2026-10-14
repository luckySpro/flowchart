#!/usr/bin/env python3
"""Collect installed dependency license metadata and distributed notices locally."""
import json
import os
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src-tauri/licenses"
OUT.mkdir(exist_ok=True)
entries = []
notices = []

def collect(name, version, license_name, directory, source, license_file=None):
    if not license_name:
        raise RuntimeError(f"Missing license declaration: {name}@{version}")
    files = set()
    for pattern in ("LICENSE*", "LICENCE*", "COPYING*", "NOTICE*"):
        files.update(p for p in directory.glob(pattern) if p.is_file())
    if license_file:
        path = directory / license_file
        if path.is_file():
            files.add(path)
    entries.append({"name": name, "version": version, "license": license_name,
                    "source": source, "notice_files": [p.name for p in sorted(files)]})
    notices.append(f"\n{'=' * 72}\n{name} {version}\nLicense: {license_name}\nSource: {source}\n")
    for path in sorted(files):
        if path.stat().st_size > 1024 * 1024:
            raise RuntimeError(f"License unexpectedly large: {name}/{path.name}")
        notices.append(f"\n--- {path.name} ---\n" + path.read_text(encoding="utf-8", errors="replace"))

lock = json.loads((ROOT / "package-lock.json").read_text())
for key, item in lock["packages"].items():
    if not key or not (ROOT / key / "package.json").exists():
        continue  # Optional dependencies not installed on this target.
    metadata = json.loads((ROOT / key / "package.json").read_text())
    collect(metadata["name"], metadata["version"], metadata.get("license"), ROOT / key,
            item.get("resolved", metadata.get("homepage", "npm registry")))

cargo_home = Path(os.environ.get("CARGO_HOME", str(Path.home() / ".cargo")))
missing = []
for package in tomllib.loads((ROOT / "src-tauri/Cargo.lock").read_text())["package"]:
    if not package.get("source"):
        continue
    candidates = sorted((cargo_home / "registry/src").glob(f"*/{package['name']}-{package['version']}/Cargo.toml"))
    if not candidates:
        missing.append(package["name"] + "@" + package["version"])
        continue  # Other-platform dependencies not fetched by this target.
    manifest = candidates[0]
    crate = tomllib.loads(manifest.read_text())["package"]
    collect(package["name"], package["version"], crate.get("license"),
            manifest.parent, package["source"], crate.get("license-file"))
(OUT / "other-platform-dependencies.json").write_text(json.dumps(missing, indent=2) + "\n")

(OUT / "dependency-inventory.json").write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n")
(OUT / "THIRD_PARTY_LICENSES.txt").write_text("Third-party dependency notices — M&J Group\n" + "\n".join(notices))
print(f"Collected license metadata and notices for {len(entries)} installed dependencies")
