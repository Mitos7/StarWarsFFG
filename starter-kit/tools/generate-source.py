from pathlib import Path
import json,hashlib,copy
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parents[1]
SRC=OUT/"source";SRC.mkdir(parents=True,exist_ok=True)
s=json.loads((ROOT/"scripts/legacy-template.json").read_text(encoding="utf8"))
packs={}
def merge(a,b):
    c=copy.deepcopy(a)
    for k,v in b.items():
        if k in c and isinstance(c[k],dict) and isinstance(v,dict): c[k]=merge(c[k],v)
        else:c[k]=copy.deepcopy(v)
    return c
def defaults(group,typ):
    f=s[group];o={}
    for template in f[typ].get("templates",[]):o=merge(o,f["templates"][template])
    return merge(o,{k:v for k,v in f[typ].items() if k!="templates"})
def uid(k):return hashlib.sha256(("mitos-starter-v1|"+k).encode()).hexdigest()[:16]
def put(pack,doc):packs.setdefault(pack,[]).append(doc)
def item(pack,typ,name,desc,price=None,enc=None,rarity=None,damage=None,crit=None,range=None,skill=None,soak=None,xp=None,careers=None):
    d=defaults("Item",typ)
    d["description"]=f"<p>{desc}</p><p><em>Contenido original y orientativo del kit Mitos. No procede de libros oficiales; el director de juego puede modificar sus valores.</em></p>"
    d["metadata"]={"tags":["Mitos Starter","Original","Demo"],"sources":[]}
    for field,val in {"price":price,"encumbrance":enc,"rarity":rarity,"damage":damage,"crit":crit,"range":range,"skill":skill,"soak":soak}.items():
        if val is not None and isinstance(d.get(field),dict):d[field]["value"]=val
    if xp is not None and "startingXP" in d:d["startingXP"]=xp
    for i,sk in enumerate(careers or []):
        if "careerSkills" in d:
            key="careerSkill"+str(i)
            if key in d["careerSkills"]:d["careerSkills"][key]=sk
    img={"weapon":"weapon.png","gear":"gear.png","armour":"armor.png","itemattachment":"attachment.png"}.get(typ,"gear.png")
    put(pack,{"_id":uid(pack+name),"name":name,"type":typ,"img":"systems/starwarsffg/images/defaults/items/"+img,"system":d,"ownership":{"default":0},"flags":{"swffg-mitos-starter":{"demo":True}}})
def actor(pack,typ,name,desc,chars,skills,wounds=0,strain=0,soak=0,quantity=1,other=None):
    d=defaults("Actor",typ)
    d["biography"]=f"<p>{desc}</p><p><em>Adversario o vehículo original del kit de prueba. Sus valores no son oficiales.</em></p>"
    for key,value in chars.items():
        if key in d.get("characteristics",{}):d["characteristics"][key]["value"]=value
    for key,value in skills.items():
        if key in d.get("skills",{}):d["skills"][key]["rank"]=value
    if "stats" in d:
        for key,value in (("wounds",wounds),("strain",strain),("soak",soak)):
            if key not in d["stats"]:continue
            d["stats"][key]["value"]=value if key=="soak" else 0
            if key!="soak" and "max" in d["stats"][key]:d["stats"][key]["max"]=value
        d["stats"]=merge(d["stats"],other or {})
    if typ=="minion":
        d["quantity"]["value"]=quantity;d["quantity"]["max"]=quantity
        d["unit_wounds"]["value"]=wounds
    img={"minion":"minion.png","rival":"rival.png","nemesis":"nemesis.png","vehicle":"vehicle.png"}.get(typ,"character.png")
    put(pack,{"_id":uid(pack+name),"name":name,"type":typ,"img":"systems/starwarsffg/images/defaults/actors/"+img,"system":d,"items":[],"effects":[],"ownership":{"default":0},"flags":{"swffg-mitos-starter":{"demo":True}}})
def journal(name,contents):
    id=uid("journal"+name)
    put("guias",{"_id":id,"name":name,"pages":[{"_id":uid("page"+name),"name":"Contenido","type":"text","text":{"format":1,"content":contents}}],"ownership":{"default":0},"flags":{"swffg-mitos-starter":{"demo":True}}})

