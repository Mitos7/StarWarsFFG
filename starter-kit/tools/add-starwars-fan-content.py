"""Nonofficial Star Wars fan reference pack builder.
Names identify franchise concepts; every description and gameplay number is
independently written, not transcribed from an FFG/Edge manual. No artwork included.
Run AFTER generate-source.py and BEFORE build-packs.cjs.
"""
from pathlib import Path
import json,copy,hashlib
ROOT=Path(__file__).resolve().parents[2]
OUT=Path(__file__).resolve().parents[1]
SRC=OUT/"source"
base=json.loads((ROOT/"scripts/legacy-template.json").read_text(encoding="utf8"))
module=json.loads((OUT/"module.json").read_text(encoding="utf8"))
def merge(a,b):
    result=copy.deepcopy(a)
    for k,v in b.items():
        result[k]=merge(result[k],v) if isinstance(result.get(k),dict) and isinstance(v,dict) else copy.deepcopy(v)
    return result
def default(group,typ):
    data={}
    for p in base[group][typ].get("templates",[]):data=merge(data,base[group]["templates"][p])
    return merge(data,{k:v for k,v in base[group][typ].items() if k!="templates"})
def uid(kind,key):
    return hashlib.sha256(("mitos-sw-fan-reference-v1|"+kind+"|"+key).encode("utf8")).hexdigest()[:16]
packs={}
NOTE="Adaptación fan NO OFICIAL. Los valores de juego son originales y orientativos, NO son estadísticas de Fantasy Flight Games ni de Edge. Consultar los manuales adquiridos para las reglas reales."
def add(pack,doc):packs.setdefault(pack,[]).append(doc)
def item(pack,typ,name,desc,*n,sk=None):
    m=default("Item",typ)
    m["description"]=f"<p>{desc}</p><p><em>{NOTE}</em></p>"
    m.setdefault("metadata",{})["tags"]=["Star Wars","Fan Homebrew","Stats NO Oficiales"]
    m["metadata"]["sources"]=[]
    fields=["price","encumbrance","rarity","damage","crit","range","skill"]
    for key,val in zip(fields,n):
        if val is not None and isinstance(m.get(key),dict) and "value" in m[key]:m[key]["value"]=val
    if sk is not None and "careerSkills" in m:
        for ix,nameSkill in enumerate(sk):
            entry=f"careerSkill{ix}"
            if entry in m["careerSkills"]:m["careerSkills"][entry]=nameSkill
    if typ=="species" and len(n) and n[0] is not None:m["startingXP"]=int(n[0])
    if typ=="armour" and len(n)>3:
        m["soak"]["value"]=n[3]
    if typ=="talent":
        m["longDesc"]=m["description"]
    img={"weapon":"weapon.png","shipweapon":"weapon.png","armour":"armor.png","gear":"gear.png"}.get(typ,"gear.png")
    add(pack,{"_id":uid(pack,name),"name":name,"type":typ,"img":"systems/starwarsffg/images/defaults/items/"+img,
       "system":m,"ownership":{"default":0},"flags":{"swffg-mitos-starter":{"demo":True,"nonOfficialRules":True,"fanIndex":True}}})
def actor(pack,typ,name,desc,attrs=None,skills=None,wounds=10,strain=0,soak=1,quantity=1,vehicle=None):
    m=default("Actor",typ)
    m["biography"]=f"<p>{desc}</p><p><em>{NOTE}</em></p>"
    for k,v in (attrs or {}).items():
        if k in m.get("characteristics",{}):m["characteristics"][k]["value"]=v
    for k,v in (skills or {}).items():
        if k in m.get("skills",{}):m["skills"][k]["rank"]=v
    if "stats" in m:
        if vehicle: m["stats"]=merge(m["stats"],vehicle)
        else:
            for k,v in (("wounds",wounds),("strain",strain),("soak",soak)):
                if not isinstance(m["stats"].get(k),dict):continue
                m["stats"][k]["value"]=v if k=="soak" else 0
                if k!="soak" and "max" in m["stats"][k]:m["stats"][k]["max"]=v
    if typ=="minion":
        m["quantity"]["value"]=quantity;m["quantity"]["max"]=quantity
        m["unit_wounds"]["value"]=wounds
    img={"minion":"minion.png","rival":"rival.png","nemesis":"nemesis.png","vehicle":"vehicle.png"}.get(typ,"character.png")
    add(pack,{"_id":uid(pack,name),"name":name,"type":typ,
       "img":"systems/starwarsffg/images/defaults/actors/"+img,"system":m,"items":[],"effects":[],"ownership":{"default":0},
       "flags":{"swffg-mitos-starter":{"demo":True,"nonOfficialRules":True,"fanIndex":True}}})
