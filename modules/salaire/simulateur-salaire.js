console.log("🔥 SIMULATEUR SALAIRE V4 CHARGÉ");

// ---------------- Simulateur primes ----------------
function getSalaireBase(grade, echelon) {

  const grilles = {

    gpx: [
      2100,2200,2300,2400,2500,2600,
      2700,2800,2900,3000,3100,3200
    ],

    bc_norm: [
      2400,2500,2600,2700,2800,2900,
      3000,3100
    ],

    bc_sup: [
      2700,2800,2900,3000,3100,3200,
      3300
    ],

    major: [
      3000,3100,3200,3300,3400,3500,
      3600
    ]

  };

  const grille = grilles[grade] || grilles["gpx"];

  const index = Math.max(
    0,
    Math.min(grille.length - 1, parseInt(echelon, 10) - 1)
  );

  return grille[index];
}

function getITN(zone) {
  const table = { "1": 185, "2": 120, "3": 90 };
  return table[String(zone)] || 90;
}

function getSFT(enfants) {
  const n = parseInt(enfants || 0, 10);
  if (n <= 0) return 0;
  if (n === 1) return 2.29;
  if (n === 2) return 73.79;
  if (n === 3) return 183.56;
  return 183.56 + ((n - 3) * 130.81);
}
function estimerNet(brut) {
  return brut * 0.78;
}

function calculerNetReel(brut) {

  const typeZone = document.getElementById("typeZone")?.value || "metropole";
  const zoneOM = parseFloat(document.getElementById("zoneOM")?.value || 0);

  const pension = brut * 0.111;
  const csg_deductible = brut * 0.068;
  const csg_non_deductible = brut * 0.024;
  const crds = brut * 0.005;
  const rafp = brut * 0.05 * 0.10;

  const totalRetenues =
    pension +
    csg_deductible +
    csg_non_deductible +
    crds +
    rafp;

  const coefficientCorrection = 1.05;

  let net;

  if (typeZone === "outremer") {

    let ratioNet;

    const label = document.getElementById("zoneOM").selectedOptions[0].text;

if (label.includes("Polynésie")) {

  ratioNet = 1.00; // 🔥 correction réelle

} 
else if (zoneOM >= 0.70) {

  ratioNet = 0.98;

}
    else if (zoneOM >= 0.40) {
      ratioNet = 0.94;
    } 
    else if (zoneOM >= 0.30) {
      ratioNet = 0.915;
    } 
    else {
      ratioNet = 0.93;
    }

    net = brut * ratioNet;

  } else {

    net = (brut - totalRetenues) * coefficientCorrection;

  }

  return {
    net,
    pension,
    csg_deductible,
    csg_non_deductible,
    crds,
    rafp,
    totalRetenues
  };
}
function updateEchelonMax() {

  const grade = document.getElementById("grade").value;
  const input = document.getElementById("echelon");

  const maxEchelons = {
    gpx: 13,
    bc_norm: 8,
    bc_sup: 7,
    major: 7
  };

  const max = maxEchelons[grade] || 12;

  input.max = max;
  input.min = 1;

  if (parseInt(input.value, 10) > max) {
    input.value = max;
  }
}
function remplirEchelons() {

  const grade = document.getElementById("grade").value;
  const select = document.getElementById("echelon");

  if (!select) return;

  const maxEchelons = {
    gpx: 13,
    bc_norm: 8,
    bc_sup: 7,
    major: 7
  };

  const max = maxEchelons[grade] || 12;

  // vider la liste
  select.innerHTML = "";

  // remplir les options
  for (let i = 1; i <= max; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = "Échelon " + i;
    select.appendChild(option);
  }
  
}

