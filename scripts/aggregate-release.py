import hashlib
import json
import os
import subprocess
from pathlib import Path
from upload_assets import upload

directory = Path("release-artifacts")
platforms = {"macos-arm64", "macos-x64", "windows-x64", "linux-x64"}
manifests = list(directory.glob("manifest-*.json"))
assert {p.stem.removeprefix("manifest-") for p in manifests} == platforms
items = []
for path in manifests:
    items.extend(json.loads(path.read_text()))
assert len(items) == 5, "Expected two macOS, one Windows and two Linux installers"
repo, tag = os.environ["GITHUB_REPOSITORY"], os.environ["TAG"]
for item in items:
    path = directory / item["name"]
    with path.open("rb") as stream:
        assert hashlib.file_digest(stream, "sha256").hexdigest() == item["sha256"]
    assert path.stat().st_size == item["bytes"]
    item["url"] = f"https://github.com/{repo}/releases/download/{tag}/{item['name']}"
catalog = directory / "DOWNLOADS.json"
catalog.write_text(json.dumps({"version": tag.removeprefix("v"), "channel": "preview",
    "source_commit": subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip(),
    "upgrade_mode": "manual-full-installer", "assets": items}, indent=2) + "\n")
sums = directory / "SHA256SUMS"
lines = []
for path in sorted(directory.iterdir()):
    if path.is_file() and path.name != "SHA256SUMS":
        with path.open("rb") as stream:
            lines.append(f"{hashlib.file_digest(stream,'sha256').hexdigest()}  {path.name}")
sums.write_text("\n".join(lines) + "\n")
upload([catalog, sums])
print("All four targets complete; draft ready for preview publication")