for row in """Emisor de emergencia|Baliza portátil para pedir ayuda|80|1|2
Herramientas de campo|Juego de microherramientas para reparar equipos|125|2|3
Botiquín de campaña|Material básico para asistir heridos|95|1|2
Linterna espectral|Fuente de luz visible y ultravioleta|40|1|1
Cuerda magnética|Cable de veinte metros con anclaje|75|2|3
Ración compacta|Comida y agua para una jornada|15|1|1
Detector térmico|Sensor portátil para localizar calor|110|1|3
Tarjeta de acceso del puerto|Credencial con una firma de seguridad antigua|5|0|1
Filtro respiratorio|Filtro de emergencia para polvo industrial|50|1|2
Comunicador de taller|Radio de corto alcance para técnicos|70|1|2
Escáner de ondas|Localiza interferencias y transmisores próximos|180|2|4
Casco de trabajo|Protección civil para el sector de máquinas|55|1|1""".splitlines():
    n,d,p,e,r=row.split("|");item("equipo","gear",n,d,int(p),int(e),int(r))
for row in """Pistola de descarga T-12|Arma compacta de vigilancia|180|1|3|5|4|Short|Ranged: Light
Carabina de pulsos Mica|Carabina para exploraciones|450|3|4|7|3|Medium|Ranged: Heavy
Bastón eléctrico aislado|Bastón de inmovilización temporal|90|2|2|3|5|Engaged|Melee
Hoja de cerámica|Herramienta industrial de corte|65|1|2|3|4|Engaged|Melee
Fusil de seguridad|Rifle de patrulla de muelle|650|4|5|8|3|Long|Ranged: Heavy
Lanzador de red|Arma de captura no letal|390|3|5|2|5|Short|Ranged: Light
Pistola térmica de taller|Herramienta modificada para autodefensa|70|2|2|3|5|Short|Ranged: Light""".splitlines():
    n,d,p,e,r,dam,cr,ra,sk=row.split("|")
    item("armas","weapon",n,d,int(p),int(e),int(r),int(dam),int(cr),ra,sk)
for row in """Chaleco de patrulla|Placas ligeras para guardias de paso|260|2|3|1
Mono reforzado|Ropa de trabajo con tejido resistente|115|1|2|1
Traje de presión|Traje de evacuación para un fallo atmosférico|600|3|5|1
Capa de fibras densas|Abrigo industrial con capas protectoras|180|2|3|1""".splitlines():
    n,d,p,e,r,so=row.split("|");item("armaduras","armour",n,d,int(p),int(e),int(r),soak=int(so))
for row in """Valori de las Llanuras|Pueblo original viajero que se orienta por patrones de viento|100
Drenn de Cobre|Pueblo minero conocido por su trabajo en equipo|100
Tessari de la Bruma|Comunidad anfibia de humedales y canales|100
Colono de Frontera|Humano criado en asentamientos remotos|110""".splitlines():
    n,d,x=row.split("|");item("especies","species",n,d,xp=int(x))
for row in """Vigilante Portuario|Profesión de patrulla y protección civil|Vigilance,Perception,Discipline,Ranged: Light,Cool,Athletics
Cartógrafo de Rutas|Explorador de mapas y señales remotas|Astrogation,Computers,Perception,Survival,Piloting: Space
Técnico de Sistemas|Especialista en reparaciones y maquinaria|Mechanics,Computers,Perception,Coordination,Vigilance
Negociador Itinerante|Mediador de conflictos comerciales|Negotiation,Charm,Cool,Deception,Streetwise""".splitlines():
    n,d,c=row.split("|");item("carreras","career",n,d,careers=c.split(","))
for n,d in [
("Analista de frecuencias","Especialización original para investigar transmisiones y rastrear emisores"),
("Mecánico de rescate","Especialización original para reparar bajo presión y evacuar civiles"),
("Explorador de ruinas","Especialización original para orientarse y sobrevivir lejos de rutas seguras"),
("Mediador de fronteras","Especialización original para negociar acuerdos entre colonias"),
]:
    item("especializaciones","specialization",n,d)
for n,d in [
("Manos firmes","Talento narrativo de ejemplo para reparaciones difíciles; decide cualquier bonificación con el DJ"),
("Ojo técnico","El personaje distingue componentes fuera de lugar; sin bonificaciones oficiales"),
("Pulso sereno","Mantiene la calma ante una amenaza repentina; uso sujeto al DJ"),
("Paso silencioso","Aprendió a pasar desapercibido en talleres y pasillos"),
("Contacto en el muelle","Conoce a un trabajador en un asentamiento de paso"),
("Memoria cartográfica","Recuerda rutas y señalizaciones inusuales"),
("Observador paciente","Puede examinar con calma una escena antes de actuar"),
("Improvisador mecánico","Busca usos no previstos para herramientas corrientes"),
]:
    item("talentos","talent",n,d)
