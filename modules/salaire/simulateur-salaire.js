function calculer() {

  const grade = document.getElementById("grade").value;
  const echelon = parseInt(document.getElementById("echelon").value);
  const typeZone = document.getElementById("typeZone").value;
  const zoneOM = document.getElementById("zoneOM").value;

  // 🔹 BASE SIMPLIFIÉE (à remplacer ensuite par ta vraie BDD)
  const base = 2161; // GPX 8

  const ISSP = base * 0.285;
  const primesFixes = 320 + 112;

  let majoration = 0;

  if (typeZone === "outremer") {

    const label = document.getElementById("zoneOM").selectedOptions[0].text;

    if (label.includes("Polynésie")) {
      majoration = base * 0.65;
    }
    else if (label.includes("Mayotte")) {
      majoration = base * 0.40;
    }
    else {
      majoration = base * 0.40;
    }
  }

  let brut = base + ISSP + primesFixes + majoration;

  let net = brut;

  // Ajustement fin
  if (typeZone === "outremer") {

    const label = document.getElementById("zoneOM").selectedOptions[0].text;

    if (label.includes("Polynésie")) {
      net = brut;
    }
    else if (label.includes("Mayotte")) {
      net = brut * 0.74;
    }

  } else {
    net = brut * 0.83;
  }

  document.getElementById("resultat").innerHTML = `
    <h3>Résultat</h3>
    💰 Brut : ${brut.toFixed(2)} €<br>
    💸 Net : ${net.toFixed(2)} €
  `;
}
