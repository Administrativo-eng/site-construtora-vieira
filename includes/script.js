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

  // Observador de elementos com .fade
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  // Função de animação para elementos .fade
  function aplicarFadeAnimacao(container) {
    const fadeElements = container.querySelectorAll(".fade");
    fadeElements.forEach(el => {
      el.classList.remove("visible");
      observer.observe(el);
    });
  }

  // Função para ativar a paginação (obras.html)
  function aplicarPaginacaoObras() {
    const cards = document.querySelectorAll("#cards-container .card");
    const loadMoreBtn = document.getElementById("load-more");
    const batchSize = 4;
    let visibleCount = 0;

    if (!cards.length || !loadMoreBtn) return;

    function showNextBatch() {
      for (let i = visibleCount; i < visibleCount + batchSize && i < cards.length; i++) {
        cards[i].style.display = "block";
      }

      visibleCount += batchSize;

      if (visibleCount >= cards.length) {
        loadMoreBtn.style.display = "none";
      }
    }

    // Inicializa
    cards.forEach(card => card.style.display = "none");
    showNextBatch();

    loadMoreBtn.addEventListener("click", showNextBatch);
  }

  // Carrega página via fetch
  function carregarPagina(caminho) {
    fetch(caminho)
      .then(resp => {
        if (!resp.ok) throw new Error("Erro ao carregar a página");
        return resp.text();
      })
      .then(html => {
        const container = document.getElementById("conteudo");
        container.innerHTML = html;

        // Aplica animações .fade
        aplicarFadeAnimacao(container);

        // Ativa lógica de paginação somente na página de obras
        if (caminho.includes("obras.html")) {
          aplicarPaginacaoObras();
        }
      })
      .catch(erro => {
        document.getElementById("conteudo").innerHTML = "<p>Erro ao carregar conteúdo.</p>";
        console.error(erro);
      });
  }

  // Aplica animações no documento inicial
  aplicarFadeAnimacao(document);
});
