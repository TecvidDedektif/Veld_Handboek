// Inhoud van het handboek. Nieuwe pagina? Voeg hier een regel toe.
const PAGINAS = [
  {
    titel: "Klantsignaal 4-20 mA: storing zoeken",
    soort: "Procedure",
    url: "procedures/klantsignaal-4-20ma.html",
    samenvatting:
      "Klant ontvangt geen of een verkeerd 4-20 mA signaal. Meten met de Fluke van flowmeter (KROHNE UFC 400) via signaalscheider tot de klant, met simulatie en menupaden.",
    labels: ["KROHNE UFC 400", "4-20 mA", "Signaalscheider", "Fluke 179"],
    woorden:
      "klantsignaal klant signaal storing zoeken testen meten stroom stroomuitgang analoog flowmeter debietmeter optisonic 3400 krohne ufc400 signaalscheider scheidingsversterker phoenix mini mcr ui 2i fluke 179 multimeter serie simulatie simulation current out actief passief geen 0 ma draadbreuk meetbereik range dip schakelaar 789 processmeter",
  },
  {
    titel: "Fluke 789 ProcessMeter: lus testen",
    soort: "Procedure",
    url: "procedures/fluke-789-processmeter.html",
    samenvatting:
      "Welke stand wanneer: Source, Simulate, Loop power of meten. Met recepten voor het testen van een scheider- of RTU-ingang en van een losse 2-draads transmitter.",
    labels: ["Fluke 789", "4-20 mA", "Source", "Simulate", "Loop power"],
    woorden:
      "fluke 789 787 787b processmeter procesmeter procesmtr meettang loop calibrator lus kalibrator bron sturen source simulate simuleren simulatie lusvoeding loop power 24 v hart 250 ohm span check 25 % step coarse fine ramp transmitter drukopnemer druksensor 2-draads tweedraads rtu ingang testen signaalscheider ijken",
  },
  {
    titel: "KROHNE IFC 300 W: aansluiten",
    soort: "Apparaat",
    url: "apparaten/krohne-ifc-300-w.html",
    samenvatting:
      "Klemmen van voeding, I/O, spoelkabel (7-8-9) en signaalkabel (1-2-3-20) naar de OPTIFLUX-sensor. Met actieve en passieve stroomuitgang.",
    labels: ["KROHNE IFC 300 W", "OPTIFLUX", "Aansluitschema"],
    woorden:
      "krohne ifc 300 ifc300 w wand wandbehuizing optiflux elektromagnetisch magnetisch flowmeter debietmeter aansluiten aansluitschema bedrading klemmen spoelkabel veldstroom signaalkabel ds 300 afscherming zadelklem aarde voeding 230 24 basic io stroomuitgang actief passief a+ a- hart status puls kabelnummer",
  },
  {
    titel: "UFC 400 uitlezen met KMS en PACTware",
    soort: "Procedure",
    url: "procedures/ufc400-uitlezen.html",
    samenvatting:
      "Parameters, diagnose en signaalsnapshot van een UFC 400 vastleggen met de KROHNE Monitoring Software, daarna de meetwaarden via PACTware (Load from Device).",
    labels: ["KROHNE UFC 400", "KMS", "PACTware"],
    woorden:
      "uitlezen uitlezing demin meter krohne ufc 400 ufc400 optisonic kms krohne monitoring software pactware dtm gdc usb adapter mini usb com poort parameters export csv diagnostics diagnose snapshot signaal load from device cyclic update screenshot",
  },
  {
    titel: "mA ↔ debiet rekenmachine",
    soort: "Hulpmiddel",
    url: "tools/ma-debiet.html",
    samenvatting:
      "Reken een gemeten stroom om naar debiet, of andersom. Vul het meetbereik in zoals het in de converter staat.",
    labels: ["4-20 mA", "Meetbereik"],
    woorden:
      "rekenmachine rekenen omrekenen ma milliampere debiet flow m3/h meetbereik bereik range schaal schaling 4-20 verwachte stroom",
  },
];

const STOPWOORDEN = new Set([
  "de", "het", "een", "en", "van", "met", "op", "in", "voor", "naar", "bij", "te", "is", "hoe", "wat",
  "the", "a", "an", "of", "to", "with", "how",
  "ve", "ile", "nasil", "nedir", "bir", "icin",
]);

function normaal(tekst) {
  return tekst
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i");
}

function score(pagina, woorden) {
  const hooiberg = normaal(
    [pagina.titel, pagina.samenvatting, pagina.labels.join(" "), pagina.woorden].join(" ")
  );
  const compact = hooiberg.replace(/[\s\-]/g, "");
  let punten = 0;
  for (const w of woorden) {
    if (hooiberg.includes(w)) punten += normaal(pagina.titel).includes(w) ? 3 : 1;
    else if (compact.includes(w.replace(/-/g, ""))) punten += 1;
  }
  return punten;
}

function toon(lijst, invoer) {
  const ruw = normaal(invoer.value.trim());
  const woorden = ruw.split(/\s+/).filter((w) => w && !STOPWOORDEN.has(w));

  let treffers = PAGINAS.map((p) => ({ p, s: woorden.length ? score(p, woorden) : 1 }));
  if (woorden.length) treffers = treffers.filter((t) => t.s > 0).sort((a, b) => b.s - a.s);

  lijst.innerHTML = "";
  const groeperen = !woorden.length;
  if (groeperen) {
    const volgorde = { Procedure: 0, Apparaat: 1, Hulpmiddel: 2 };
    treffers.sort((a, b) => volgorde[a.p.soort] - volgorde[b.p.soort]);
  }
  const koppen = { Procedure: "Procedures", Apparaat: "Apparaten", Hulpmiddel: "Hulpmiddelen" };
  let vorige = null;
  if (!treffers.length) {
    const li = document.createElement("li");
    li.className = "leeg";
    li.textContent =
      "Niets gevonden voor “" + invoer.value.trim() + "”. Probeer een apparaat (ufc 400), een signaal (4-20 mA) of een meetinstrument (fluke).";
    lijst.appendChild(li);
    return;
  }

  for (const { p } of treffers) {
    if (groeperen && p.soort !== vorige) {
      const kop = document.createElement("li");
      kop.className = "groep";
      kop.textContent = koppen[p.soort] || p.soort;
      lijst.appendChild(kop);
      vorige = p.soort;
    }
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = p.url;

    const titel = document.createElement("span");
    titel.className = "titel";
    titel.textContent = p.titel;

    const soort = document.createElement("span");
    soort.className = "soort";
    soort.textContent = "  " + p.soort;

    const samen = document.createElement("span");
    samen.className = "samenvatting";
    samen.textContent = p.samenvatting;

    const labels = document.createElement("span");
    labels.className = "labels";
    for (const l of p.labels) {
      const k = document.createElement("span");
      k.className = "kous";
      k.textContent = l;
      labels.appendChild(k);
    }

    if (groeperen) a.append(titel, samen, labels);
    else a.append(titel, soort, samen, labels);
    li.appendChild(a);
    lijst.appendChild(li);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const invoer = document.getElementById("zoekveld");
  const lijst = document.getElementById("resultaten");
  const vraag = new URLSearchParams(location.search).get("q");
  if (vraag) invoer.value = vraag;
  toon(lijst, invoer);
  invoer.addEventListener("input", () => toon(lijst, invoer));
});