for n,d in [
("Eco emocional","Capacidad narrativa original de percibir emociones intensas, bajo arbitraje del DJ"),
("Instinto de peligro","Capacidad narrativa original de captar una amenaza inmediata, bajo arbitraje del DJ"),
("Luz de calma","Capacidad narrativa original de reconfortar a alguien asustado; no sustituye poderes oficiales"),
]:
    item("poderes","forcepower",n,d)
for name,typ,desc,chars,skills,wound,strain,soak,qty in [
("Guardia del puerto","minion","Patrullero que vigila las puertas",{"Brawn":2,"Agility":2},{"Vigilance":1,"Ranged: Light":1},5,0,2,3),
("Operario de chatarra","minion","Trabajador atrapado entre dos facciones",{"Brawn":2,"Intellect":2},{"Mechanics":1,"Brawl":1},4,0,1,2),
("Centinela mecánico","rival","Autómata de seguridad del astillero",{"Brawn":3,"Agility":2},{"Ranged: Light":2,"Perception":1},10,0,3,1),
("Contrabandista de muelle","rival","Intermediario que conoce rutas ocultas",{"Agility":3,"Cunning":3},{"Deception":2,"Streetwise":2},11,0,2,1),
("Capataz del sector oscuro","nemesis","Jefe corrupto que oculta la verdad de una avería",{"Intellect":3,"Cunning":3,"Willpower":3},{"Coercion":2,"Mechanics":2,"Ranged: Light":2},14,11,3,1),
("Rescatadora civil","rival","Piloto que puede auxiliar a los personajes",{"Agility":3,"Presence":3},{"Piloting: Space":2,"Medicine":1},9,0,1,1),
]:
    actor("adversarios",typ,name,desc,chars,skills,wound,strain,soak,qty)
for n,desc,stat in [
("Lanzadera Gris-7","Transporte civil para una expedición corta",{"silhouette":{"value":3},"speed":{"value":3,"max":3},"hullTrauma":{"max":16},"systemStrain":{"max":12},"armour":{"value":2},"passengerCapacity":{"value":7}}),
("Patrullera Centella","Nave ligera de vigilancia",{"silhouette":{"value":3},"speed":{"value":4,"max":4},"hullTrauma":{"max":18},"systemStrain":{"max":11},"armour":{"value":2},"passengerCapacity":{"value":3}}),
("Carguero Bruma Gris","Viejo vehículo de carga con almacén oculto",{"silhouette":{"value":4},"speed":{"value":2,"max":2},"hullTrauma":{"max":25},"systemStrain":{"max":17},"armour":{"value":3},"passengerCapacity":{"value":8}}),
]:
    actor("vehiculos","vehicle",n,desc,{}, {},other=stat)
journal("00 — Instrucciones", """<h1>Kit original de iniciación</h1><p>Once compendios con contenido original y no oficial. Arrastra objetos o actores para emplearlos. No contiene ningún libro comercial. Para importar tu propia biblioteca OggDude, en Compendios pulsa OggDude Dataset Importer; elige un ZIP de tu carpeta Data. Haz copia de seguridad antes de importar.</p><p>El soporte Genesys se cambia en la configuración de StarWarsFFG.</p>""")
journal("01 — El eco del astillero", """<h1>El eco del astillero</h1><p>Aventura original de prueba.</p><h2>Gancho</h2><p>Una estación de carga supuestamente abandonada emite una llamada de auxilio. Una piloto civil ofrece transporte a cambio de rescatar a los trabajadores.</p><h2>Escena 1: atraque</h2><p>La gravedad es inestable. Un guardia conoce la ruta segura. Una prueba de Vigilancia descubre huellas recientes.</p><h2>Escena 2: taller</h2><p>Un terminal borra los registros. Una prueba de Mecánica o Computadoras permite reconstruir la señal. Un operario explica que alguien manipuló las máquinas.</p><h2>Escena 3: centinela</h2><p>Un centinela impide el paso. Se puede desactivar, engañar o combatir.</p><h2>Escena 4: decisión</h2><p>El capataz ocultó pruebas de un sabotaje. Los personajes pueden rescatar a los empleados, denunciarlo o negociar.</p><h2>PNJ</h2><p>Guardia del puerto; Operario de chatarra; Centinela mecánico; Capataz del sector oscuro; Rescatadora civil.</p><h2>Recompensa</h2><p>Un favor de la rescatadora y un transporte temporal; los créditos los decide el DJ.</p>""")
journal("02 — Complicaciones d6", """<h1>Complicaciones narrativas d6</h1><ol><li>La energía falla.</li><li>Un testigo reconoce al grupo.</li><li>Una compuerta bloquea el camino.</li><li>Salta una falsa alarma.</li><li>Una oportunidad inesperada para negociar.</li><li>El objetivo se mueve a una zona peligrosa.</li></ol><p>No sustituye los resultados oficiales de los dados narrativos.</p>""")
journal("03 — Preparación de partida", """<h1>Lista de comprobación</h1><ol><li>Activa el módulo solo en un mundo StarWarsFFG.</li><li>Comprueba que aparecen los once compendios.</li><li>Arrastra un guardia, un arma y una nave a la campaña.</li><li>Prueba tiradas, combate y la reserva de Destino.</li><li>Introduce tus propios datos de manuales legales mediante el importador OggDude.</li></ol><p>Instalar el módulo no altera automáticamente tus personajes ni mundos.</p>""")
spec=[("equipo","Item","Equipo original"),("armas","Item","Armas originales"),("armaduras","Item","Armaduras originales"),("especies","Item","Especies originales"),("carreras","Item","Carreras originales"),("especializaciones","Item","Especializaciones originales"),("talentos","Item","Talentos originales"),("poderes","Item","Poderes narrativos originales"),("adversarios","Actor","Adversarios originales"),("vehiculos","Actor","Vehículos originales"),("guias","JournalEntry","Guías y aventura original")]
for name,_,_ in spec:
    assert name in packs and packs[name]
    (SRC/(name+".json")).write_text(json.dumps(packs[name],ensure_ascii=False,indent=2)+"\n",encoding="utf8")
