console.log("🎓 Université PRO POLICE chargée");

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("btnMember");

  if (!btn) return;

  function refreshMemberButton() {

    const isMember =
      localStorage.getItem("propolice_member") === "true";

    btn.textContent =
      isMember
        ? "Mode adhérent ON ✅"
        : "Mode adhérent OFF";

    btn.classList.toggle("active", isMember);
  }

  refreshMemberButton();

});