def journal(name,body):
    id=uid("sw-journal",name);pid=uid("sw-journalpage",name)
    add("sw-guias",{"_id":id,"name":name,"pages":[{"_id":pid,"name":"Guía","type":"text","text":{"format":1,"content":body}}],
        "ownership":{"default":0},"flags":{"swffg-mitos-starter":{"demo":True,"fanIndex":True}}})

# Using well-known setting TERMS only, not transcribed RPG values.
for name,desc,cost,enc,rarity,dmg,crit,rng,sk in [
("Pistola bláster estándar","Arma corta de energía útil para un personaje de aventuras.",400,1,2,5,4,"Medium","Ranged: Light"),
("Pistola bláster pesada","Arma corta de mayor peso, de fabricación común en regiones remotas.",700,2,4,7,3,"Medium","Ranged: Light"),
("DL-44 bláster pesado","Versión fan de una pistola potente de la saga.",1100,2,5,8,3,"Medium","Ranged: Light"),
("E-11 fusil bláster","Fusil de servicio asociado a tropas imperiales.",950,3,4,8,3,"Long","Ranged: Heavy"),
("A280 fusil bláster","Arma larga empleada en enfrentamientos terrestres.",980,3,4,8,4,"Long","Ranged: Heavy"),
("DC-15A fusil bláster","Arma de época de la República, robusta y de gran tamaño.",1200,4,5,9,3,"Long","Ranged: Heavy"),
("EE-3 carabina bláster","Carabina compacta apreciada por algunos cazarrecompensas.",1350,3,5,8,3,"Medium","Ranged: Heavy"),
("DLT-19 bláster pesado","Arma de apoyo que exige preparación para su uso.",1700,5,6,10,3,"Long","Ranged: Heavy"),
("WESTAR-34 pistola bláster","Diseño estilizado utilizado por tiradores especializados.",1450,1,6,7,3,"Medium","Ranged: Light"),
("Bowcaster wookiee","Arma de energía de construcción compleja y agarre pesado.",1750,5,7,10,3,"Long","Ranged: Heavy"),
("Bláster de iones","Instrumento para interferir circuitos y mecanismos; efectos a juicio del DJ.",900,3,5,4,5,"Medium","Ranged: Light"),
("Cuchillo vibratorio","Hoja equipada con un mecanismo de vibración.",220,1,3,3,4,"Engaged","Melee"),
("Espada vibratoria","Arma de combate cercano que utiliza un borde oscilante.",650,2,5,5,3,"Engaged","Melee"),
("Bastón electrostático","Arma de contacto con un extremo electrificado.",390,3,5,5,4,"Engaged","Melee"),
("Sable de luz de entrenamiento","Réplicas de entrenamiento con energía limitada; reglas del DJ.",2400,1,8,7,3,"Engaged","Lightsaber"),
("Sable de luz fan","Representación no oficial para partidas con usuarios de la Fuerza.",10000,1,10,9,2,"Engaged","Lightsaber"),
("Detonador térmico de ejercicio","Versión inerte simulada para entrenamientos; no reproduce reglas oficiales.",350,1,5,6,4,"Short","Ranged: Light"),
]:
    item("sw-armas","weapon",name,desc,cost,enc,rarity,dmg,crit,rng,sk)

for name,desc,cost,enc,rarity in [
("Comunicador personal","Permite establecer contacto con compañeros a distancia variable.",50,0,1),
("Macrobinoculares","Visor óptico para identificar movimientos a distancia.",120,1,2),
("Datapad","Ordenador portátil para leer mapas y ficheros.",180,1,2),
("Kit de reparación de droide","Herramientas para mantener mecanismos y circuitos.",400,2,4),
("Medpac","Equipo para una primera intervención sanitaria.",350,2,3),
("Estimulante médico","Consumible narrativo de emergencia; su efecto lo establece el DJ.",25,0,3),
("Herramientas de slicing","Accesorios informáticos para interactuar con terminales.",900,2,6),
("Grilletes de seguridad","Sujetadores empleados en instalaciones de control.",100,1,2),
("Máscara respiratoria","Dispositivo para filtrar aire hostil temporalmente.",250,1,4),
("Mochila de supervivencia","Conjunto de herramientas y raciones para exploradores.",200,3,3),
("Baliza de emergencia","Emite una señal para facilitar la localización.",150,1,3),
("Unidad de datos imperial","Pequeño soporte electrónico recuperado de un terminal.",120,0,4),
("Mapa estelar parcial","Registro incompleto de sistemas y rutas.",75,0,3),
("Célula energética","Recarga genérica de equipamiento electrónico.",30,1,2),
("Herramienta de fusión","Utensilio para cortes y soldaduras industriales.",300,2,4),
("Repuesto de motivador","Componente de repuesto para vehículos ligeros.",650,3,5),
]:
    item("sw-equipo","gear",name,desc,cost,enc,rarity)