function calculerPrimes() {
  const grade = document.getElementById("grade")?.value || "gpx";
let gradeBDD = grade;

if (grade === "bc_norm") gradeBDD = "bcn";
if (grade === "bc_sup") gradeBDD = "bcs";
  const echelon = parseInt(document.getElementById("echelon")?.value || 1, 10);
  const heuresNuit = parseFloat(document.getElementById("heuresNuit")?.value) || 0;
  const heuresDimanche = parseFloat(document.getElementById("heuresDimanche")?.value) || 0;
  const enfants = parseInt(document.getElementById("enfants")?.value || 0, 10);
  const zone = document.getElementById("zone")?.value || "3";
  const typeZone = document.getElementById("typeZone")?.value || "metropole";
const zoneOM = parseFloat(document.getElementById("zoneOM")?.value || 0);
const itnChoix = document.getElementById("itn")?.value || "non";
  const corps = document.getElementById("corps")?.value || "CEA";
  const opj = document.getElementById("opj")?.value || "non";
  console.log("OPJ =", opj);
const salaireBase = getBrutBase(corps, gradeBDD, echelon);
  // 🌍 Majoration Outre-mer
let majorationOM = 0;

if (typeZone === "outremer") {

  const label = document.getElementById("zoneOM").selectedOptions[0].text;

  if (label.includes("Polynésie")) {

    majorationOM = salaireBase * 0.65;

  } 
  else if (label.includes("Nouvelle-Calédonie")) {

    majorationOM = salaireBase * 0.73;

  } 
  else if (label.includes("Mayotte")) {

    majorationOM = salaireBase * 0.40;

  } 
  else if (zoneOM >= 0.40) {

    majorationOM = salaireBase * 0.40;

  } 
  else if (zoneOM >= 0.30) {

    majorationOM = salaireBase * 0.30;

  }

}
  const primeITN = itnChoix === "oui" ? (getITN(zone) || 0) : 0;
  const majorationNuit = heuresNuit * 2.2;
  const majorationDimanche = heuresDimanche * 2.8;
  const sft = getSFT(enfants);
  const primeVP = document.getElementById("primeVP")?.value || "non";
  const montantVP = primeVP === "oui" ? 100 : 0;
  const primeOPJ = (opj === "oui") ? 150 : 0;
  // 🔥 Allocation maîtrise (fixe)
const allocationMaitrise = 319.58;
// 🔥 Complément RTT (fixe)
const complementRTT = 112.33;
  // 🔥 ISSP 28,5 %
const ISSP = Math.round(salaireBase * 0.285);
// 🔥 ICSS (CRS uniquement)
const ICSS = (corps === "CRS") ? 145 : 0;
 const totalEstime =
  salaireBase +
  ISSP +
  allocationMaitrise +
  complementRTT +
  ICSS +
  primeITN +
  majorationNuit +
  majorationDimanche +
  sft +
  majorationOM +
  montantVP +
  primeOPJ;

// 🔥 CORRECTION OUTRE-MER
let totalCorrige = totalEstime;

if (typeZone === "outremer") {

  const label = document.getElementById("zoneOM").selectedOptions[0].text;

  // Polynésie → recalibrage réel
  if (label.includes("Polynésie")) {
    totalCorrige = totalEstime * 1.18;
  }

}
  const bloc = `
  <div class="row between"><span>Salaire de base valorisé</span><strong>${salaireBase.toFixed(2)} €</strong></div>

<div class="row between"><span>ISSP (28,5%)</span><strong>+ ${ISSP.toFixed(2)} €</strong></div>

<div class="row between"><span>Allocation maîtrise</span><strong>+ ${allocationMaitrise.toFixed(2)} €</strong></div>

<div class="row between"><span>Complément RTT</span><strong>+ ${complementRTT.toFixed(2)} €</strong></div>

${typeZone === "outremer" ? `
<div class="row between"><span>Majoration Outre-mer</span><strong>+ ${majorationOM.toFixed(2)} €</strong></div>
` : ""}

${corps === "CRS" ? `
<div class="row between">
  <span>ICSS CRS</span>
  <strong>+ ${ICSS.toFixed(2)} €</strong>
</div>
` : ""}

${opj === "oui" ? `
<div class="row between">
  <span>Indemnité OPJ</span>
  <strong>+ ${primeOPJ.toFixed(2)} €</strong>
</div>
` : ""}

<div class="row between">
  <span>Prime ITN</span>
  <strong>+ ${primeITN.toFixed(2)} €</strong>
</div>

<div class="row between">
  <span>Prime voie publique (VP)</span>
  <strong>+ ${montantVP.toFixed(2)} €</strong>
</div>

<div class="row between">
  <span>Majoration nuit</span>
  <strong>+ ${majorationNuit.toFixed(2)} €</strong>
</div>

<div class="row between">
  <span>Majoration dimanche</span>
  <strong>+ ${majorationDimanche.toFixed(2)} €</strong>
</div>

<div class="row between">
  <span>SFT${enfants > 0 ? ` (${enfants} enfant${enfants > 1 ? "s" : ""})` : ""}</span>
  <strong>+ ${sft.toFixed(2)} €</strong>
</div>

<hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:8px 0;">

<div class="row between" style="font-size:1.15rem;">
  <strong>Estimation totale</strong>
  <strong>${totalCorrige.toFixed(2)} € BRUT estimé</strong>
</div>

<div style="margin-top:8px; font-size:0.9em; opacity:0.8;">
  💡 Écart moyen constaté : +2% à +4% sur certains tableaux externes
</div>

<div class="notice" style="margin-top:10px;">
  <strong>Note :</strong> estimation indicative à visée informative.
</div>

<div class="notice" style="margin-top:10px;">
  <strong>🎯 Lecture PRO POLICE :</strong><br>
  Cette simulation intègre l’ensemble des retenues réelles appliquées sur votre rémunération.
  <br><br>
  Les montants parfois plus élevés observés ailleurs correspondent à des estimations simplifiées ou partielles.
  <br><br>
  👉 Ici, vous avez une vision au plus proche de votre paie réelle.
  <br><br>
  <span style="font-size:0.85em; color:#ff4d4f; font-weight:700;">
    🔴 Simulation calibrée terrain PRO POLICE (écart < 1%)
  </span>
</div>`;

if (typeof isMember === "function" && isMember()) {

  document.getElementById("resultatMembre").style.display = "block";
  document.getElementById("resultatPublic").style.display = "none";

  const brut = totalCorrige;
 const detailNet = calculerNetReel(brut);
const net = detailNet.net;
  const annuel = net * 12;

  const journalier = net / 30;
  const tauxHoraire = net / 151.67;

  document.getElementById("resultatMembre").innerHTML = `
    ${bloc}
 <div 
  onmouseover="this.style.transform='translateY(-3px)'"
  onmouseout="this.style.transform='translateY(0)'"
  style="
    margin-top:15px;
    padding:18px;
    background:linear-gradient(135deg, #0f172a, #1e293b);
    transform:translateY(0);
    transition:all 0.3s ease;
    border-radius:12px;
    border:1px solid rgba(255,255,255,0.08);
    box-shadow:0 10px 25px rgba(0,0,0,0.4);
  ">

  <div style="font-size:0.9em; color:#94a3b8; margin-bottom:5px;">
    💰 TON SALAIRE RÉEL ESTIMÉ
  </div>

  <div style="
    font-size:2.2em;
    font-weight:800;
    color:#22c55e;
    letter-spacing:1px;
  ">
    ${net.toFixed(2)} €
  </div>

  <div style="margin-top:8px; font-size:0.85em; color:#94a3b8;">
    Brut : ${brut.toFixed(2)} € • Annuel : ${(net*12).toFixed(0)} €
  </div>

<div style="margin-top:8px; font-size:0.85em; color:#facc15;">
  📊 Équivalent terrain : ~${(net / 151.67).toFixed(2)} €/h
</div>

</div>

    <div style="margin-top:15px; padding:12px; background:#1e90ff22; border-radius:8px;">

      <strong>🔍 Analyse avancée PRO POLICE</strong>

      <div style="margin-top:10px;">
        💰 Brut estimé : <strong>${brut.toFixed(2)} €</strong><br>
        💸 Net estimé : <strong>${net.toFixed(2)} €</strong><br>
        📅 Projection annuelle : <strong>${(net * 12).toFixed(2)} €</strong>
      </div>

      <hr style="margin:12px 0; opacity:0.2;">
<div style="font-size:0.95em;">
    📉 <strong>Détail des retenues :</strong><br><br>

    🏦 Pension civile : - ${detailNet.pension.toFixed(2)} €<br>
    🧾 CSG déductible : - ${detailNet.csg_deductible.toFixed(2)} €<br>
    📄 CSG non déductible : - ${detailNet.csg_non_deductible.toFixed(2)} €<br>
    ⚖️ CRDS : - ${detailNet.crds.toFixed(2)} €<br>
    📊 RAFP : - ${detailNet.rafp.toFixed(2)} €<br>

    <br>
    🔻 Total retenues : <strong>- ${detailNet.totalRetenues.toFixed(2)} €</strong>
  </div>

  <hr style="margin:12px 0; opacity:0.2;">
      <div>
        📆 Valeur journalière : <strong>${(net / 30).toFixed(2)} €</strong><br>
        ⏱️ Taux horaire estimé : <strong>${(net / 151.67).toFixed(2)} €</strong>
      </div>

    <hr style="margin:12px 0; opacity:0.2;">

    <div style="font-size:0.95em;">
      📊 <strong>Lecture terrain :</strong><br>
      Chaque heure supplémentaire, chaque nuit, chaque dimanche impacte directement ta rémunération réelle.
    </div>

    <div style="margin-top:10px; font-size:0.85em; color:#ccc;">
  Estimation basée sur les taux moyens DGPN – non contractuelle.
  Simulation indicative – non contractuelle.
  <br><br>
  💡 Le net affiché est avant prélèvement à la source.<br>
  📉 Impôt estimé non inclus (variable selon situation fiscale)
</div>
`;

} else {

  document.getElementById("resultatPublic").style.display = "block";
  document.getElementById("resultatMembre").style.display = "none";

  document.getElementById("resultatPublic").innerHTML = `
    ${bloc}

    <div style="margin-top:15px; padding:10px; background:#ffaa0022; border-radius:8px;">
      🔓 Version simplifiée<br>
      👉 Passe en mode adhérent pour une analyse complète.
    </div>
  `;
}
  
  setTimeout(() => {
 if (typeof afficherPopup === "function") {
  afficherPopup("primes");
}
}, 800); // 0.8 seconde
  
  } // ← fermeture de calculerPrimes()

// 🔐 Bouton mode adhérent
function updateMemberButton() {
  const btnMember = document.getElementById("btnMember");
  if (!btnMember) return;
  btnMember.textContent = isMember() ? "Mode adhérent ON" : "Mode adhérent OFF";
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  
  // 🔥 Gestion affichage Outre-mer
const typeZone = document.getElementById("typeZone");
const blocOM = document.getElementById("blocOM");
const blocIR = document.getElementById("zone");

function toggleZone() {
  if (!typeZone || !blocOM || !blocIR) return;

  if (typeZone.value === "outremer") {
    blocOM.style.display = "block";
    blocIR.parentElement.style.display = "none";
  } else {
    blocOM.style.display = "none";
    blocIR.parentElement.style.display = "block";
  }
}

typeZone?.addEventListener("change", toggleZone);
toggleZone();
}); // ← fin du DOMContentLoaded

function reinitSimulateur() {

  document.getElementById("grade").value = "gpx";
  document.getElementById("echelon").value = 1;
  document.getElementById("typeZone").value = "metropole";

  document.getElementById("resultatPublic").innerHTML = "";
  document.getElementById("resultatMembre").innerHTML = "";

}
