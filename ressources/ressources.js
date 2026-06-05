document.addEventListener("DOMContentLoaded", async () => {

  const grid = document.getElementById("articlesGrid");
  const searchInput = document.getElementById("searchInput");
  const filterTheme = document.getElementById("filterTheme");

  let fiches = [];

  // ==========================
  // Chargement JSON
  // ==========================
  async function chargerFiches() {

    try {

      const response = await fetch("ressources.json");

      if (!response.ok) {
        throw new Error("Erreur JSON");
      }

      const data = await response.json();

      fiches = data.fiches || [];

      renderArticles();

    } catch (err) {

      console.error("Erreur chargement ressources :", err);

      grid.innerHTML = `
        <div class="card">
          <h3>⚠️ Erreur</h3>
          <p>Impossible de charger la base documentaire.</p>
        </div>
      `;

    }
  }

  // ==========================
  // Affichage
  // ==========================
  window.renderArticles = function () {

    const recherche =
      (searchInput?.value || "").toLowerCase();

    const theme =
      filterTheme?.value || "";

    const resultat = fiches.filter(fiche => {

      const okRecherche =

        fiche.titre.toLowerCase().includes(recherche)

        ||

        fiche.description.toLowerCase().includes(recherche);

      const okTheme =

        !theme ||

        fiche.theme === theme;

      return okRecherche && okTheme;
    });

    if (resultat.length === 0) {

      grid.innerHTML = `
        <div class="card">
          <h3>🔍 Aucun résultat</h3>
          <p>Aucune fiche ne correspond à votre recherche.</p>
        </div>
      `;

      return;
    }

    grid.innerHTML = resultat.map(fiche => `

      <article class="card">

        <div class="kicker">
          ${fiche.theme}
        </div>

        <h3>
          ${fiche.acces === "adherent" ? "🔒 " : ""}
          ${fiche.titre}
        </h3>

        <p>
          ${fiche.description}
        </p>

        <div style="margin-top:15px;">

          <a
            class="btn small primary"
            href="${fiche.url}">

            Consulter

          </a>

        </div>

      </article>

    `).join("");

  };

  // ==========================
  // Recherche
  // ==========================
  searchInput?.addEventListener(
    "input",
    renderArticles
  );

  // ==========================
  // Filtre thème
  // ==========================
  filterTheme?.addEventListener(
    "change",
    renderArticles
  );

  // ==========================
  // Initialisation
  // ==========================
  chargerFiches();

});