for name,desc,cost,enc,rarity,soak in [
("Armadura de stormtrooper","Conjunto rígido inspirado en el equipo blanco imperial.",1800,4,5,2),
("Armadura de scout trooper","Protección liviana para unidades de reconocimiento.",1400,3,5,1),
("Armadura de soldado clon","Protección integral inspirada en la época de las Guerras Clon.",2400,4,6,2),
("Armadura mandaloriana fan","Conjunto de placas personalizable; beneficios a definir por el DJ.",5000,4,9,3),
("Chaleco de combatiente rebelde","Protección práctica para patrullas de resistencia.",800,2,3,1),
("Ropas de viaje jedi","Vestimenta funcional para expediciones y misiones discretas.",180,1,3,0),
("Armadura de cazarrecompensas","Equipo mixto con protección y compartimentos.",2100,4,6,2),
("Traje de piloto espacial","Traje para cabinas y maniobras prolongadas.",700,2,4,1),
]:
    item("sw-armaduras","armour",name,desc,cost,enc,rarity,soak)

for name,desc in [
("Humano","Población presente en muchos sistemas del espacio conocido."),
("Wookiee","Humanoide alto y peludo asociado a Kashyyyk y tradiciones tribales."),
("Twi'lek","Humanoide de Ryloth con apéndices cefálicos característicos."),
("Rodiano","Humanoide de ojos prominentes reconocido entre cazadores y comerciantes."),
("Zabrak","Humanoide de gran resistencia conocido por sus pequeños cuernos."),
("Bothan","Población presente en redes diplomáticas y de información."),
("Mon Calamari","Pueblo anfibio vinculado a la ingeniería y a naves de gran tamaño."),
("Togruta","Humanoide de marcados patrones faciales y apéndices craneales."),
("Trandoshano","Humanoide reptiliano oriundo de Trandosha."),
("Nautolano","Humanoide acuático de tentáculos cefálicos."),
("Duros","Pueblo con larga historia de exploración y navegación."),
("Chiss","Población de tez azulada originaria de regiones remotas."),
("Jawa","Ser de pequeña estatura conocido por comercio y recuperación de piezas."),
("Ithoriano","Pueblo de fisonomía distintiva y tradiciones ecológicas."),
("Droide jugador","Opción fan para representar un personaje mecánico; revisar reglas de tu mesa."),
("Mirialano","Humanoide de Mirial caracterizado por marcas faciales culturales."),
]:
    item("sw-especies","species",name,desc,100)

