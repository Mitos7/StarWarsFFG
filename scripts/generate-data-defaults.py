"""Convert the pre-V14 Star Wars FFG template defaults into TypeDataModel data.
The original source is kept as scripts/legacy-template.json (not at system root).
Run: python scripts/generate-data-defaults.py
"""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts" / "legacy-template.json"
TARGET = ROOT / "modules" / "data" / "legacy-defaults.js"


def merge(a, b):
    out = copy.deepcopy(a)
    for key, value in b.items():
        if key in out and isinstance(out[key], dict) and isinstance(value, dict):
            out[key] = merge(out[key], value)
        else:
            out[key] = copy.deepcopy(value)
    return out


def generate():
    schema = json.loads(SOURCE.read_text(encoding="utf-8"))
    result = {}
    for family in ("Actor", "Item"):
        family_source = schema[family]
        family_result = {}
        for subtype in family_source["types"]:
            source_type = family_source[subtype]
            defaults = {}
            for template in source_type.get("templates", []):
                if template not in family_source["templates"]:
                    raise KeyError(f"{family}.{subtype}: missing {template} template")
                defaults = merge(defaults, family_source["templates"][template])
            own_defaults = {k: v for k, v in source_type.items() if k != "templates"}
            defaults = merge(defaults, own_defaults)
            family_result[subtype] = defaults
        result[family] = family_result
    # Foundry V14 requires subtype declarations in the system manifest.
    # Preserve existing per-type metadata if the manifest already contains it.
    manifest_path = ROOT / "system.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    declared = manifest.setdefault("documentTypes", {})
    for family, family_result in result.items():
        family_types = declared.setdefault(family, {})
        for subtype in family_result:
            family_types.setdefault(subtype, {})
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    payload = json.dumps(result, ensure_ascii=False, indent=2)
    TARGET.write_text(
        "// Generated from scripts/legacy-template.json by scripts/generate-data-defaults.py.\n"
        "// Used by TypeDataModels instead of deprecated root template.json.\n"
        "export const SYSTEM_DEFAULTS = " + payload + ";\n",
        encoding="utf-8",
    )
    print(
        "Generated", TARGET,
        "Actor:", len(result["Actor"]),
        "Item:", len(result["Item"]),
        "Bytes:", TARGET.stat().st_size
    )


if __name__ == "__main__":
    generate()
