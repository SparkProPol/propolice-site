

	// ===== ACCÈS BDD PAR CORPS =====
function getBDD(corps) {
  switch(corps) {
    case "CEA": return typeof BDD_CEA !== "undefined" ? BDD_CEA : null;
    case "CRS": return typeof BDD_CRS !== "undefined" ? BDD_CRS : null;
    case "ADMIN": return typeof BDD_ADMIN !== "undefined" ? BDD_ADMIN : null;
    case "PTS": return typeof BDD_PTS !== "undefined" ? BDD_PTS : null;
    case "RETRAITE": return typeof BDD_RETRAITE !== "undefined" ? BDD_RETRAITE : null;
    case "ADJOINTS": return typeof BDD_ADJOINTS !== "undefined" ? BDD_ADJOINTS : null;
    case "RESERVISTES": return typeof BDD_RESERVISTES !== "undefined" ? BDD_RESERVISTES : null;
    default: return null;
  }
}

console.log("🚔 INITIALISATION PRO POLICE");

if (typeof BDD_CEA === "undefined") {
  console.warn("⚠️ BDD_CEA non chargée");
}

// PRO POLICE — scripts (filtrage ressources + UX)
const ressources = [
  {
    id: "fiche-discipline-001",
    title: "Procédure disciplinaire : les 5 réflexes à avoir immédiatement",
    desc: "Une fiche simple, claire et utile pour éviter les erreurs les plus fréquentes dès les premiers échanges avec l'administration.",
    tags: ["discipline", "juridique"],
    access: "public",
    url: "fiche-discipline.html"
  },
  {
    id: "modele-courrier-001",
    title: "Modèle : demande de communication de pièces",
    desc: "Demande structurée et courtoise pour obtenir des documents RH/administratifs.",
    tags: ["juridique", "carriere"],
    access: "membre"
  },
  {
    id: "fiche-mutation-001",
    title: "Fiche : mobilité & mutation (méthode)",
    desc: "Anticiper, constituer le dossier, chronologie et erreurs fréquentes.",
    tags: ["mobilite", "carriere"],
    access: "public"
  },
  {
    id: "fiche-conges-001",
    title: "Fiche : congés (cadre général)",
    desc: "Principes, points d'attention, questions à poser à la hiérarchie.",
    tags: ["conges"],
    access: "public"
  },
  {
    id: "taj-001",
    title: "Note : TAJ (repères administratifs)",
    desc: "Comprendre les enjeux, demander l'accès, organiser un dossier.",
    tags: ["juridique"],
    access: "membre"
  },
  {
    id: "carriere-001",
    title: "Synthèse : avancement & trajectoire",
    desc: "Stratégie de dossier, arguments factuels, communication professionnelle.",
    tags: ["carriere"],
    access: "public"
  }
];

const $ = (sel) => document.querySelector(sel);
const grid = $("#resourceGrid");
const searchInput = $("#searchInput");
const tagSelect = $("#tagSelect");
const resetBtn = $("#resetBtn");
const yearEl = $("#year");
const toast = $("#toast");
const planLabel = $("#planLabel");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