for name,desc,skills in [
("Contrabandista / Smuggler","Carrera centrada en viajes arriesgados y acuerdos improvisados.",["Deception","Piloting: Space","Streetwise","Ranged: Light"]),
("Cazarrecompensas / Bounty Hunter","Carrera dedicada a rastreo de objetivos y contratos.",["Perception","Vigilance","Ranged: Heavy","Streetwise"]),
("Técnico / Technician","Carrera de sistemas, reparaciones y dispositivos.",["Mechanics","Computers","Perception","Coordination"]),
("Explorador / Explorer","Carrera de supervivencia y rutas desconocidas.",["Survival","Astrogation","Perception","Piloting: Space"]),
("Colono / Colonist","Carrera de relaciones en asentamientos y comercio.",["Negotiation","Charm","Medicine","Streetwise"]),
("Mercenario / Hired Gun","Carrera de seguridad y enfrentamientos.",["Ranged: Heavy","Athletics","Resilience","Vigilance"]),
("As / Ace","Carrera de pilotos de combate.",["Piloting: Space","Gunnery","Cool","Astrogation"]),
("Comandante / Commander","Carrera de mando y coordinación.",["Leadership","Discipline","Warfare","Cool"]),
("Diplomático / Diplomat","Carrera para negociar con gobiernos y comunidades.",["Negotiation","Leadership","Charm","Knowledge: Core Worlds"]),
("Ingeniero / Engineer","Carrera para resolver averías y construir mecanismos.",["Mechanics","Computers","Knowledge: Education","Perception"]),
("Soldado / Soldier","Carrera para tropas disciplinadas.",["Ranged: Heavy","Athletics","Resilience","Discipline"]),
("Espía / Spy","Carrera de infiltración y obtención de información.",["Stealth","Deception","Computers","Streetwise"]),
("Consular / Consular","Carrera narrativa centrada en el diálogo y la Fuerza.",["Discipline","Knowledge: Lore","Negotiation","Charm"]),
("Guardián / Guardian","Carrera narrativa de protección y disciplina.",["Discipline","Vigilance","Melee","Leadership"]),
("Místico / Mystic","Carrera narrativa de búsqueda de conocimientos de la Fuerza.",["Knowledge: Lore","Discipline","Vigilance","Charm"]),
("Buscador / Seeker","Carrera narrativa de rastreo y exploración.",["Survival","Perception","Vigilance","Athletics"]),
("Centinela / Sentinel","Carrera narrativa que combina ingenio y discreción.",["Computers","Stealth","Skulduggery","Perception"]),
("Guerrero / Warrior","Carrera narrativa de combate y práctica marcial.",["Melee","Athletics","Discipline","Vigilance"]),
]:
    item("sw-carreras","career",name,desc,sk=skills)

for name,desc in [
("Slicer","Se especializa en explorar sistemas informáticos y superar bloqueos."),
("Pilot","Se concentra en conducción de naves y maniobras de riesgo."),
("Scoundrel","Aprovecha el ingenio social y la rapidez de reacción."),
("Gadgeteer","Utiliza soluciones técnicas y herramientas modificadas."),
("Assassin","Emplea sigilo y preparación para interceptar objetivos."),
("Mechanic","Mantiene vehículos, droides y maquinaria pesada."),
("Doctor","Centra sus esfuerzos en asistencia sanitaria y rescate."),
("Sharpshooter","Entrena disparos precisos en situaciones complejas."),
("Marauder","Se especializa en acciones físicas de primera línea."),
("Politico","Conoce negociaciones, discursos y relaciones de poder."),
("Force-Sensitive Exile","Concepto de usuario de la Fuerza que evita llamar la atención."),
("Force-Sensitive Emergent","Concepto de personaje que descubre una conexión inesperada con la Fuerza."),
("Guardian Protector","Concepto fan de protector de personas vulnerables."),
("Ataru Striker","Concepto fan de duelista rápido con prácticas acrobáticas."),
("Aggressor","Concepto fan de combatiente que intimida a sus rivales."),
("Niman Disciple","Concepto fan de usuario equilibrado de la Fuerza."),
("Artisan","Concepto fan de creador de herramientas avanzadas."),
("Shadow","Concepto fan de infiltrador especializado."),
]:
    item("sw-especializaciones","specialization",name,desc)

for name,desc in [
("Grit","Propuesta fan: representa fortaleza mental en situaciones de presión."),
("Toughened","Propuesta fan: representa resistencia al agotamiento físico."),
("Quick Draw","Propuesta fan: desenvaina una herramienta con rapidez narrativa."),
("Parry","Propuesta fan: experiencia en defenderse en cuerpo a cuerpo."),
("Reflect","Propuesta fan: familiaridad con detener ataques en combate."),
("Dedication","Propuesta fan: esfuerzo personal para perfeccionar una habilidad."),
("Skilled Jockey","Propuesta fan: habilidad intuitiva con vehículos."),
("Jury Rigged","Propuesta fan: ingenio para modificar dispositivos."),
("Natural Pilot","Propuesta fan: facilidad innata para comprender maniobras."),
("Deadly Accuracy","Propuesta fan: entrenamiento centrado en precisión."),
("Side Step","Propuesta fan: técnica para reposicionarse en un combate."),
("Armor Master","Propuesta fan: familiaridad con protección y movimiento."),
]:
    item("sw-talentos","talent",name,desc)

