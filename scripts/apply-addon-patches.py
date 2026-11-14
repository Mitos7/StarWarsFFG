"""Apply reviewed patches to exact installed module versions, with backups.

Dry run by default. Stop Foundry before using --apply. This never enables a
module or edits a world, system, rules setting, or third-party download URL.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

PATCHES = Path(__file__).resolve().parents[1] / "addons" / "patches"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def prepare(modules_dir, selected):
    index = json.loads((PATCHES / "index.json").read_text())
    entries = {entry["id"]: entry for entry in index["modules"]}
    unknown = set(selected) - entries.keys()
    if unknown:
        raise ValueError(f"Unknown patches: {sorted(unknown)}")
    changes, reports = [], []
    for ident in selected:
        entry = entries[ident]
        folder = modules_dir / ident
        manifest_path = folder / "module.json"
        original_manifest = manifest_path.read_bytes()
        manifest = json.loads(original_manifest.decode("utf-8-sig"))
        if manifest.get("id") != ident or manifest.get("version") not in {
            entry["source_version"], entry["patch_version"]
        }:
            raise ValueError(f"Different installed version: {ident}")
        changed = 0
        for patch in entry["files"]:
            relative = Path(patch["path"])
            if relative.is_absolute() or ".." in relative.parts:
                raise ValueError(f"Unsafe patch path: {relative}")
            target = folder / relative
            before = target.read_bytes()
            after = (PATCHES / ident / relative).read_bytes()
            if digest(after) != patch["after_sha256"]:
                raise ValueError(f"Damaged patch: {ident}/{relative}")
            actual = digest(before)
            if actual == patch["after_sha256"]:
                continue
            if actual != patch["before_sha256"]:
                raise ValueError(f"Local changes detected; refusing to overwrite {ident}/{relative}")
            changes.append((target, before, after))
            changed += 1
        manifest["version"] = entry["patch_version"]
        manifest["compatibility"] = {"minimum": "13", "maximum": "14"}
        manifest.setdefault("flags", {})["mitosReview"] = {
            "sourceVersion": entry["source_version"],
            "runtimeVerified": False,
            "note": "Regression-tested source patch; Foundry V14 integration test pending."
        }
        updated_manifest = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode()
        if original_manifest != updated_manifest:
            changes.append((manifest_path, original_manifest, updated_manifest))
        reports.append({"id": ident, "source": entry["source_version"],
                        "patch": entry["patch_version"], "files_to_change": changed,
                        "runtime_verified": False})
    return changes, reports


def apply(modules_dir, changes):
    if not changes:
        return None
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S.%fZ")
    backup = modules_dir.parent / "mitos-addon-backups" / stamp
    # Back up every affected byte before the first mutation.
    for target, before, _ in changes:
        saved = backup / target.relative_to(modules_dir)
        saved.parent.mkdir(parents=True, exist_ok=True)
        saved.write_bytes(before)
    written = []
    try:
        for target, before, after in changes:
            if target.read_bytes() != before:
                raise RuntimeError(f"File changed after preflight: {target}")
            written.append((target, before))
            target.write_bytes(after)
            if target.read_bytes() != after:
                raise RuntimeError(f"Write verification failed: {target}")
    except Exception:
        for target, before in reversed(written):
            target.write_bytes(before)
        raise
    return backup


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--modules-dir", required=True, type=Path)
    parser.add_argument("--module", action="append", required=True, dest="modules")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    modules_dir = args.modules_dir.resolve()
    changes, reports = prepare(modules_dir, list(dict.fromkeys(args.modules)))
    backup = apply(modules_dir, changes) if args.apply else None
    print(json.dumps({"applied": args.apply, "changes": len(changes),
                      "backup": str(backup) if backup else None, "modules": reports}, indent=2))


if __name__ == "__main__":
    main()