function thumbSvg(seed) {
  const a = (seed.charCodeAt(0) * 13) % 360;
  const b = (seed.charCodeAt(seed.length - 1) * 17) % 360;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g${seed.replace(/[^a-z0-9]/gi,'')}" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="hsl(${a} 90% 55% / .22)"/>
        <stop offset="1" stop-color="hsl(${b} 90% 55% / .10)"/>
      </linearGradient>
      <radialGradient id="r${seed.replace(/[^a-z0-9]/gi,'')}" cx="30%" cy="20%" r="80%">
        <stop offset="0" stop-color="rgba(255,255,255,.18)"/>
        <stop offset="1" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="900" height="500" fill="url(#g${seed.replace(/[^a-z0-9]/gi,'')})"/>
    <circle cx="260" cy="160" r="240" fill="url(#r${seed.replace(/[^a-z0-9]/gi,'')})"/>
    <path d="M-20 390 C 220 310, 420 520, 920 360 L 920 520 L -20 520 Z" fill="rgba(255,255,255,.06)"/>
    <g fill="rgba(255,255,255,.85)" font-family="Inter, system-ui" font-weight="700">
      <text x="44" y="86" font-size="28">Université PRO POLICE</text>
      <text x="44" y="125" font-size="18" fill="rgba(255,255,255,.65)">Ressource • ${seed}</text>
    </g>
  </svg>`;
}

function labelTag(t) {
  const map = {
    discipline: "Discipline",
    carriere: "Carrière",
    mobilite: "Mobilité",
    conges: "Congés",
    juridique: "Juridique"
  };
  return map[t] || t;
}

// 🔒 Gestion contenu premium
function isMember() {
  return localStorage.getItem("propolice_member") === "true";
}

function renderPremiumLock(el, r) {
  if (r.access === "membre" && !isMember()) {
    el.classList.add("locked");
    const lock = document.createElement("div");
    lock.className = "lockOverlay";
    lock.innerHTML = `
      <div class="lockContent">
        <p>🔒 Contenu réservé aux adhérents</p>
        <a href="#adhesion" class="btn small primary">Débloquer</a>
      </div>
    `;
    el.appendChild(lock);
  }
}

function render(liste) {
  if (!grid) return;
  grid.innerHTML = "";
  if (!liste.length) {
    grid.innerHTML = `<div class="card" style="grid-column:1/-1"><h3>Aucun résultat</h3><p>Essaie un autre mot-clé ou remets le filtre sur "Tous".</p></div>`;
    return;
  }
  for (const r of liste) {
    const locked = r.access === "membre" && !isMember();
    const actionButton = locked
  ? `
    <div class="lockContent">
      <p>🔒 Contenu réservé aux adhérents</p>
      <a href="#adhesion" class="btn small primary" onclick="fermerPopup()">
        Débloquer
      </a>
    </div>
  `
  : (r.url
      ? `<a class="linkBtn" href="${r.url}" target="_blank">Ouvrir</a>`
      : `<button class="linkBtn" data-open="${r.id}">Ouvrir</button>`);

    const el = document.createElement("article");
    el.className = "card resource";
    el.innerHTML = `
      <div class="thumb" aria-hidden="true">${thumbSvg(r.id)}</div>
      <h3>${r.title}</h3>
      <p>${r.desc}</p>
      <div class="tags">
        ${r.tags.map(t => `<span class="tag">${labelTag(t)}</span>`).join("")}
        <span class="tag">${r.access === "membre" ? "Accès membre" : "Accès public"}</span>
      </div>
      <div class="actions">
        ${actionButton}
        <button class="linkBtn" data-copy="${r.id}">Copier l'ID</button>
      </div>
    `;
    renderPremiumLock(el, r);
    grid.appendChild(el);
  }
}

function applyFilters() {
  const q = (searchInput?.value || "").trim().toLowerCase();
  const tag = tagSelect?.value || "all";
  const filtered = ressources.filter(r => {
    const matchText = !q || (r.title + " " + r.desc + " " + r.tags.join(" ")).toLowerCase().includes(q);
    const matchTag = tag === "all" || r.tags.includes(tag);
    return matchText && matchTag;
  });
  render(filtered);
}

if (searchInput) searchInput.addEventListener("input", applyFilters);
if (tagSelect) tagSelect.addEventListener("change", applyFilters);
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (tagSelect) tagSelect.value = "all";
    applyFilters();
  });
}

if (grid) {
  grid.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const openId = btn.getAttribute("data-open");
    const copyId = btn.getAttribute("data-copy");
    if (openId) {
      const found = ressources.find(r => r.id === openId);
      if (found?.access === "membre" && !isMember()) {
        const adh = document.getElementById("adhesion");
        if (adh) adh.scrollIntoView({ behavior: "smooth" });
        return;
      }
      alert(`Démo : ouverture de la ressource "${openId}".`);
    }
    if (copyId) {
      await navigator.clipboard.writeText(copyId);
      showToast("ID copié dans le presse-papiers ✅");
    }
  });
}

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { toast.style.display = "none"; }, 2800);
}

// Menu mobile
const menuBtn = document.getElementById("menuBtn");
const menuMobile = document.getElementById("menuMobile");
if (menuBtn && menuMobile) {
  menuBtn.addEventListener("click", () => {
    const expanded = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!expanded));
    menuMobile.style.display = expanded ? "none" : "block";
  });
}

// Sélection du forfait tarifaire
let selectedPlan = "Adhérent";
document.querySelectorAll("[data-plan]").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedPlan = btn.getAttribute("data-plan");
    if (planLabel) {
      planLabel.innerHTML = `Plan choisi : <strong>${selectedPlan}</strong> (modifiable)`;
    }
    const adh = document.getElementById("adhesion");
    if (adh) adh.scrollIntoView({ behavior: "smooth" });
  });
});

// Soumission formulaire démo
const adhForm = document.getElementById("adhForm");
if (adhForm) {
  adhForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(adhForm);
    const payload = Object.fromEntries(fd.entries());
    payload.plan = selectedPlan;
    const key = "propolice_adhesion_demo";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push({ ...payload, ts: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing));
    adhForm.reset();
    showToast("Demande enregistrée (démo locale) ✅ — à connecter à un email/CRM.");
  });
}

// --- Blocs "Actualités" ---
const actus = [
  {
    title: "Actu et agenda",
    desc: "Historique, annonces, rubriques officielles.",
    url: "https://propolice.fr/index.php/accueil/actu-et-agenda"
  },
  {
    title: "Nos articles",
    desc: "Tracts, communiqués, articles.",
    url: "https://www.propolice.fr/index.php/accueil/actu-et-agenda/article-category-blog-2"
  },
  {
    title: "Nos vidéos",
    desc: "Sélection de vidéos PRO POLICE.",
    url: "https://www.propolice.fr/index.php/accueil/actu-et-agenda/nos-videos"
  }
];

function renderActus() {
  const g = document.getElementById("actuGrid");
  if (!g) return;
  g.innerHTML = "";
  for (const a of actus) {
    const el = document.createElement("article");
    el.className = "card resource";
    el.innerHTML = `
      <div class="thumb" aria-hidden="true">${thumbSvg(a.title)}</div>
      <h3>${a.title}</h3>
      <p>${a.desc}</p>
      <div class="actions">
        <a class="linkBtn" href="${a.url}" target="_blank" rel="noopener">Ouvrir</a>
      </div>
    `;
    g.appendChild(el);
  }
}

// ---------------- Chargement dynamique JSON ----------------
async function getJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erreur chargement : ${path}`);
  return await res.json();
}