for name,desc in [
("Move","Poder narrativo fan de manipulación de objetos mediante la Fuerza."),
("Sense","Poder narrativo fan para percibir presencias y emociones."),
("Enhance","Poder narrativo fan de concentración física extraordinaria."),
("Foresee","Poder narrativo fan de intuiciones acerca de posibles sucesos."),
("Influence","Poder narrativo fan de influencia emocional sutil."),
("Bind","Poder narrativo fan para dificultar el movimiento de un enemigo."),
("Misdirect","Poder narrativo fan basado en engaños sensoriales."),
("Heal / Harm","Poder narrativo fan relacionado con energía vital."),
("Protect / Unleash","Poder narrativo fan sobre energía defensiva y ofensiva."),
("Battle Meditation","Poder narrativo fan que representa concentración compartida."),
]:
    item("sw-poderes","forcepower",name,desc)

for name,typ,desc,attr,skills,wd,st,sk,qty in [
("Stormtrooper imperial","Soldado equipado para operaciones de control y patrulla.","minion",{"Brawn":2,"Agility":2},{"Ranged: Heavy":1,"Vigilance":1},5,0,3,3),
("Scout trooper imperial","Unidad ligera de reconocimiento.","minion",{"Agility":3,"Cunning":2},{"Perception":1,"Ranged: Light":1},5,0,2,2),
("Piloto TIE imperial","Tripulante de caza ligero.","minion",{"Agility":3,"Intellect":2},{"Piloting: Space":1,"Gunnery":1},5,0,1,3),
("Oficial imperial","Mando que coordina patrullas y controles.","rival",{"Presence":3,"Intellect":3},{"Leadership":2,"Discipline":2},12,0,2,1),
("Agente ISB","Investigador entrenado para interrogar y detectar riesgos.","nemesis",{"Intellect":3,"Cunning":3},{"Coercion":2,"Investigation":2,"Ranged: Light":2},14,11,2,1),
("Guardia real imperial","Soldado de élite con equipamiento singular.","rival",{"Brawn":3,"Agility":3},{"Melee":3,"Vigilance":2},15,0,3,1),
("Soldado rebelde","Combatiente de una unidad de resistencia.","minion",{"Brawn":2,"Agility":2},{"Ranged: Heavy":1,"Athletics":1},6,0,2,3),
("Piloto rebelde","Aviador habituado a naves de pequeño tamaño.","rival",{"Agility":3,"Intellect":2},{"Piloting: Space":2,"Gunnery":2},10,0,1,1),
("Soldado clon","Soldado profesional de la era de las Guerras Clon.","minion",{"Brawn":2,"Agility":3},{"Ranged: Heavy":1,"Discipline":1},6,0,3,3),
("Droide de batalla B1","Autómata militar básico con coordinación limitada.","minion",{"Brawn":1,"Agility":2},{"Ranged: Heavy":1},4,0,1,4),
("Superdroide B2","Autómata pesado equipado para combate frontal.","minion",{"Brawn":3,"Agility":2},{"Ranged: Heavy":1},7,0,3,2),
("Droideka","Droide de combate con desplazamiento peculiar.","rival",{"Brawn":3,"Agility":2},{"Ranged: Heavy":2},14,0,4,1),
("Cazarrecompensas genérico","Cazador independiente en busca de un objetivo.","rival",{"Agility":3,"Cunning":3},{"Ranged: Light":2,"Streetwise":2},12,0,2,1),
("Guerrero mandaloriano","Combatiente entrenado y protegido con armadura.","rival",{"Brawn":3,"Agility":3},{"Ranged: Light":2,"Melee":2},13,0,3,1),
("Asaltante tusken","Guerrero de los desiertos de Tatooine.","minion",{"Brawn":3,"Agility":2},{"Melee":1,"Survival":1},6,0,2,3),
("Comerciante jawa","Recolector de piezas y comerciante itinerante.","rival",{"Cunning":3,"Intellect":2},{"Negotiation":2,"Mechanics":1},7,0,1,1),
("Droide de protocolo","Autómata dedicado a traducción y mediación.","rival",{"Intellect":3,"Presence":2},{"Knowledge: Education":2,"Negotiation":1},6,0,1,1),
("Droide astromecánico","Autómata dedicado al diagnóstico y la navegación.","rival",{"Intellect":3,"Agility":2},{"Mechanics":2,"Computers":2},7,0,2,1),
("Inquisidor imperial fan","Usuario antagonista de la Fuerza para una campaña original.","nemesis",{"Agility":3,"Willpower":4},{"Lightsaber":3,"Discipline":3},18,14,3,1),
("Wampa","Gran criatura hostil de regiones heladas.","rival",{"Brawn":4,"Agility":2},{"Brawl":3,"Survival":2},18,0,4,1),
("Rancor","Enorme depredador apropiado para un encuentro de alto peligro.","nemesis",{"Brawn":5,"Agility":2},{"Brawl":4,"Perception":2},32,0,5,1),
]:
    actor("sw-adversarios",desc,name,typ,attr,skills,wd,st,sk,qty)

