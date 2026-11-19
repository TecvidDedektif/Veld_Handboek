// mA ↔ debiet. Werkt voor elk blok met class "reken" en data-standaard attributen.
(function () {
  function getal(tekst) {
    const t = String(tekst).trim().replace(/\s/g, "").replace(",", ".");
    if (t === "") return NaN;
    return Number(t);
  }
  function mooi(n, decimalen) {
    return n.toLocaleString("nl-NL", { minimumFractionDigits: decimalen, maximumFractionDigits: decimalen });
  }

  function koppel(blok) {
    const veld = (naam) => blok.querySelector('[name="' + naam + '"]');
    const min = veld("min"), max = veld("max"), eenheid = veld("eenheid");
    const ma = veld("ma"), debiet = veld("debiet");
    const uit = blok.querySelector(".uit"), melding = blok.querySelector(".melding");
    let laatste = "ma";

    function reken() {
      const qmin = getal(min.value), qmax = getal(max.value);
      const e = eenheid.value.trim() || "m³/h";
      melding.textContent = "";

      if (!isFinite(qmin) || !isFinite(qmax) || qmax === qmin) {
        uit.textContent = "Vul het meetbereik in";
        return;
      }

      if (laatste === "ma") {
        const i = getal(ma.value);
        if (!isFinite(i)) { uit.textContent = "Vul een stroom in (mA)"; return; }
        const q = qmin + ((i - 4) / 16) * (qmax - qmin);
        const procent = ((i - 4) / 16) * 100;
        uit.textContent = mooi(i, 2) + " mA = " + mooi(q, 1) + " " + e + "  (" + mooi(procent, 1) + " %)";
        if (i < 0.5) melding.textContent = "Rond 0 mA: draadbreuk, geen voeding of uitgang stuurt niet.";
        else if (i < 4) melding.textContent = "Onder 4 mA: onder het meetbereik. Kijk ook naar de foutinstellingen van de converter.";
        else if (i > 20) melding.textContent = "Boven 20 mA: boven het meetbereik of een foutstroom. Kijk naar het display van de converter.";
      } else {
        const q = getal(debiet.value);
        if (!isFinite(q)) { uit.textContent = "Vul een debiet in"; return; }
        const i = 4 + (16 * (q - qmin)) / (qmax - qmin);
        uit.textContent = mooi(q, 1) + " " + e + " = " + mooi(i, 2) + " mA";
        if (i < 4) melding.textContent = "Debiet onder het begin van het bereik: de uitgang blijft rond 4 mA.";
        else if (i > 20) melding.textContent = "Debiet boven het bereik: de uitgang gaat in begrenzing of foutstroom.";
      }
    }

    ma.addEventListener("input", () => { laatste = "ma"; debiet.value = ""; reken(); });
    debiet.addEventListener("input", () => { laatste = "debiet"; ma.value = ""; reken(); });
    [min, max, eenheid].forEach((v) => v.addEventListener("input", reken));
    reken();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".reken").forEach(koppel);
  });
})();
