/* Construtora Vieira — JS mínimo: apenas Menu Mobile (sem SPA, sem metas/SEO) */
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu    = document.getElementById("nav-menu");
  if (!menuToggle || !navMenu) return;

  function setExpanded(isOpen){
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function toggleMenu(){
    const isOpen = navMenu.classList.toggle("open");
    setExpanded(isOpen);
  }

  // Abre/fecha o menu
  menuToggle.addEventListener("click", toggleMenu, false);

  // Fecha ao clicar em qualquer link dentro do menu
  navMenu.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    navMenu.classList.remove("open");
    setExpanded(false);
  }, false);

  // Fecha com a tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      navMenu.classList.remove("open");
      setExpanded(false);
    }
  }, false);

  // Garante estado fechado ao sair do breakpoint mobile
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navMenu.classList.remove("open");
      setExpanded(false);
    }
  }, { passive: true });
});
