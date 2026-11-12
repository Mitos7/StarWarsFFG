"""Select suitable *existing* Foundry V14 stock icons for Star Wars fan entries.
Does not draw, copy, download or generate any image. Reusable after either
source generator. Exposes missing icon files as build errors.
"""
from pathlib import Path
import json, unicodedata, re
ROOT=Path(__file__).resolve().parents[2]
CORE=Path(r"D:\Program Files\Foundry Virtual Tabletop\resources\app\public\icons")
assert CORE.is_dir()
FILES=ROOT/"starter-kit/source"
def clean(x):
    return ''.join(c for c in unicodedata.normalize("NFD",x.lower()) if unicodedata.category(c)!="Mn")
def icon(path):
    actual=CORE/path
    if not actual.is_file():raise RuntimeError("Missing Foundry icon: "+path)
    return "icons/"+path.replace("\\","/")

def assign(pack,doc):
    name=clean(doc.get("name",""))
    typ=doc.get("type","")
    # Meaningful preinstalled icons for commonly used Star Wars objects.
    if typ=="weapon":
        if "sable" in name:return icon("weapons/swords/sword-runed-glowing.webp")
        if "detonador" in name:return icon("weapons/ammunition/ammunition-grenade.webp")
        if "cuchillo" in name:return icon("weapons/daggers/dagger-black.webp")
        if "espada" in name:return icon("weapons/swords/sword-katana.webp")
        if "baston" in name:return icon("weapons/staves/staff-engraved-wood.webp")
        if "bowcaster" in name:return icon("weapons/crossbows/crossbow-loaded-black.webp")
        if any(x in name for x in ["fusil","carabina","rifle","dlt-19","a280","e-11","dc-15a","ee-3"]):
            return icon("weapons/guns/rifle-energy-blaster.webp")
        if "iones" in name:return icon("weapons/guns/pistol-stun-energy-red.webp")
        return icon("weapons/guns/pistol-energy-blaster.webp")
    if typ=="gear":
        rules=[
           (("datapad","terminal","datos","unidad de datos"),"commodities/tech/phone-smart-tablet.webp"),
           (("medpac","botiquin","primeros auxilios"),"tools/medical/medkit-steel.webp"),
           (("estimulante","medico"),"tools/medical/medkit-pills-blue.webp"),
           (("comunicador","radio"),"tools/tech/badge-communicator.webp"),
           (("binoculares","escÃ¡ner","escaner","sensor"),"commodities/tech/electronics-tech-sensor-blue.webp"),
           (("reparacion","herramientas","mantenimiento","microherramientas"),"tools/hand/wrench-adjustable.webp"),
           (("slicing","electronica"),"skills/trades/electronics-tech-circuit-blue.webp"),
           (("mapa","cartografia","cartografico"),"tools/navigation/map-marked-blue.webp"),
           (("respirator","filtro","mascara"),"equipment/head/gas-mask.webp"),
           (("racion","comida"),"consumables/food/berries-ration-round-red.webp"),
           (("mochila","bolsa"),"containers/bags/pack-canvas-white-brown.webp"),
           (("baliza","emergencia"),"commodities/tech/communications-dish-tan.webp"),
           (("celula","energia","energetica","bateria"),"commodities/tech/electronics-tech-battery-energy-blue.webp"),
           (("fusion","soldadura"),"tools/tech/torch-welding-plasma-purple.webp"),
           (("motivador","repuesto","componente"),"commodities/tech/robotics-frame-steel-blue.webp"),
           (("linterna","luz"),"sundries/lights/lamp-tech-blue.webp"),
           (("cuerda","cable"),"commodities/tech/cable-armored-reticulated.webp"),
           (("acceso","tarjeta","credencial"),"commodities/tech/electronics-tech-interface-teal.webp"),
           (("grilletes","esposas"),"commodities/tech/electronics-tech-interface-teal.webp"),
        ]
        for keywords,asset in rules:
            if any(k in name for k in keywords):return icon(asset)
        return icon("commodities/tech/electronics-tech-interface-teal.webp")
    if typ=="armour":
        if "stormtrooper" in name or "clon" in name:return icon("equipment/head/tech-helm-white.webp")
        if "piloto" in name:return icon("equipment/head/helmet-tech-light.webp")
        if "mandalorian" in name:return icon("equipment/chest/tech-steel.webp")
        if "scout" in name:return icon("equipment/chest/tech-white.webp")
        if "jedi" in name:return icon("equipment/chest/vest-reinforced-leather.webp")
        return icon("equipment/chest/tech-steel.webp")
    if typ=="species":
        if "droide" in name:return icon("commodities/tech/robotics-frame-steel-blue.webp")
        # No species portraits are supplied with the main system. Prefer a
        # neutral existing human figure, not a fabricated species likeness.
        return icon("environment/people/commoner.webp")
    if typ=="career":
        if any(x in name for x in ("tecnico","ingeniero")):return icon("tools/hand/wrench-adjustable.webp")
        if any(x in name for x in ("soldado","mercenario","guerrero","guardian")):return icon("environment/people/infantry-armored.webp")
        if any(x in name for x in ("diplomatico","negociador","colono")):return icon("skills/social/diplomacy-handshake-blue.webp")
        if any(x in name for x in ("explorador","buscador","as /","cartografo")):return icon("tools/navigation/compass-plain-blue.webp")
        if any(x in name for x in ("contrabandista","espia","cazarrecompensas")):return icon("weapons/guns/pistol-energy-blaster.webp")
        return icon("skills/trades/electronics-tech-circuit-blue.webp")
    if typ=="specialization":
        if any(x in name for x in ("mechanic","gadgeteer","artisan","sistemas","rescate")):return icon("tools/hand/wrench-mechanical-heal-blue.webp")
        if any(x in name for x in ("pilot","navegacion")):return icon("tools/navigation/compass-plain-blue.webp")
        if any(x in name for x in ("slicer","analista")):return icon("skills/trades/electronics-tech-circuit-blue.webp")
        if any(x in name for x in ("doctor",)):return icon("tools/medical/medkit-white-red.webp")
        if any(x in name for x in ("striker","assassin","marauder")):return icon("weapons/swords/sword-katana.webp")
        return icon("skills/trades/electronics-tech-circuit-blue.webp")
    if typ=="talent":
        if any(x in name for x in ("pilot","jockey")):return icon("tools/navigation/compass-plain-blue.webp")
        if any(x in name for x in ("parry","reflect","armor")):return icon("skills/melee/shield-block-bash-blue.webp")
        if any(x in name for x in ("accuracy","deadly","draw")):return icon("skills/targeting/crosshair-scope-sniper-green.webp")
        if any(x in name for x in ("rigged","engineering","ingenieria","tecnico")):return icon("tools/hand/wrench-adjustable.webp")
        return icon("skills/trades/electronics-tech-circuit-blue.webp")
    if typ=="forcepower":
        if any(x in name for x in ("protect","heal","calma")):return icon("magic/defensive/barrier-shield-dome-blue-purple.webp")
        if "move" in name:return icon("magic/movement/acceleration-speed-tech-blue.webp")
        if "sense" in name or "foresee" in name:return icon("magic/perception/eye-slit-orange.webp")
        return icon("magic/defensive/shield-barrier-blue.webp")
    if typ in ("minion","rival","nemesis","character"):
        if any(x in name for x in ("droide","r2-d2","c-3po","droideka")):return icon("commodities/tech/robotics-frame-steel-blue.webp")
        if any(x in name for x in ("stormtrooper","soldado clon","guardia","mandalorian","boba fett","din djarin")):return icon("environment/people/infantry-armored.webp")
        if any(x in name for x in ("wampa","rancor")):return icon("creatures/magical/construct-golem-robot-blue.webp") # neutral fallback, not a likeness
        return icon("environment/people/commoner.webp")
    if typ=="vehicle":
        # The bundled library contains no faithful Star Wars ship portraits.
        # A neutral *original StarWarsFFG vehicle icon* is more accurate than
        # depicting a nautical sailing ship or an airplane as an X-wing.
        return "systems/starwarsffg/images/defaults/actors/vehicle.png"
    raise RuntimeError(f"No icon mapping for {typ} ({doc['name']})")

updates=0
for source in sorted(FILES.glob("*.json")):
    docs=json.loads(source.read_text(encoding="utf-8"))
    for doc in docs:
        if "img" not in doc:continue
        new=assign(source.stem,doc)
        assert new.startswith("icons/") or new=="systems/starwarsffg/images/defaults/actors/vehicle.png"
        doc["img"]=new
        if isinstance(doc.get("prototypeToken"),dict):
            doc["prototypeToken"].setdefault("texture",{})["src"]=new
        updates+=1
    source.write_text(json.dumps(docs,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("UPDATED",updates,"EXISTING FOUNDRY ICONS IN",len(list(FILES.glob("*.json"))),"SOURCE FILES")
