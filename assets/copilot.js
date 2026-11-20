// "Kopieer voor Copilot": zet de tekst van een pagina (of het hele handboek)
// met een korte instructie op het klembord, zodat je hem in Copilot kunt plakken.
(function () {
  const INSTRUCTIE_PAGINA =
    "Je helpt een telemetriemonteur in het veld. Gebruik alleen de tekst hieronder, een pagina uit mijn veldhandboek. " +
    "Staat het antwoord er niet in, zeg dat dan eerlijk. Antwoord kort en stap voor stap. " +
    "Vraag ik iets in het Turks, antwoord dan in het Turks.";
  const INSTRUCTIE_ALLES =
    "Je helpt een telemetriemonteur in het veld. Hieronder staat mijn complete veldhandboek. Gebruik alleen deze tekst. " +
    "Staat het antwoord er niet in, zeg dat dan eerlijk. Noem de pagina waar je het antwoord vond. Antwoord kort en stap voor stap. " +
    "Vraag ik iets in het Turks, antwoord dan in het Turks.";

  const BLOK = new Set(["P", "DIV", "SECTION", "HEADER", "FIGURE", "FIGCAPTION", "DETAILS", "SUMMARY", "TABLE", "UL", "OL", "MAIN"]);

  // Zet een stuk HTML om naar leesbare platte tekst (koppen, lijsten, tabellen, afbeeldingen).
  function naarTekst(wortel) {
    let uit = "";
    function loop(n) {
      if (n.nodeType === 3) { uit += n.nodeValue.replace(/\s+/g, " "); return; }
      if (n.nodeType !== 1) return;
      const tag = n.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "INPUT" || tag === "BUTTON") return;
      if (tag === "IMG") { const alt = n.getAttribute("alt"); if (alt) uit += "\n[Afbeelding: " + alt + "]\n"; return; }
      if (n.getAttribute("role") === "img") { const l = n.getAttribute("aria-label"); if (l) uit += "\n[Afbeelding: " + l + "]\n"; return; }
      if (tag === "BR") { uit += "\n"; return; }
      if (/^H[1-3]$/.test(tag)) { uit += "\n\n" + "#".repeat(Number(tag[1])) + " "; }
      else if (tag === "LI") {
        const ouder = n.parentElement;
        if (ouder && ouder.tagName === "OL") {
          const broers = Array.from(ouder.children).filter((c) => c.tagName === "LI");
          const i = broers.indexOf(n);
          const metNul = broers[0] && broers[0].classList.contains("nul");
          const start = metNul ? 0 : Number(ouder.getAttribute("start") || 1);
          uit += "\n" + (start + i) + ". ";
        } else uit += "\n- ";
      }
      else if (tag === "TR") uit += "\n";
      else if (tag === "TD" || tag === "TH") uit += " | ";
      else if (tag === "SUMMARY") uit += "\n";
      else if (BLOK.has(tag)) uit += "\n";
      for (const c of n.childNodes) loop(c);
      if (/^H[1-3]$/.test(tag) || BLOK.has(tag)) uit += "\n";
    }
    loop(wortel);
    return uit
      .split("\n")
      .map((r) => r.replace(/ {2,}/g, " ").replace(/^ \| /, "| ").trim())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // Alleen de inhoud: zonder menu, inhoudsopgave, rekenmachine, voettekst en de knop zelf.
  function paginaTekst(doc) {
    const main = doc.querySelector("main");
    if (!main) return "";
    const kloon = main.cloneNode(true);
    kloon.querySelectorAll(".copilot, .voet, details.inhoud, .reken, script").forEach((e) => e.remove());
    return naarTekst(kloon);
  }

  function pakket(instructie, delen) {
    return instructie + "\n\n" + delen.join("\n\n") + "\n\n=== EINDE ===\n\nMijn vraag: ";
  }

  function kopieer(tekst) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(tekst).then(() => true, () => oudeManier(tekst));
    }
    return Promise.resolve(oudeManier(tekst));
  }
  function oudeManier(tekst) {
    const ta = document.createElement("textarea");
    ta.value = tekst;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function knop(label) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "knop";
    b.textContent = label;
    return b;
  }

  function meld(el, ok) {
    el.textContent = ok
      ? "Gekopieerd. Open Copilot, plak de tekst en typ je vraag erachter."
      : "Kopiëren lukte niet. Selecteer de tekst van de pagina en kopieer hem met de hand.";
  }

  // ---------- inhoudspagina: één knop voor deze pagina ----------
  function opPagina(kop) {
    const blok = document.createElement("div");
    blok.className = "copilot";
    const b = knop("Kopieer voor Copilot");
    const status = document.createElement("span");
    status.className = "melding-copilot";
    status.setAttribute("aria-live", "polite");
    blok.append(b, status);
    kop.appendChild(blok);

    b.addEventListener("click", () => {
      const titel = document.querySelector("h1") ? document.querySelector("h1").textContent.trim() : document.title;
      const tekst = pakket(INSTRUCTIE_PAGINA, [
        "=== PAGINA: " + titel + " (" + location.href.split("#")[0] + ") ===\n" + paginaTekst(document),
      ]);
      kopieer(tekst).then((ok) => meld(status, ok));
    });
  }

  // ---------- startpagina: alles in één keer ----------
  function opStart(na) {
    const sectie = document.createElement("section");
    sectie.className = "copilot copilot-alles";
    sectie.innerHTML =
      "<h2>Copilot gebruiken</h2>" +
      "<p>Op elke pagina staat een knop <b>Kopieer voor Copilot</b>. Hier kopieer je het hele handboek in één keer. " +
      "Is dat te lang voor Copilot, gebruik dan de knop op de pagina zelf, of download het tekstbestand en voeg het toe aan je vraag.</p>";
    const rij = document.createElement("div");
    rij.className = "knoppen";
    const b = knop("Kopieer alles voor Copilot");
    b.disabled = true;
    const download = document.createElement("a");
    download.className = "knop";
    download.textContent = "Download als tekstbestand";
    download.setAttribute("aria-disabled", "true");
    const status = document.createElement("p");
    status.className = "melding-copilot";
    status.setAttribute("aria-live", "polite");
    status.textContent = "Handboek wordt klaargezet…";
    rij.append(b, download);
    sectie.append(rij, status);
    na.after(sectie);

    // Vooraf ophalen, zodat kopiëren direct bij de klik kan (nodig op iPhone/iPad).
    const lijst = typeof PAGINAS !== "undefined" ? PAGINAS : [];
    Promise.all(
      lijst.map((p) =>
        fetch(p.url)
          .then((r) => (r.ok ? r.text() : ""))
          .then((html) => {
            if (!html) return "";
            const doc = new DOMParser().parseFromString(html, "text/html");
            const url = new URL(p.url, location.href).href;
            return "=== PAGINA: " + p.titel + " (" + url + ") ===\n" + paginaTekst(doc);
          })
          .catch(() => "")
      )
    ).then((delen) => {
      const tekst = pakket(INSTRUCTIE_ALLES, delen.filter(Boolean));
      const blob = new Blob([tekst], { type: "text/plain;charset=utf-8" });
      download.href = URL.createObjectURL(blob);
      download.download = "veldhandboek-voor-copilot.txt";
      download.removeAttribute("aria-disabled");
      b.disabled = false;
      status.textContent = "Klaar: " + delen.filter(Boolean).length + " pagina's, " + tekst.length.toLocaleString("nl-NL") + " tekens.";
      b.addEventListener("click", () => kopieer(tekst).then((ok) => meld(status, ok)));
      window.__copilotAlles = tekst; // voor testen
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const kop = document.querySelector("main .kopblok");
    const resultaten = document.getElementById("resultaten");
    if (kop) opPagina(kop);
    else if (resultaten) opStart(resultaten);
  });

  window.__copilotPaginaTekst = () => paginaTekst(document); // voor testen
})();
