console.log("📱 SIMULATEUR MOBILE MULTI-GRILLES CHARGÉ");

// 🔥 GRILLES RÉELLES (À AJUSTER AVEC TES TABLEAUX)
const GRILLES = {

  paris: {
    "3": { gpx: [2100,2200,2300,2400,2500,2600,2700,2800,2900] },
    "1": { gpx: [2000,2100,2200,2300,2400,2500,2600,2700,2800] },
    "0": { gpx: [1950,2050,2150,2250,2350,2450,2550,2650,2750] }
  },

  province: {
    "3": { gpx: [2000,2100,2200,2300,2400,2500,2550,2600,2700] },
    "1": { gpx: [1900,2000,2100,2200,2300,2400,2450,2500,2600] },
    "0": { gpx: [1850,1950,2050,2150,2250,2350,2400,2450,2550] }
  }

};

// 🔥 Récupération salaire base selon grille
function getSalaireBaseMobile(grade, echelon, affectation, zone) {

  const data = GRILLES[affectation]?.[zone] || GRILLES["province"]["0"];
  const grille = data[grade] || data["gpx"];

  const index = Math.max(0, Math.min(grille.length - 1, echelon - 1));

  return grille[index];
}

// 🔥 Calcul mobile
function calculerMobile() {

  const grade = document.getElementById("grade")?.value || "gpx";
  const echelon = parseInt(document.getElementById("echelon")?.value || 1, 10);
  const affectation = document.getElementById("affectation")?.value || "province";
  const zone = document.getElementById("zone")?.value || "0";

  const salaireBase = getSalaireBaseMobile(grade, echelon, affectation, zone);

  const ISSP = salaireBase * 0.285;
  const total = salaireBase + ISSP;

  document.getElementById("resultatMobile").innerHTML = `
    <div>
      💰 Base : ${salaireBase.toFixed(2)} €<br>
      📈 ISSP : ${ISSP.toFixed(2)} €<br>
      <strong>➡️ Total : ${total.toFixed(2)} €</strong>
    </div>
  `;
}