function normalizeListData(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

async function loadSiteSettings() {
  try {
    const site = await getJSON("content/data/site.json");
    document.title = `${site.brand.name} — Syndicat • Université PRO POLICE`;
    document.querySelectorAll(".brandname").forEach(el => el.textContent = site.brand.name || el.textContent);
    document.querySelectorAll(".brandsub").forEach((el, i) => {
      if (i < 2) el.textContent = site.brand.subtitle || el.textContent;
    });
    const badge = document.querySelector(".badge");
    if (badge) badge.textContent = site.brand.hero_badge || badge.textContent;
    const h1 = document.querySelector(".heroLeft h1");
    if (h1) h1.textContent = site.brand.tagline || h1.textContent;
    const lead = document.querySelector(".lead");
    if (lead) lead.textContent = site.brand.hero_lead || lead.textContent;
    const ctas = document.querySelectorAll(".ctaRow .btn");
    if (ctas[0]) ctas[0].textContent = site.brand.cta_primary || ctas[0].textContent;
    if (ctas[1]) ctas[1].textContent = site.brand.cta_secondary || ctas[1].textContent;
    const metaCards = document.querySelectorAll(".metaCard");
    (site.homepage?.meta_cards || []).forEach((card, i) => {
      if (metaCards[i]) {
        const t = metaCards[i].querySelector(".metaTitle");
        const d = metaCards[i].querySelector(".metaText");
        if (t) t.textContent = card.title || "";
        if (d) d.textContent = card.text || "";
      }
    });
    const adhTitle = document.querySelector("#adhesion .sectionHead h2");
    if (adhTitle) adhTitle.textContent = site.adhesion?.title || adhTitle.textContent;
    const adhIntro = document.querySelector("#adhesion .sectionHead p");
    if (adhIntro) adhIntro.textContent = site.adhesion?.intro || adhIntro.textContent;
  } catch (err) {
    console.warn(err);
  }
}

async function loadResourcesFromJSON() {
  try {
    const loaded = normalizeListData(await getJSON("content/data/resources.json"));
    if (loaded.length) {
      ressources.length = 0;
      loaded.forEach(item => ressources.push(item));
      applyFilters();
    } else {
      applyFilters();
    }
  } catch (err) {
    console.warn(err);
    applyFilters();
  }
}

async function loadArticlesCards() {
  try {
    const items = normalizeListData(await getJSON("content/data/articles.json")).filter(x => x.published !== false);
    const articlesGrid = document.getElementById("articlesGrid");
    if (!articlesGrid) return;
    if (articlesGrid.children.length > 0) return;
    articlesGrid.innerHTML = "";
    if (!items.length) {
      articlesGrid.innerHTML = `<div class="card" style="grid-column:1/-1"><h3>Aucune publication</h3><p>Ajoute des cartes depuis l'administration.</p></div>`;
      return;
    }
    for (const a of items) {
      const el = document.createElement("article");
      el.className = "card resource";
      el.innerHTML = `
        <div class="thumb" aria-hidden="true">${thumbSvg(a.title || "Article")}</div>
        <h3>${a.title || ""}</h3>
        <p>${a.excerpt || ""}</p>
        <div class="tags">
          <span class="tag">${a.category || "Publication"}</span>
        </div>
        <div class="actions">
          <a class="linkBtn" href="${a.url || "#"}" target="${(a.url || "").startsWith("http") ? "_blank" : "_self"}" rel="noopener">Ouvrir</a>
        </div>
      `;
      articlesGrid.appendChild(el);
    }
  } catch (err) {
    console.warn(err);
  }
}

function afficherPopup(type = "global") {

  const isUserMember = isMember(); // on utilise ta fonction existante
  const popupSeen = sessionStorage.getItem("popup_" + type);

  if (!isUserMember && !popupSeen) {
    const popup = document.getElementById("popupAdherent");
    if (popup) {
      popup.style.display = "flex";
      sessionStorage.setItem("popup_" + type, "true");
    }
  }
}

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

    const label = document.getElementById("zoneOM")?.selectedOptions?.[0]?.text || "";

if (label.includes("Polynésie")) {

  ratioNet = 1.00; // 🔥 correction Polynésie (net ≈ brut)

} 
else if (zoneOM >= 0.70) {

  ratioNet = 0.98;

}
    const label = document.getElementById("zoneOM")?.selectedOptions?.[0]?.text || "";

if (label.includes("Polynésie")) {

  ratioNet = 1.00;

} 
else if (label.includes("Mayotte")) {

  ratioNet = 0.73; // 🔥 calibrage réel terrain

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
const salaireBase = getBrutBase(corps, gradeBDD, echelon);
  // 🌍 Majoration Outre-mer
const majorationOM = (typeZone === "outremer") ? salaireBase * zoneOM : 0;
  const primeITN = itnChoix === "oui" ? (getITN(zone) || 0) : 0;
  const majorationNuit = heuresNuit * 2.2;
  const majorationDimanche = heuresDimanche * 2.8;
  const sft = getSFT(enfants);
  const primeVP = document.getElementById("primeVP")?.value || "non";
  const montantVP = primeVP === "oui" ? 100 : 0;
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
  montantVP;
	// 🔥 Correction spécifique Polynésie
let totalCorrige = totalEstime;

if (typeZone === "outremer") {

  const label = document.getElementById("zoneOM")?.selectedOptions?.[0]?.text || "";

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
<div class="row between"><span>ICSS CRS</span><strong>+ ${ICSS.toFixed(2)} €</strong></div>
` : ""}
    <div class="row between"><span>Prime ITN</span><strong>+ ${primeITN.toFixed(2)} €</strong></div>
    <div class="row between"><span>Prime voie publique (VP)</span><strong>+ ${montantVP.toFixed(2)} €</strong></div>
    <div class="row between"><span>Majoration nuit</span><strong>+ ${majorationNuit.toFixed(2)} €</strong></div>
    <div class="row between"><span>Majoration dimanche</span><strong>+ ${majorationDimanche.toFixed(2)} €</strong></div>
    <div class="row between"><span>SFT${enfants > 0 ? ` (${enfants} enfant${enfants > 1 ? "s" : ""})` : ""}</span><strong>+ ${sft.toFixed(2)} €</strong></div>
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

if (isMember()) {

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
  afficherPopup("primes");
}, 800); // 0.8 seconde
  
  } // ← fermeture de calculerPrimes()

function reinitSimulateur() {
  const defaults = { grade: "gpx", echelon: 1, heuresNuit: 0, heuresDimanche: 0, enfants: 0, zone: "1" };
  Object.entries(defaults).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
  const cible = document.getElementById("resultatPublic");
  if (cible) cible.innerHTML = `<div class="smallmuted">Renseignez vos informations pour lancer le calcul.</div>`;
}

// 🔐 Bouton mode adhérent
function updateMemberButton() {
  const btnMember = document.getElementById("btnMember");
  if (!btnMember) return;
  btnMember.textContent = isMember() ? "Mode adhérent ON" : "Mode adhérent OFF";
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  updateMemberButton();
  renderActus();
  loadSiteSettings();
  loadResourcesFromJSON();
  loadArticlesCards();
  applyFilters();
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
});

// ---------------- Simulateur CMO V2 ----------------
function parseHistoriqueCMO(value) {
  if (!value || !value.trim()) return 0;
  return value
    .split(",")
    .map(v => parseFloat(v.trim()))
    .filter(v => !isNaN(v) && v > 0)
    .reduce((acc, v) => acc + v, 0);
}

function calculerCMO() {

  const salaire = parseFloat(document.getElementById("cmoSalaire")?.value) || 0;
  const jours = parseFloat(document.getElementById("cmoJours")?.value) || 0;
  const deja = parseFloat(document.getElementById("cmoDeja")?.value) || 0;
  const historique = parseHistoriqueCMO(document.getElementById("cmoHistorique")?.value || "");
  const regime = document.getElementById("cmoRegime")?.value || "auto";
  const carence = document.getElementById("cmoCarence")?.value || "non";
  const mode = document.getElementById("cmoMode")?.value || "simple";

  const dejaTotal = deja + historique;
  const baseJour = salaire / 30;

  let joursPlein = 0, jours90 = 0, jours50 = 0;
  let retenuePlein = 0, retenue90 = 0, retenue50 = 0, retenueCarence = 0;

  if (regime === "plein") {
    joursPlein = jours;
  } else if (regime === "demi") {
    jours50 = jours;
    retenue50 = jours50 * baseJour * 0.5;
  } else {
    if (dejaTotal < 90) {
      jours90 = Math.min(jours, 90 - dejaTotal);
    }
    const totalApres = dejaTotal + jours;
    if (totalApres > 90) {
      jours50 = totalApres - Math.max(90, dejaTotal);
    }
    retenue90 = jours90 * baseJour * 0.10;
    retenue50 = jours50 * baseJour * 0.50;
  }

  if (carence === "oui" && jours > 0) retenueCarence = baseJour;

  const retenueTotale = retenue90 + retenue50 + retenueCarence;
  let maintien = salaire - retenueTotale;
  if (maintien < 0) maintien = 0;

  const bloc = `
    <div class="row between"><span>Jours à 90%</span><strong>${jours90}</strong></div>
    <div class="row between"><span>Jours à 50%</span><strong>${jours50}</strong></div>
    <div class="row between"><span>Retenue totale estimée</span><strong>- ${retenueTotale.toFixed(2)} €</strong></div>
    <div class="row between"><span>Montant maintenu</span><strong>${maintien.toFixed(2)} €</strong></div>
  `;

  const cible = document.getElementById("resultatCMO");
  if (!cible) return;

  // 🔐 MODE ADHERENT
  if (isMember()) {

    const journalier = baseJour;
    const projection = retenueTotale * 12;

    cible.innerHTML = `
      <div style="display:grid; gap:10px;">
        ${bloc}

        <div style="margin-top:15px; padding:12px; background:#1e90ff22; border-radius:8px;">

          <strong>🔍 Analyse avancée PRO POLICE</strong>

          <div style="margin-top:10px;">
            💰 Salaire journalier : <strong>${journalier.toFixed(2)} €</strong><br>
            📉 Perte estimée : <strong>${retenueTotale.toFixed(2)} €</strong><br>
            📅 Projection annuelle : <strong>${projection.toFixed(2)} €</strong>
          </div>

          <hr style="margin:12px 0; opacity:0.2;">

          <div style="font-size:0.95em;">
            ⚠️ <strong>Lecture terrain :</strong><br>
            Après 90 jours d’arrêt, ton traitement passe à 50%, ce qui impacte fortement ton revenu réel.
          </div>

          <div style="margin-top:10px; font-size:0.85em; color:#ccc;">
            Simulation indicative – non contractuelle – basée sur des moyennes.
          </div>

        </div>
      </div>
    `;

    } else {

    // 🔓 MODE PUBLIC
    cible.innerHTML = `
      <div style="display:grid; gap:10px;">
        ${bloc}

        <div style="margin-top:15px; padding:10px; background:#ffaa0022; border-radius:8px;">
          🔓 Version simplifiée<br>
          👉 Passe en mode adhérent pour une analyse complète.
        </div>
      </div>
    `;
  }

  // 👇 AJOUT ICI (TRÈS IMPORTANT)
  setTimeout(() => {
    afficherPopup("cmo");
  }, 800);

} // ← FIN DE calculerCMO()

function reinitCMO() {
  const defaults = {
    cmoSalaire: 2500, cmoJours: 1, cmoDeja: 0,
    cmoHistorique: "", cmoRegime: "auto",
    cmoCarence: "non", cmoMode: "simple"
  };
  Object.entries(defaults).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });
  const cible = document.getElementById("resultatCMO");
  if (cible) cible.innerHTML = `<div class="smallmuted">Renseignez vos informations pour lancer le calcul.</div>`;
}

function exportCMOPDF() {
  window.print();
}
window.addEventListener("DOMContentLoaded", () => {

  const gradeSelect = document.getElementById("grade");

  function updateAll() {
    updateEchelonMax();
    remplirEchelons();
  }

  // Initialisation
  updateAll();

  // Changement de grade
  gradeSelect?.addEventListener("change", updateAll);

});
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    fermerPopup();
  }
});
function fermerPopup() {
  const popup = document.getElementById("popupAdherent");
  if (popup) {
    popup.style.display = "none";
  }
}
// 🔥 VALEUR POINT INDICE (2026)
const VALEUR_POINT = 4.9228;

// 🔍 Récupérer indice selon corps / grade / échelon
function getIndice(corps, grade, echelon) {

  const bdd = (corps === "CRS") ? BDD_CRS : BDD_CEA;

  if (!bdd || !bdd[grade] || !bdd[grade][echelon]) {
    console.error("❌ Indice introuvable :", corps, grade, echelon);
    return 0;
  }

  return bdd[grade][echelon].IM;
}

// 💰 Calcul brut indiciaire réel
function getBrutBase(corps, grade, echelon) {
  const indice = getIndice(corps, grade, echelon);
  return indice * VALEUR_POINT;
}
