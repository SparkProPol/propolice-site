// PRO POLICE — scripts (filtrage ressources + UX)
const resources = [
  {
    id: "fiche-discipline-001",
    title: "Guide : procédure disciplinaire (repères)",
    desc: "Étapes, droits, points de vigilance, check-list documentaire.",
    tags: ["discipline", "juridique"],
    access: "public"
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

year.textContent = new Date().getFullYear();

function thumbSvg(seed){
  // Petit SVG “image” (local) pour éviter des dépendances externes
  const a = (seed.charCodeAt(0) * 13) % 360;
  const b = (seed.charCodeAt(seed.length-1) * 17) % 360;
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

function render(list){
  grid.innerHTML = "";
  if(!list.length){
    grid.innerHTML = `<div class="card" style="grid-column:1/-1">
      <h3>Aucun résultat</h3>
      <p>Essaie un autre mot-clé ou remets le filtre sur “Tous”.</p>
    </div>`;
    return;
  }

  for(const r of list){
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
        <button class="linkBtn" data-open="${r.id}">Ouvrir</button>
        <button class="linkBtn" data-copy="${r.id}">Copier l’ID</button>
      </div>
    `;
    grid.appendChild(el);
  }
}

function labelTag(t){
  const map = {
    discipline: "Discipline",
    carriere: "Carrière",
    mobilite: "Mobilité",
    conges: "Congés",
    juridique: "Juridique"
  };
  return map[t] || t;
}

function applyFilters(){
  const q = (searchInput.value || "").trim().toLowerCase();
  const tag = tagSelect.value;

  const filtered = resources.filter(r => {
    const matchText = !q || (r.title + " " + r.desc + " " + r.tags.join(" ")).toLowerCase().includes(q);
    const matchTag = (tag === "all") || r.tags.includes(tag);
    return matchText && matchTag;
  });

  render(filtered);
}

searchInput.addEventListener("input", applyFilters);
tagSelect.addEventListener("change", applyFilters);
resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  tagSelect.value = "all";
  applyFilters();
});

grid.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if(!btn) return;

  const openId = btn.getAttribute("data-open");
  const copyId = btn.getAttribute("data-copy");

  if(openId){
    alert(`Démo : ouverture de la ressource "${openId}".\n\nTu pourras connecter ça à une page dédiée, un PDF, ou un espace membre.`);
  }
  if(copyId){
    await navigator.clipboard.writeText(copyId);
    showToast("ID copié dans le presse-papiers ✅");
  }
});

function showToast(msg){
  toast.textContent = msg;
  toast.style.display = "block";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.style.display = "none", 2800);
}

// Mobile menu
const menuBtn = document.getElementById("menuBtn");
const menuMobile = document.getElementById("menuMobile");
menuBtn.addEventListener("click", () => {
  const expanded = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-expanded", String(!expanded));
  menuMobile.style.display = expanded ? "none" : "block";
});

// Pricing plan selection
let selectedPlan = "Adhérent";
document.querySelectorAll("[data-plan]").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedPlan = btn.getAttribute("data-plan");
    planLabel.innerHTML = `Plan choisi : <strong>${selectedPlan}</strong> (modifiable)`;
    document.getElementById("adhesion").scrollIntoView({behavior:"smooth"});
  });
});

// Form demo submit
document.getElementById("adhForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  payload.plan = selectedPlan;

  // Démo : stockage local
  const key = "propolice_adhesion_demo";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push({ ...payload, ts: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(existing));

  e.target.reset();
  showToast("Demande enregistrée (démo locale) ✅ — à connecter à un email/CRM.");
});

applyFilters();


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

function renderActus(){
  const g = document.getElementById("actuGrid");
  if(!g) return;

  g.innerHTML = "";
  for(const a of actus){
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
renderActus();