for name,desc,attrs,skills,wd,st,soak in [
("Luke Skywalker","Versión fan del héroe que descubre su relación con la Fuerza.",{"Agility":3,"Willpower":4,"Presence":3},{"Lightsaber":3,"Discipline":3,"Piloting: Space":3},17,17,3),
("Leia Organa","Versión fan de la líder y diplomática de la resistencia.",{"Presence":4,"Willpower":4,"Cunning":3},{"Leadership":4,"Negotiation":3,"Ranged: Light":2},16,17,2),
("Han Solo","Versión fan de un piloto y contrabandista con gran instinto.",{"Agility":4,"Cunning":4,"Presence":3},{"Piloting: Space":4,"Ranged: Light":4,"Deception":3},16,13,2),
("Chewbacca","Versión fan del copiloto wookiee experto en reparaciones.",{"Brawn":5,"Intellect":3},{"Mechanics":4,"Ranged: Heavy":3,"Brawl":3},20,12,4),
("Darth Vader","Versión fan de un poderoso antagonista imperial.",{"Brawn":4,"Willpower":5,"Presence":5},{"Lightsaber":5,"Coercion":4,"Discipline":4},28,22,6),
("Obi-Wan Kenobi","Versión fan de un maestro veterano y paciente.",{"Agility":3,"Willpower":5,"Presence":4},{"Lightsaber":4,"Discipline":5,"Negotiation":3},20,19,3),
("Ahsoka Tano","Versión fan de una viajera experimentada en la Fuerza.",{"Agility":5,"Willpower":4},{"Lightsaber":4,"Vigilance":4,"Athletics":4},20,19,3),
("Boba Fett","Versión fan de un reconocido cazador de recompensas.",{"Agility":4,"Cunning":4},{"Ranged: Heavy":4,"Survival":3,"Piloting: Space":3},20,13,5),
("Din Djarin","Versión fan de un mandaloriano que trabaja por encargos.",{"Brawn":3,"Agility":4},{"Ranged: Heavy":4,"Melee":3,"Survival":3},20,15,5),
("Yoda","Versión fan de un veterano maestro de la Fuerza.",{"Willpower":5,"Intellect":5},{"Discipline":5,"Lightsaber":4,"Knowledge: Lore":5},17,24,3),
("Rey","Versión fan de una exploradora con gran vínculo con la Fuerza.",{"Agility":4,"Willpower":4},{"Melee":3,"Discipline":3,"Mechanics":3},18,18,3),
("Kylo Ren","Versión fan de un antagonista atormentado.",{"Brawn":4,"Willpower":4},{"Lightsaber":4,"Coercion":4,"Discipline":3},22,19,4),
("Emperador Palpatine","Versión fan de un estratega y adversario extraordinario.",{"Willpower":5,"Cunning":5,"Presence":5},{"Deception":5,"Discipline":5,"Coercion":4},19,25,3),
("R2-D2","Versión fan de un droide de soporte astromecánico.",{"Intellect":4,"Agility":3},{"Mechanics":4,"Computers":4,"Astrogation":3},10,0,3),
("C-3PO","Versión fan de un droide orientado a protocolo y traducción.",{"Intellect":4,"Presence":3},{"Knowledge: Education":4,"Negotiation":3},8,0,2),
("Grogu","Versión fan de un pequeño ser sensible a la Fuerza.",{"Willpower":4,"Presence":3},{"Discipline":3,"Vigilance":2},7,12,1),
]:
    actor("sw-personajes","nemesis",name,desc,attrs,skills,wd,st,soak)

