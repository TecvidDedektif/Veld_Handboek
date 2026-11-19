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
      "klantsignaal klant signaal storing zoeken testen meten stroom stroomuitgang analoog flowmeter debietmeter optisonic 3400 krohne ufc400 signaalscheider scheidingsversterker phoenix mini mcr ui 2i fluke 179 multimeter serie simulatie simulation current out actief passief geen 0 ma draadbreuk meetbereik range dip schakelaar",
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
  if (!treffers.length) {
    const li = document.createElement("li");
    li.className = "leeg";
    li.textContent =
      "Niets gevonden voor “" + invoer.value.trim() + "”. Probeer een apparaat (ufc 400), een signaal (4-20 mA) of een meetinstrument (fluke).";
    lijst.appendChild(li);
    return;
  }

  for (const { p } of treffers) {
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

    a.append(titel, soort, samen, labels);
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
