"""
Build a public Star Wars FFG addon catalog and optional Foundry module pack.
Third-party code is repackaged only for modules whose repository licenses explicitly
permit redistribution. Other packages retain their ORIGINAL publisher download URLs.
Run from the repository root on the authorized Foundry host. This script does not
install/enable anything in any game world.
"""
from __future__ import annotations
from pathlib import Path
from copy import deepcopy
from zipfile import ZipFile, ZIP_DEFLATED
from datetime import date
import os,json,shutil,hashlib

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(os.environ["LOCALAPPDATA"])/"FoundryVTT"/"Data"/"modules"
OUTPUT=Path(r"D:\FoundryV14\starwars-addon-pack-release-20261112")
CATALOG=ROOT/"addons"
MANIFESTS=CATALOG/"manifests"
COLLECTION=CATALOG/"collection"
if OUTPUT.exists():
    raise RuntimeError("Addon pack release output already exists; refusing to overwrite it.")
OUTPUT.mkdir(parents=True)
MANIFESTS.mkdir(parents=True,exist_ok=True)
COLLECTION.mkdir(parents=True,exist_ok=True)

TAG="swffg-addons-20261112"
BASE="https://raw.githubusercontent.com/Mitos7/StarWarsFFG/foundry-v14-mitos/addons/"
RELEASE="https://github.com/Mitos7/StarWarsFFG/releases/download/"+TAG+"/"
# Mirrors require a verified license from the author's repository and include
# the existing license and notice files in every archive.
MIRROR={
    "genesys-ffg-options-enhancer":"MIT",
    "starwars-silhouette":"MIT",
    "materialdeck-starwarsffg":"MIT",
    "ffg-star-wars-hud-enhancements":"MIT",
    "lgs-extra-fields-for-star-wars":"Unlicense",
    "_mathjs":"Apache-2.0",
}
# Keep a deliberate list rather than blindly publishing every installed module.
MODULES=[
    "ffg-star-wars-enhancements",
    "star-wars-status-automation",
    "genesys-ffg-options-enhancer",
    "token-action-hud-ffgsw",
    "statuscounter",
    "space-op-ui",
    "token-action-hud",
    "swffgUI-cc",
    "starwars-silhouette",
    "ffg-star-wars-alternative-ui",
    "lgs-token-range-bands",
    "lgs-extra-fields-for-star-wars",
    "swrpg-karmic-dice",
    "ffg-star-wars-hud-enhancements",
    "materialdeck-starwarsffg",
    "swrpg-dice-helper-compendium",
    "babele",
    "MaterialDeck",
    "token-action-hud-core",
    "_mathjs",
]
# Source archives that are known to be GitHub repository snapshots, with a
# wrapper folder. They may require manual extraction when not rehostable.
SNAPSHOT_ARCHIVES={"token-action-hud-ffgsw","ffg-star-wars-alternative-ui"}
CAUTION={
    "swrpg-karmic-dice":"Changes dice probabilities. Do not enable casually.",
    "token-action-hud":"Classic edition, obsolete when using Token Action HUD Core.",
    "swffgUI-cc":"Choose only one of the competing UI replacements.",
    "space-op-ui":"Choose only one of the competing UI replacements.",
    "ffg-star-wars-alternative-ui":"Choose only one of the competing UI replacements.",
    "starwars-silhouette":"Requires optional Math.js library and licensed user-supplied silhouette art.",
    "materialdeck-starwarsffg":"Requires legacy MaterialDeck and external Stream Deck hardware.",
}
# Basic manifest schema. These are facts/metadata; never copy code from an
# author whose package has no redistribution license.
ALLOWED={
    "id","title","description","version","authors","compatibility",
    "scripts","esmodules","styles","languages","packs","socket","relationships",
    "media","url","manifest","download","license","library","flags","readme",
    "protected","persistentStorage","permissions",
}
def pack_folder(root:Path, target:Path):
    with ZipFile(target,"w",compression=ZIP_DEFLATED,compresslevel=8) as archive:
        for f in sorted(root.rglob("*")):
            if f.is_file():
                if any(p in {".git","node_modules"} for p in f.relative_to(root).parts):continue
                archive.write(f,arcname=f.relative_to(root).as_posix())
    with ZipFile(target) as archive:
        assert "module.json" in archive.namelist(),str(target)
        assert all("\\" not in n for n in archive.namelist())
    return target.stat().st_size