for name,desc,sil,speed,hull,sys,arm,passengers in [
("T-65 X-wing","Caza ligero polivalente usado en misiones de escolta.",3,4,15,12,2,1),
("TIE/ln Fighter","Caza imperial monoplaza que prioriza maniobrabilidad.",3,5,10,9,1,1),
("TIE Interceptor","Caza especializado en persecución de alta velocidad.",3,6,11,9,1,1),
("TIE Bomber","Caza pesado optimizado para ataques de apoyo.",3,3,16,12,2,2),
("BTL Y-wing","Cazabombardero robusto para ataques prolongados.",3,3,20,15,3,2),
("RZ-1 A-wing","Interceptor compacto y muy veloz.",3,6,11,11,1,1),
("A/SF-01 B-wing","Caza de perfil irregular y gran potencia.",3,3,19,14,3,1),
("YT-1300 Light Freighter","Carguero ligero configurable para transportar mercancía.",4,3,32,22,3,8),
("Millennium Falcon","Adaptación fan del carguero rápido pilotado por Han Solo.",4,5,35,26,4,8),
("Firespray-31","Nave de patrulla con estructura peculiar y gran autonomía.",4,4,27,18,4,3),
("Lambda-class Shuttle","Lanzadera imperial de transporte y enlace.",4,3,27,19,3,20),
("CR90 Corvette","Corbeta ligera para patrulla y transporte militar.",5,3,75,42,5,120),
("Nebulon-B Frigate","Fragata diseñada para escolta y servicios de flota.",6,2,125,90,5,480),
("Imperial Star Destroyer","Gran nave capital imperial; usa reglas de escala de tu mesa.",8,2,350,200,8,20000),
("Venator Star Destroyer","Nave capital de la era de la República.",8,2,310,200,7,16000),
("ARC-170 Starfighter","Caza de largo alcance de la era de las Guerras Clon.",3,4,19,16,3,3),
("LAAT/i Republic Gunship","Transporte aéreo de asalto de la República.",4,3,30,18,4,20),
("AT-ST Walker","Vehículo terrestre bípedo de patrulla.",3,2,22,12,4,2),
("AT-AT Walker","Vehículo terrestre de asalto pesado.",6,1,85,35,7,40),
("74-Z Speeder Bike","Moto deslizadora para exploración rápida.",2,5,6,5,1,1),
("Jedi Starfighter Delta-7","Nave ligera de pilotaje intensivo.",3,5,12,9,2,1),
("U-wing","Transporte militar ligero de desembarco.",4,4,29,19,3,12),
("Razor Crest","Transporte acorazado de un cazador de recompensas.",4,3,30,20,4,5),
]:
    stats={"silhouette":{"value":sil},"speed":{"value":speed,"max":speed},"handling":{"value":0},
      "hullTrauma":{"value":0,"max":hull},"systemStrain":{"value":0,"max":sys},
      "armour":{"value":arm},"passengerCapacity":{"value":passengers}}
    actor("sw-naves","vehicle",name,desc,vehicle=stats)

journal("00 — IMPORTANTE: Fichas NO oficiales","<h1>Star Wars — contenido fan</h1><p>Este pack incorpora nombres familiares de Star Wars, pero todas las estadísticas, precios, talentos y descripciones aquí escritas son adaptaciones creadas para la mesa. No reproducen ni sustituyen los manuales de Fantasy Flight Games / Edge, y puede haber diferencias relevantes. Esta información no tiene licencia oficial de Disney ni de Lucasfilm. No se incluyen imágenes protegidas de personajes o naves.</p><p>Para obtener tus valores oficiales, introduce datos de tus manuales o importa tu propio dataset con OggDude en el mundo.</p>")
journal("01 — Preparar una patrulla imperial","<h1>Patrulla imperial</h1><p>Encuentro introductorio fan original: una patrulla inspecciona un carguero ligero que transporta una ayuda humanitaria. Sus ocupantes pueden negociar, esconder los suministros o escapar.</p><p>Recursos: Stormtrooper imperial, Piloto TIE, Oficial imperial, YT-1300, TIE/ln y armas de patrulla.</p>")
journal("02 — Encuentro en Tatooine","<h1>Encuentro en Tatooine</h1><p>Los personajes buscan una pieza de hiperimpulsor en un asentamiento desértico. Un mercader jawa ofrece información a cambio de un favor; un grupo tusken vigila una ruta cercana.</p><p>Recursos: Jawa, Asaltante tusken, mochila de supervivencia, comunicador, speeder.</p>")
journal("03 — Persecución de cazas","<h1>Persecución de cazas</h1><p>Un mensaje de auxilio obliga al grupo a atravesar una zona de restos orbitales. Dos cazas enemigos inician una persecución. El DJ puede plantear rutas alternativas y riesgos de navegación.</p><p>Recursos: X-wing, TIE/ln, Y-wing, cartas de objetivos creadas por el DJ.</p>")
journal("04 — Reglas y OggDude","<h1>Cómo usar este índice fan</h1><ol><li>Arrastra los objetos y naves de los compendios a tu mundo.</li><li>Comprueba los valores con tus libros oficiales, pues aquí son inventados.</li><li>Para reglas completas y versiones exactas, usa el importador OggDude del sistema principal con tu colección autorizada.</li><li>Conserva los compendios oficiales separados de estas fichas fan.</li></ol>")

