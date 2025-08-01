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

  // Observador para elementos com classe .fade
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  // Função para aplicar animações a elementos .fade
  function aplicarFadeAnimacao(container) {
    const fadeElements = container.querySelectorAll(".fade");
    fadeElements.forEach(el => {
      el.classList.remove("visible");
      observer.observe(el);
    });
  }

  // Aplica no carregamento inicial
  aplicarFadeAnimacao(document);

});

function carregarPagina(caminho) {
  fetch(caminho)
    .then(resp => {
      if (!resp.ok) throw new Error("Erro ao carregar a página");
      return resp.text();
    })
    .then(html => {
      const container = document.getElementById("conteudo");
      container.innerHTML = html;

      // Aplica efeito .fade aos novos elementos
      const fadeElements = container.querySelectorAll(".fade");
      fadeElements.forEach(el => {
        el.classList.remove("visible");
        setTimeout(() => el.classList.add("visible"), 100);
      });
    })
    .catch(erro => {
      document.getElementById("conteudo").innerHTML = "<p>Erro ao carregar conteúdo.</p>";
      console.error(erro);
    });
}
