console.log("🎥 Module vidéos chargé");

document.addEventListener("DOMContentLoaded", () => {

  chargerVideos();

});

function chargerVideos() {

  const container =
    document.getElementById(
      "videosContainer"
    );

  if (!container) return;

  container.innerHTML = `

  <div class="grid2">

    <div class="card">

      <h3>📺 PRO POLICE TV</h3>

      <p>

      Retrouvez l'ensemble des vidéos,
      interviews et communications
      syndicales sur notre chaîne officielle.

      </p>

      <a
      class="btn primary"
      target="_blank"
      href="https://www.youtube.com/@propolice6996">

      ▶ Voir la chaîne

      </a>

    </div>

    <div class="card">

      <h3>🚔 Actualités syndicales</h3>

      <p>

      Revendications,
      interventions,
      élections professionnelles,
      dossiers statutaires.

      </p>

      <a
      class="btn ghost"
      target="_blank"
      href="https://www.youtube.com/@propolice6996">

      Accéder aux vidéos

      </a>

    </div>

  </div>

  `;

}
