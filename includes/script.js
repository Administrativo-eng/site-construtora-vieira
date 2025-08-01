// script.js

document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  // Toggle do menu mobile
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
  }

  // Carrega conteúdo padrão (home)
  carregarPagina("paginas/home.html");

  // Substitui navegação por carregamento dinâmico
  document.querySelectorAll("a[data-pagina]").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const pagina = this.getAttribute("data-pagina");
      carregarPagina(pagina);
    });
  });

  // Efeito de fade-in ao carregar
  document.body.classList.add("fade-in");

  // Efeito de revelação ao rolar
  const fadeElements = document.querySelectorAll(".fade");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => observer.observe(el));
});

function carregarPagina(caminho) {
  fetch(caminho)
    .then(resp => {
      if (!resp.ok) throw new Error("Erro ao carregar a página");
      return resp.text();
    })
    .then(html => {
      const container = document.getElementById("conteudo");
      container.classList.remove("fade-in");
      container.classList.add("fade-out");

      setTimeout(() => {
        container.innerHTML = html;
        container.classList.remove("fade-out");
        container.classList.add("fade-in");
      }, 300);
    })
    .catch(erro => {
      document.getElementById("conteudo").innerHTML = "<p>Erro ao carregar conteúdo.</p>";
      console.error(erro);
    });
}
