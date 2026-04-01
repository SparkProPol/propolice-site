// PRO POLICE — scripts (filtrage ressources + UX)
const resources = [
  {
    id: "fiche-discipline-001",
    title: "Procédure disciplinaire : les 5 réflexes à avoir immédiatement",
    desc: "Une fiche simple, claire et utile pour éviter les erreurs les plus fréquentes dès les premiers échanges avec l’administration.",
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
    desc: "Principes, points d’attention, questions à poser à la hiérarchie.",
    tags: ["conges"],
    access: "public"
  },
  {
    id: "taj-001",
    title: "Note : TAJ (repères administratifs)",
    desc: "Comprendre les enjeux, demander l’accès, organiser un dossier.",
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
const year = $("#year");
const toast = $("#toast");
const planLabel = $("#planLabel");

if (year) {
  year.textContent = new Date().getFullYear();
}

function thumbSvg(seed) {
  const a = (seed.charCodeAt(0) * 13) % 360;
  const b = (seed.charCodeAt(seed.length - 1) * 17) % 360;
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="hsl(${a} 90% 55% / .22)"/>
        <stop offset="1" stop-color="hsl(${b} 90% 55% / .10)"/>
      </linearGradient>
      <radialGradient id="r" cx="30%" cy="20%" r="80%">
        <stop offset="0" stop-color="rgba(255,255,255,.18)"/>
        <stop offset="1" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="900" height="500" fill="url(#g)"/>
    <circle cx="260" cy="160" r="240" fill="url(#r)"/>
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

function render(list) {
  if (!grid) return;

  grid.innerHTML = "";
  if (!list.length) {
    grid.innerHTML = `<div class="card" style="grid-column:1/-1">
      <h3>Aucun résultat</h3>
      <p>Essaie un autre mot-clé ou remets le filtre sur “Tous”.</p>
    </div>`;
    return;
  }

  for (const r of list) {
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
        ${r.url ? `<a class="linkBtn" href="${r.url}">Ouvrir</a>` : `<button class="linkBtn" data-open="${r.id}">Ouvrir</button>`}
        <button class="linkBtn" data-copy="${r.id}">Copier l’ID</button>
      </div>
    `;
    renderPremiumLock(el, r);
    grid.appendChild(el);
  }
}

function applyFilters() {
  const q = (searchInput?.value || "").trim().toLowerCase();
  const tag = tagSelect?.value || "all";

  const filtered = resources.filter(r => {
    const matchText = !q || (r.title + " " + r.desc + " " + r.tags.join(" ")).toLowerCase().includes(q);
    const matchTag = tag === "all" || r.tags.includes(tag);
    return matchText && matchTag;
  });

  render(filtered);
}

if (searchInput) {
  searchInput.addEventListener("input", applyFilters);
}
if (tagSelect) {
  tagSelect.addEventListener("change", applyFilters);
}
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
      alert(`Démo : ouverture de la ressource "${openId}".\n\nTu pourras connecter ça à une page dédiée, un PDF, ou un espace membre.`);
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
  showToast._t = setTimeout(() => {
    toast.style.display = "none";
  }, 2800);
}

// Mobile menu
const menuBtn = document.getElementById("menuBtn");
const menuMobile = document.getElementById("menuMobile");
if (menuBtn && menuMobile) {
  menuBtn.addEventListener("click", () => {
    const expanded = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!expanded));
    menuMobile.style.display = expanded ? "none" : "block";
  });
}

// Pricing plan selection
let selectedPlan = "Adhérent";
document.querySelectorAll("[data-plan]").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedPlan = btn.getAttribute("data-plan");
    if (planLabel) {
      planLabel.innerHTML = `Plan choisi : <strong>${selectedPlan}</strong> (modifiable)`;
    }
    const adh = document.getElementById("adhesion");
    if (adh) {
      adh.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Form demo submit
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

// --- Blocs "Actualités" (liens officiels) ---
const actus = [
  {
    title: "Actu & agenda",
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

// ---------------- Dynamic content loading (Decap-ready) ----------------
async function getJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erreur chargement: ${path}`);
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
      resources.length = 0;
      loaded.forEach(item => resources.push(item));
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

// ---------------- Simulateur primes version enrichie ----------------
function getSalaireBase(grade, echelon) {
  const grilles = {
    gpx: [2100, 2140, 2180, 2220, 2260, 2300, 2340, 2380, 2420, 2460, 2500, 2540],
    bc: [2250, 2300, 2350, 2400, 2450, 2500, 2550, 2600, 2650, 2700, 2750, 2800],
    major: [2500, 2560, 2620, 2680, 2740, 2800, 2860, 2920, 2980, 3040, 3100, 3160]
  };

  const index = Math.max(1, Math.min(12, parseInt(echelon || 1, 10))) - 1;
  return grilles[grade]?.[index] || 2100;
}

function getITN(zone) {
  const table = {
    "1": 185,
    "2": 120,
    "3": 90
  };
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

function calculerPrimes() {
  const grade = document.getElementById("grade")?.value || "gpx";
  const echelon = document.getElementById("echelon")?.value || 1;
  const heuresNuit = parseFloat(document.getElementById("heuresNuit")?.value) || 0;
  const heuresDimanche = parseFloat(document.getElementById("heuresDimanche")?.value) || 0;
  const enfants = parseInt(document.getElementById("enfants")?.value || 0, 10);
  const zone = document.getElementById("zone")?.value || "3";

  const salaireBase = getSalaireBase(grade, echelon);
  const primeITN = getITN(zone);
  const majorationNuit = heuresNuit * 2.2;
  const majorationDimanche = heuresDimanche * 2.8;
  const sft = getSFT(enfants);

  const totalEstime = salaireBase + primeITN + majorationNuit + majorationDimanche + sft;

  const bloc = `
    <div style="display:grid; gap:10px;">
      <div class="row between"><span>Salaire de base estimé</span><strong>${salaireBase.toFixed(2)} €</strong></div>
      <div class="row between"><span>Prime ITN</span><strong>+ ${primeITN.toFixed(2)} €</strong></div>
      <div class="row between"><span>Majoration nuit</span><strong>+ ${majorationNuit.toFixed(2)} €</strong></div>
      <div class="row between"><span>Majoration dimanche</span><strong>+ ${majorationDimanche.toFixed(2)} €</strong></div>
      <div class="row between"><span>SFT ${enfants > 0 ? `(${enfants} enfant${enfants > 1 ? "s" : ""})` : ""}</span><strong>+ ${sft.toFixed(2)} €</strong></div>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,.12);margin:8px 0;">
      <div class="row between" style="font-size:1.15rem;">
        <strong>Total estimé</strong>
        <strong>${totalEstime.toFixed(2)} €</strong>
      </div>
      <div class="notice" style="margin-top:10px;">
        <strong>Note :</strong> estimation indicative à visée informative. Les règles exactes peuvent varier selon votre situation administrative, votre affectation et les textes applicables.
      </div>
    </div>
  `;

  const cible = document.getElementById("resultatPrimeDetail");
  if (cible) {
    cible.innerHTML = bloc;
  }
}

function reinitSimulateur() {
  const defaults = {
    grade: "gpx",
    echelon: 1,
    heuresNuit: 0,
    heuresDimanche: 0,
    enfants: 0,
    zone: "1"
  };

  Object.entries(defaults).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });

  const cible = document.getElementById("resultatPrimeDetail");
  if (cible) {
    cible.innerHTML = `<div class="smallmuted">Renseignez vos informations pour lancer le calcul.</div>`;
  }
}

// 🔐 Bouton mode adhérent
function updateMemberButton() {
  const btnMember = document.getElementById("btnMember");
  if (!btnMember) return;

  btnMember.textContent = isMember() ? "Mode adhérent ON" : "Mode adhérent OFF";
}

function toggleMemberMode() {
  if (isMember()) {
    localStorage.removeItem("propolice_member");
  } else {
    localStorage.setItem("propolice_member", "true");
  }

  updateMemberButton();
  location.reload();
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  updateMemberButton();
  renderActus();
  loadSiteSettings();
  loadResourcesFromJSON();
  loadArticlesCards();
});