descriptors=[
("sw-armas","Item","Star Wars — Armas (fan)"),
("sw-equipo","Item","Star Wars — Equipo (fan)"),
("sw-armaduras","Item","Star Wars — Armaduras (fan)"),
("sw-especies","Item","Star Wars — Especies (fan)"),
("sw-carreras","Item","Star Wars — Carreras (fan)"),
("sw-especializaciones","Item","Star Wars — Especializaciones (fan)"),
("sw-talentos","Item","Star Wars — Talentos (fan)"),
("sw-poderes","Item","Star Wars — Poderes de la Fuerza (fan)"),
("sw-adversarios","Actor","Star Wars — Adversarios (fan)"),
("sw-personajes","Actor","Star Wars — Personajes conocidos (fan)"),
("sw-naves","Actor","Star Wars — Naves y vehículos (fan)"),
("sw-guias","JournalEntry","Star Wars — Aventuras y guía (fan)"),
]
for name,typ,label in descriptors:
    assert packs.get(name) and len(packs[name])>0,name
    assert not (SRC/(name+".json")).exists(),f"Source file already exists: {name}"
    (SRC/(name+".json")).write_text(json.dumps(packs[name],ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    module["packs"].append({"name":name,"type":typ,"label":label,"path":"packs/"+name,**({"system":"starwarsffg"} if typ in ("Actor","Item") else {})})
module["version"]="1.1.0"
module["download"]="https://github.com/Mitos7/StarWarsFFG/releases/download/swffg-starter-1.1.0/swffg-mitos-starter.zip"
module["description"]="23 compendios: material original y referencias fan no oficiales de Star Wars (naves, armas, especies, personajes y adversarios) con datos jugables caseros; no incluye manuales FFG."
module["flags"]["swffg-mitos-starter"]["booksIncluded"]=False
module["flags"]["swffg-mitos-starter"]["fanContent"]=True
(OUT/"module.json").write_text(json.dumps(module,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
# Clear statement of licensing scope: CC0 only applies to independently-authored descriptions and data,
# not franchise character names, art, lore, or other third-party materials.
licensepath=OUT/"LICENSE"
licensepath.write_text("CC0 1.0 Universal — applies ONLY to independently-written descriptions, original item names, original scenarios and example numerical values in this starter module. No official Star Wars, Lucasfilm, Disney, Fantasy Flight Games, Edge Studio or third-party characters, trademarks, art or lore are licensed by this statement. This is an unofficial, noncommercial fan adaptation with no publisher endorsement. No original book rules or statistics are included.\n",encoding="utf8")
readme=OUT/"README.md"
old=readme.read_text(encoding="utf8")
old=old.replace("11 compendios","23 compendios").replace("11 compendios de recursos originales","23 compendios de referencias fan y recursos originales")
old+="\n## Contenido de Star Wars reconocible (adaptación fan)\n\nSe añaden 12 compendios específicamente ambientados en Star Wars: 17 armas, 16 objetos de equipo, 8 armaduras, 16 especies, 18 carreras, 18 especializaciones, 12 talentos, 10 poderes narrativos, 21 adversarios, 16 personajes conocidos, 23 naves y vehículos, y 5 guías. Los nombres reconocibles pertenecen a sus respectivos titulares de derechos. **No se han copiado ni transcrito estadísticas ni textos de los libros de FFG/Edge**: todas las características son propuestas originales y no oficiales, que el director deberá contrastar con sus manuales. El kit no incluye retratos oficiales ni ficheros de datos privados.\n"
readme.write_text(old,encoding="utf8")
print("FAN_PACKS",len(descriptors),"FAN_DOCUMENTS",sum(len(v) for v in packs.values()),"ALL_PACKS",len(module["packs"]))
print("COUNTS",json.dumps({k:len(v) for k,v in packs.items()},ensure_ascii=False))