catalog=[]
for id in MODULES:
    folder=SOURCE/id
    p=folder/"module.json"
    if not p.is_file():raise RuntimeError("Installed module is missing: "+id)
    source=json.loads(p.read_text(encoding="utf-8-sig"))
    assert source.get("id")==id,(id,source.get("id"))
    m={key:deepcopy(value) for key,value in source.items() if key in ALLOWED}
    m["manifest"]=BASE+"manifests/"+id+".json"
    # Normalize metadata before building the ZIP, so the packaged manifest
    # matches exactly what Foundry downloads from the public URL.
    comp=m.get("compatibility")
    if isinstance(comp,dict) and "foundry" in comp:
        m["compatibility"]=comp["foundry"]
    if id=="starwars-silhouette":
        for relation in m.setdefault("relationships",{}).setdefault("requires",[]):
            if relation.get("id")=="_mathjs":
                relation["manifest"]=BASE+"manifests/_mathjs.json"
    mirrored=id in MIRROR
    if mirrored:
        name="swffg-addon-"+id+".zip"
        m["download"]=RELEASE+name
        staging=OUTPUT/("stage-"+id)
        shutil.copytree(folder,staging)
        if id=="starwars-silhouette":
            # The publisher's downloadable archive omitted its MIT LICENSE,
            # but the upstream GitHub repository includes one. Preserve it.
            import base64, subprocess
            encoded=subprocess.check_output(
                ["gh","api","repos/prolice/starwars-silhouette/license","--jq",".content"],
                text=True,timeout=25
            )
            (staging/"LICENSE").write_bytes(base64.b64decode(encoded))
        (staging/"module.json").write_text(json.dumps(m,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        licenseFiles=[f for f in staging.iterdir() if f.is_file() and ("license" in f.name.lower() or "notice" in f.name.lower() or "copying" in f.name.lower())]
        if not licenseFiles:raise RuntimeError("Cannot mirror without license/notice file: "+id)
        pack_folder(staging,OUTPUT/name)
        shutil.rmtree(staging)
    elif not source.get("download"):
        raise RuntimeError("No official download URL for "+id)
    # Normalize the old nested compatibility shape (for metadata only).
    comp=m.get("compatibility")
    if isinstance(comp,dict) and "foundry" in comp:
        m["compatibility"]=comp["foundry"]
    # Fix legacy optional links so our mirrors can install their optional/required
    # dependencies by URL; the actual package code remains unaltered.
    if mirrored and id=="starwars-silhouette":
        m.setdefault("relationships",{}).setdefault("requires",[])
        for relation in m["relationships"]["requires"]:
            if relation.get("id")=="_mathjs":
                relation["manifest"]=BASE+"manifests/_mathjs.json"
    if mirrored:
        # make sure the archive manifest reflects the final normalized JSON
        # without changing any substantive source-code assets
        with ZipFile(OUTPUT/("swffg-addon-"+id+".zip"),"a",compression=ZIP_DEFLATED) as archive:
            # avoid duplicated archive entries: stage was written before
            # normalization; no additional archive write is needed because
            # mirrored source already had normalized ids and relationships.
            pass
    (MANIFESTS/(id+".json")).write_text(json.dumps(m,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    entry={
        "id":id,"title":m.get("title",id),"version":m["version"],
        "manifest":m["manifest"],"download":m["download"],
        "source":source.get("url",source.get("manifest")),
        "method":"redistributable-mirror" if mirrored else "publisher-direct",
        "license":MIRROR.get(id,"upstream license; no code mirrored"),
        "published_compatibility":m.get("compatibility"),
        "warning":CAUTION.get(id,""),
    }
    if id in SNAPSHOT_ARCHIVES:entry["warning"]=(entry["warning"]+" Publisher archive is a repository snapshot and may require manual extraction.").strip()
    catalog.append(entry)

# Provide a genuine Foundry VTT module whose optional recommendations offer a
# consent-based installation prompt for other modules.
recommendations=[
    {"id":entry["id"],"type":"module","manifest":entry["manifest"]}
    for entry in catalog if entry["id"] not in {"token-action-hud"}
]
collectionManifest={
    "id":"swffg-mitos-addons",
    "title":"Star Wars FFG — Mitos Add-on Collection (Installer)",
    "description":"Optional install helper for independent Star Wars FFG add-on modules. Never enables modules in any game world. Choose recommended third-party packages individually. Some are legacy/untested on Foundry V14.",
    "version":"1.0.0",
    "authors":[{"name":"Mitos7"}],
    "compatibility":{"minimum":14,"verified":14,"maximum":14},
    "url":"https://github.com/Mitos7/StarWarsFFG/tree/foundry-v14-mitos/addons",
    "manifest":BASE+"collection/module.json",
    "download":RELEASE+"swffg-mitos-addons.zip",
    "relationships":{"systems":[{"id":"starwarsffg","type":"system"}],"recommends":recommendations},
    "flags":{"swffg-mitos-addons":{"role":"optional-collection-only","enablesThirdPartyModules":False}}
}
(COLLECTION/"module.json").write_text(json.dumps(collectionManifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
(COLLECTION/"README.md").write_text(
    "# Star Wars FFG — addon collection\n\n"
    "This is a metadata-only Foundry module. It does not execute any code or turn on other modules. "
    "Installing it allows Foundry to offer third-party packages as recommendations, subject to "
    "their original Foundry compatibility and download availability. "
    "After installation, a GM must activate compatible modules individually in each world. "
    "The add-on authors retain full credit; see ../CATALOG.md.\n",
    encoding="utf8",
)
pack_folder(COLLECTION,OUTPUT/"swffg-mitos-addons.zip")
(CATALOG/"catalog.json").write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
lines=[
    "# Star Wars FFG — Complementos instalables",
    "",
    "This is an optional community **installer/catalog**, not a claim of Foundry V14 compatibility.",
    "",
    "**Installer manifest for Foundry Add-on Modules → Install Module → Manifest URL:**",
    "",
    "`"+collectionManifest["manifest"]+"`",
    "",
    "Foundry may offer the collection's recommended modules to install; choose packages as needed. "
    "They are NOT enabled automatically in any world. The core system does not require them.",
    "",
    "Individual manifest URLs, authors and compatible Foundry versions:",
    "",
    "| Module | Version | Installer | Source | Foundry last verified | Cautions |",
    "|---|---|---|---|---|---|",
]
for e in catalog:
    c=e["published_compatibility"] or {}
    verified=c.get("verified","not declared") if isinstance(c,dict) else "not declared"
    caution=e["warning"].replace("|","/")
    lines.append(f"| {e['title']} | {e['version']} | [Manifest]({e['manifest']}) | {e['method']} | {verified} | {caution} |")
lines +=[
    "",
    "## Important conditions",
    "",
    "- All mirror ZIPs contain the upstream author's license and attribution files. No third-party code without a redistribution license was republished.",
    "- For publisher-direct modules, the file downloads directly from the original author. These are **not** locally fixed builds; old manifest fields or compatibility problems may still appear.",
    "- Foundry V14 does not certify a module tested only on V10–V13. Some packages may be refused by the installer and some legacy UI packages conflict with each other.",
    "- Do not activate all interface replacements simultaneously: choose one UI.",
    "- SWRPG Karmic Dice changes dice probabilities and should not be activated accidentally.",
    "- This collection does not include official FFG/Edge rulebooks, premium add-ons or copyrighted adventure/media content.",
    "- This optional installer does not replace the main system installation URL.",
]
(CATALOG/"CATALOG.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
(OUTPUT/"build-report.json").write_text(json.dumps({
    "created":str(date.today()),"tag":TAG,"collection_url":collectionManifest["manifest"],
    "count":len(catalog),"mirrored":[x["id"] for x in catalog if x["method"]=="redistributable-mirror"],
    "publisher_direct":[x["id"] for x in catalog if x["method"]=="publisher-direct"],
},ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print("BUILT",len(catalog),"modules, mirrored",len(MIRROR),"external",len(catalog)-len(MIRROR))
print("RELEASE_ASSETS:",[(x.name, x.stat().st_size) for x in sorted(OUTPUT.glob("*.zip"))])
print("COLLECTION_MANIFEST:",collectionManifest["manifest"])
