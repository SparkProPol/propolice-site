console.log("📱 SIMULATEUR MOBILE MULTI-GRILLES CHARGÉ");

// 🔥 GRILLES RÉELLES (À AJUSTER AVEC TES TABLEAUX)
const GRILLES = {

  paris: {
    "0": { gpx: [1800,1850,1900,1950,2000,2020,2040,2050,2070] },
    "1": { gpx: [1820,1870,1920,1970,2020,2040,2060,2070,2090] },
    "3": { gpx: [1850,1900,1950,2000,2050,2070,2090,2100,2120] }
  },

  province: {
    "0": { gpx: [1700,1750,1800,1850,1880,1900,1920,1930,1950] },
    "1": { gpx: [1720,1770,1820,1870,1900,1920,1940,1950,1970] },
    "3": { gpx: [1750,1800,1850,1900,1930,1950,1970,1980,2000] }
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
  const tauxIR = parseFloat(zone) / 100;
const indemniteResidence = (salaireBase * tauxIR) * 0.85;

const total = salaireBase + ISSP + indemniteResidence;

  document.getElementById("resultatMobile").innerHTML = `
    <div>
      💰 Base : ${salaireBase.toFixed(2)} €<br>
      📈 ISSP : ${ISSP.toFixed(2)} €<br>
      <strong>➡️ Total : ${total.toFixed(2)} €</strong>
    </div>
  `;
}
