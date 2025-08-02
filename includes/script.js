document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.1 });

  function aplicarFadeAnimacao(container) {
    const fadeElements = container.querySelectorAll(".fade");
    fadeElements.forEach(el => {
      el.classList.remove("visible");
      observer.observe(el);
    });
  }

  function aplicarPaginacaoObras() {
    let paginaAtual = 1;
    const porPagina = 4;
    const obras = document.querySelectorAll(".obra-item");
    const spanPagina = document.getElementById("pagina-atual");
    const btnAnterior = document.querySelector("#pagination-controls button:first-child");
    const btnProximo = document.querySelector("#pagination-controls button:last-child");

    if (!obras.length || !spanPagina || !btnAnterior || !btnProximo) return;

    function mostrarPagina(pagina) {
      const totalPaginas = Math.ceil(obras.length / porPagina);
      if (pagina < 1) pagina = 1;
      if (pagina > totalPaginas) pagina = totalPaginas;

      obras.forEach((obra, index) => {
        obra.style.display = (index >= (pagina - 1) * porPagina && index < pagina * porPagina) ? "block" : "none";
      });

      spanPagina.innerText = pagina;
      paginaAtual = pagina;
    }

    btnAnterior.onclick = () => mostrarPagina(paginaAtual - 1);
    btnProximo.onclick = () => mostrarPagina(paginaAtual + 1);
    mostrarPagina(paginaAtual);
  }

  async function carregarFeedAgenciaBrasil() {
    try {
      const apiKey = "b32qtdupit07lqqfnhtuhlsjtfvm6wjmozxan23o";
      const rssUrl = "https://agenciabrasil.ebc.com.br/rss.xml";
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=${apiKey}&count=1`;

      const resp = await fetch(url);
      const data = await resp.json();

      if (!data.items || data.items.length === 0) {
        document.getElementById("rss-feed").innerHTML = "<p>Nenhuma notícia disponível no momento.</p>";
        return;
      }

      const item = data.items[0];
      const image = item.enclosure?.link || "";
      const html = `
        <div style="background: #111; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px #000;">
          ${image ? `<img src="${image}" alt="${item.title}" style="width: 100%; height: auto;">` : ""}
          <div style="padding: 1rem;">
            <p style="color: #888; font-size: 0.9rem; margin: 0 0 0.5rem;">Fonte: Agência Brasil</p>
            <h2 style="font-size: 1.25rem; margin: 0 0 0.5rem;">
              <a href="${item.link}" target="_blank" style="color: white; text-decoration: none;">${item.title}</a>
            </h2>
            <p style="color: #ccc; font-size: 0.95rem;">${item.description.substring(0, 140)}…</p>
          </div>
        </div>`;

      document.getElementById("rss-feed").innerHTML = html;
    } catch (err) {
      console.error("Erro ao carregar feed:", err);
      document.getElementById("rss-feed").innerHTML = "<p>Erro ao carregar notícias.</p>";
    }
  }

  function carregarPagina(caminho) {
    fetch(caminho)
      .then(resp => {
        if (!resp.ok) throw new Error("Erro ao carregar a página");
        return resp.text();
      })
      .then(html => {
        const container = document.getElementById("conteudo");
        container.innerHTML = html;

        aplicarFadeAnimacao(container);

        if (caminho.includes("obras.html")) {
          aplicarPaginacaoObras();
        }

        if (caminho.includes("noticias.html")) {
          carregarFeedAgenciaBrasil();
        }
      })
      .catch(erro => {
        document.getElementById("conteudo").innerHTML = "<p>Erro ao carregar conteúdo.</p>";
        console.error(erro);
      });
  }

  document.querySelectorAll("a[data-pagina]").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const pagina = this.getAttribute("data-pagina");
      carregarPagina(pagina);
    });
  });

  carregarPagina("paginas/home.html");
  aplicarFadeAnimacao(document);
});
