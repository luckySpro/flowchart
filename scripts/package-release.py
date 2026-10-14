#!/usr/bin/env python3
"""Validate and name platform-specific bundles without mutating their bytes."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument("--target", required=True)
p.add_argument("--platform", required=True)
args = p.parse_args()
root = Path(__file__).resolve().parents[1]
version = json.loads((root / "package.json").read_text())["version"]
bundle = root / "src-tauri/target" / args.target / "release/bundle"
expected = {"macos-arm64": ["dmg"], "macos-x64": ["dmg"],
            "windows-x64": ["exe"], "linux-x64": ["AppImage", "deb"]}[args.platform]
out = root / "release-artifacts"
out.mkdir(exist_ok=True)
items = []
for extension in expected:
    matches = list(bundle.rglob(f"*.{extension}"))
    if len(matches) != 1 or matches[0].stat().st_size < 100_000:
        raise RuntimeError(f"Expected one nonempty {extension} bundle; found {matches}")
    source = matches[0]
    name = f"xutu-studio_{version}_{args.platform}.{extension}"
    dest = out / name
    shutil.copyfile(source, dest)
    items.append({"name": name, "platform": args.platform, "bytes": dest.stat().st_size,
                  "sha256": hashlib.file_digest(dest.open("rb"), "sha256").hexdigest(),
                  "os_signed": False, "channel": "preview"})
(out / f"manifest-{args.platform}.json").write_text(json.dumps(items, indent=2) + "\n")
shutil.copyfile(root / "src-tauri/licenses/THIRD_PARTY_LICENSES.txt", out / f"LICENSES-{args.platform}.txt")
print(json.dumps(items, indent=2))
