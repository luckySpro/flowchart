import json
import os
import subprocess
from pathlib import Path
from urllib.parse import quote

def api(*args):
    output = subprocess.check_output(["gh", "api", *args], text=True)
    return json.loads(output) if output.strip() else None

def upload(files):
    repo, release_id = os.environ["GITHUB_REPOSITORY"], os.environ["RELEASE_ID"]
    release = api(f"repos/{repo}/releases/{release_id}")
    if not release["draft"]:
        raise RuntimeError("Refusing to modify a published release")
    existing = {a["name"]: a for a in release["assets"]}
    for path in files:
        if path.name in existing:
            api("--method", "DELETE", f"repos/{repo}/releases/assets/{existing[path.name]['id']}")
        url = release["upload_url"].split("{")[0] + "?name=" + quote(path.name)
        api("--method", "POST", url, "-H", "Content-Type: application/octet-stream", "--input", str(path))
        print(f"Uploaded {path.name}")

if __name__ == "__main__":
    upload(sorted(Path("release-artifacts").glob("*")))