module={"id":"swffg-mitos-starter","title":"Star Wars FFG / Genesys — Kit original de Mitos","description":"Once compendios originales de demostración, sin contenido de libros oficiales: equipo, armas, especies, talentos, adversarios, vehículos y una aventura.","version":"1.0.0","authors":[{"name":"Mitos7"}],"compatibility":{"minimum":14,"verified":14,"maximum":14},"url":"https://github.com/Mitos7/StarWarsFFG","manifest":"https://raw.githubusercontent.com/Mitos7/StarWarsFFG/foundry-v14-mitos/starter-kit/module.json","download":"https://github.com/Mitos7/StarWarsFFG/releases/download/swffg-starter-1.0.0/swffg-mitos-starter.zip","relationships":{"systems":[{"id":"starwarsffg","type":"system"}]},"packs":[{"name":name,"label":label,"type":typ,"path":"packs/"+name,**({"system":"starwarsffg"} if typ in ("Item","Actor") else {})} for name,typ,label in spec],"flags":{"swffg-mitos-starter":{"license":"CC0-1.0","booksIncluded":False}}}
(OUT/"module.json").write_text(json.dumps(module,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
(OUT/"README.md").write_text("""# Star Wars FFG / Genesys — kit original de Mitos

Módulo gratuito con 11 compendios de recursos originales, NO oficiales: 12 objetos de equipo, 7 armas, 4 armaduras, 4 especies originales, 4 carreras, 4 especializaciones, 8 talentos, 3 poderes narrativos, 6 adversarios, 3 vehículos y 4 diarios de ayuda.

## Instalar

Foundry V14 → Add-on Modules → Install Module → Manifest URL:

`https://raw.githubusercontent.com/Mitos7/StarWarsFFG/foundry-v14-mitos/starter-kit/module.json`

Activa el módulo en un mundo StarWarsFFG. Arrastra el contenido de los compendios a tu mundo o a personajes; no modifica nada automáticamente. Las estadísticas y nombres son originales de ejemplo, sujetos a aprobación del director.

## Contenido oficial

El sistema principal de StarWarsFFG ya incluye el importador **OggDude Dataset Importer** en la pestaña Compendios. Importa un ZIP con la carpeta `Data` de tu instalación de OggDude para obtener tus propios compendios basados en datos que poseas legalmente. Haz copia de seguridad del mundo antes de importar.

No incluimos libros, estadísticas oficiales, ilustraciones ni datos privados de OggDude. La compatibilidad con Genesys ya viene en StarWarsFFG.
""",encoding="utf8")
(OUT/"LICENSE").write_text("CC0 1.0 Universal - Public Domain Dedication\n\nAll original texts, original fictional names and example statistics created specifically for the Mitos starter kit are released under CC0 1.0. This does not cover any material of Star Wars FFG or third-party trademarks. https://creativecommons.org/publicdomain/zero/1.0/\n",encoding="utf8")
print("PACKS",len(spec),"DOCUMENTS",sum(map(len,packs.values())),{k:len(v) for k,v in packs.items()})
