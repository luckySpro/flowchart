import json
import os
import subprocess
import tomllib
from pathlib import Path

root = Path(__file__).resolve().parents[1]
version = json.loads((root / "package.json").read_text())["version"]
assert json.loads((root / "src-tauri/tauri.conf.json").read_text())["version"] == version
assert tomllib.loads((root / "src-tauri/Cargo.toml").read_text())["package"]["version"] == version
assert os.environ["TAG"] == f"v{version}"
repo = os.environ["GITHUB_REPOSITORY"]
release = json.loads(subprocess.check_output(
    ["gh", "api", f"repos/{repo}/releases/{os.environ['RELEASE_ID']}"], text=True))
assert release["draft"], "Published releases must never be overwritten"
assert release["tag_name"] == os.environ["TAG"]
head = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
assert release["target_commitish"] == head, "Release must point at exact source commit"
print(f"Verified draft {release['id']}, version {version}, source {head}")
