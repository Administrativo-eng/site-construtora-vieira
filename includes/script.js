document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  function aplicarFadeAnimacao(container = document) {
    container.querySelectorAll(".fade").forEach(el => {
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
      pagina = Math.max(1, Math.min(pagina, totalPaginas));

      obras.forEach((obra, i) => {
        obra.style.display = (i >= (pagina - 1) * porPagina && i < pagina * porPagina) ? "block" : "none";
      });

      spanPagina.innerText = pagina;
      paginaAtual = pagina;
    }

    btnAnterior.onclick = () => mostrarPagina(paginaAtual - 1);
    btnProximo.onclick = () => mostrarPagina(paginaAtual + 1);
    mostrarPagina(paginaAtual);
  }

  async function carregarFeedAgenciaBrasil() {
    const feedEl = document.getElementById("rss-feed");
    if (!feedEl) return;

    try {
      const rssUrl = "https://agenciabrasil.ebc.com.br/rss.xml";
      const apiKey = "b32qtdupit07lqqfnhtuhlsjtfvm6wjmozxan23o";
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&api_key=${apiKey}&count=1`;

      const resp = await fetch(url);
      const data = await resp.json();
      const item = data.items?.[0];

      if (!item) {
        feedEl.innerHTML = "<p>Nenhuma notícia disponível no momento.</p>";
        return;
      }

      const image = item.enclosure?.link || "";
      feedEl.innerHTML = `
        <div style="background: #111; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px #000;">
          ${image ? `<img src="${image}" alt="${item.title}" style="width: 100%; height: auto;">` : ""}
          <div style="padding: 1rem;">
            <p style="color: #888; font-size: 0.9rem; margin: 0 0 0.5rem;">Fonte: Agência Brasil</p>
            <h2 style="font-size: 1.25rem; margin: 0 0 0.5rem;">
              <a href="${item.link}" target="_blank" style="color: white; text-decoration: none;">${item.title}</a>
            </h2>
            <p style="color: #ccc; font-size: 0.95rem;">${item.description.substring(0, 140)}…</p>
          </div>
        </div>
      `;
    } catch (err) {
      console.error("Erro ao carregar feed:", err);
      feedEl.innerHTML = "<p>Erro ao carregar notícias.</p>";
    }
  }

  function ativarSimuladorFinanciamento() {
    const form = document.getElementById("form-simulacao");
    if (!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();

      const vi = document.getElementById("valor-imovel");
      const ve = document.getElementById("valor-entrada");
      const j = document.getElementById("juros");
      const prazo = parseInt(document.getElementById("prazo").value);
      const sistema = document.getElementById("sistema").value;

      const valorImovel = parseFloat(vi.value.replace(/[^\d]+/g, "")) / 100;
      const entrada = parseFloat(ve.value.replace(/[^\d]+/g, "")) / 100;
      const jurosAno = parseFloat(j.value.replace(/[^\d,]+/g, "").replace(",", "."));
      const jurosMes = jurosAno / 100 / 12;
      const financiamento = valorImovel - entrada;

      const resultado = document.getElementById("resultado-simulacao");

      if (financiamento <= 0 || prazo <= 0 || jurosMes <= 0) {
        resultado.innerHTML = "<p style='color: red;'>Preencha os dados corretamente.</p>";
        return;
      }

      let texto = `🏠 *Simulação de Financiamento*\n\n`;
      texto += `• Valor do Imóvel: R$ ${valorImovel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
      texto += `• Entrada: R$ ${entrada.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
      texto += `• Prazo: ${prazo} meses\n`;
      texto += `• Juros: ${jurosAno.toFixed(2)}% ao ano\n`;
      texto += `• Sistema: ${sistema.toUpperCase()}\n`;

      if (sistema === "sac") {
        const amortizacao = financiamento / prazo;
        let saldo = financiamento;
        let total = 0, primeira = 0, ultima = 0;

        for (let i = 1; i <= prazo; i++) {
          const juros = saldo * jurosMes;
          const parcela = amortizacao + juros;
          saldo -= amortizacao;

          if (i === 1) primeira = parcela;
          if (i === prazo) ultima = parcela;

          total += parcela;
        }

        resultado.innerHTML = `
          <h2>Resultado (SAC)</h2>
          <p>Valor financiado: R$ ${financiamento.toLocaleString("pt-BR")}</p>
          <p>Parcela inicial: R$ ${primeira.toLocaleString("pt-BR")}</p>
          <p>Parcela final: R$ ${ultima.toLocaleString("pt-BR")}</p>
          <p>Total pago: R$ ${total.toLocaleString("pt-BR")}</p>
        `;

        texto += `• Parcela inicial: R$ ${primeira.toLocaleString("pt-BR")}\n`;
        texto += `• Parcela final: R$ ${ultima.toLocaleString("pt-BR")}\n`;
        texto += `• Total pago: R$ ${total.toLocaleString("pt-BR")}`;
      } else {
        const parcela = financiamento * (jurosMes / (1 - Math.pow(1 + jurosMes, -prazo)));
        const total = parcela * prazo;

        resultado.innerHTML = `
          <h2>Resultado (PRICE)</h2>
          <p>Valor financiado: R$ ${financiamento.toLocaleString("pt-BR")}</p>
          <p>Parcela fixa: R$ ${parcela.toLocaleString("pt-BR")}</p>
          <p>Total pago: R$ ${total.toLocaleString("pt-BR")}</p>
        `;

        texto += `• Parcela fixa: R$ ${parcela.toLocaleString("pt-BR")}\n`;
        texto += `• Total pago: R$ ${total.toLocaleString("pt-BR")}`;
      }

      let btn = document.getElementById("btn-whatsapp");
      if (!btn) {
        btn = document.createElement("a");
        btn.id = "btn-whatsapp";
        btn.className = "btn btn-black";
        btn.target = "_blank";
        btn.style.display = "inline-block";
        btn.style.marginTop = "2rem";
        btn.innerText = "Continuar pelo WhatsApp";
        resultado.after(btn);
      }

      btn.href = `https://wa.me/5566999366313?text=${encodeURIComponent("Olá! Fiz uma simulação no site e aqui estão os dados:\n\n" + texto)}`;
      btn.style.display = "inline-block";
    });
  }

  function aplicarMascaras() {
    const formatar = (input, tipo) => {
      input.addEventListener("input", e => {
        let val = e.target.value.replace(/\D/g, "");
        val = (val / 100).toFixed(2);
        val = val.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        e.target.value = tipo === "moeda" ? "R$ " + val : val + " %";
      });

      input.addEventListener("focus", () => {
        if (!input.value) input.value = tipo === "moeda" ? "R$ 0,00" : "0,00 %";
      });

      input.addEventListener("blur", () => {
        if (input.value === "R$ 0,00" || input.value === "0,00 %") input.value = "";
      });
    };

    const vi = document.getElementById("valor-imovel");
    const ve = document.getElementById("valor-entrada");
    const j = document.getElementById("juros");

    if (vi) formatar(vi, "moeda");
    if (ve) formatar(ve, "moeda");
    if (j) formatar(j, "porcentagem");
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
        if (caminho.includes("obras")) aplicarPaginacaoObras();
        if (caminho.includes("noticias")) carregarFeedAgenciaBrasil();
        if (caminho.includes("simulacao")) {
          ativarSimuladorFinanciamento();
          aplicarMascaras();
        }
        if (caminho.includes("trabalheconosco")) {
          const form = container.querySelector("form.formulario-trabalho");
          if (form) {
            form.addEventListener("submit", e => {
              e.preventDefault();
              const nome = container.querySelector("#nome")?.value.trim();
              const email = container.querySelector("#email")?.value.trim();
              const telefone = container.querySelector("#telefone")?.value.trim();
              const mensagem = container.querySelector("#mensagem")?.value.trim();
              let texto = `*Trabalhe Conosco - Novo Cadastro*\n\n*Nome:* ${nome}\n*Email:* ${email}\n*Telefone:* ${telefone}\n`;
              if (mensagem) texto += `*Mensagem:* ${mensagem}\n\n`;
              texto += `Por favor, envie seu currículo em PDF como anexo nesta conversa.`;

              alert("Você será redirecionado para o WhatsApp. Lembre-se de anexar seu currículo (PDF) na conversa.");
              window.open(`https://wa.me/5566999366313?text=${encodeURIComponent(texto)}`, "_blank");
            });
          }
        }



        if (caminho.includes("contato")) {
          const form = container.querySelector("form");
          if (form) {
            form.addEventListener("submit", e => {
              e.preventDefault();

              const nome = form.querySelector("#nome")?.value.trim();
              const email = form.querySelector("#email")?.value.trim();
              const telefone = form.querySelector("#telefone")?.value.trim();
              const mensagem = form.querySelector("#mensagem")?.value.trim();

              let texto = `📞 *Contato via site*\n\n`;
              texto += `*Nome:* ${nome}\n`;
              texto += `*Email:* ${email}\n`;
              texto += `*Telefone:* ${telefone}\n`;
              texto += `*Mensagem:* ${mensagem}`;

              const numero = "5566999366313"; // WhatsApp de destino
              const link = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

              window.open(link, "_blank");
            });
          }
        }




      })
      .catch(() => {
        document.getElementById("conteudo").innerHTML = "<p>Erro ao carregar conteúdo.</p>";
      });
  }

  document.querySelectorAll("a[data-pagina]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const pagina = link.getAttribute("data-pagina");
      carregarPagina(pagina);
    });
  });

  carregarPagina("paginas/home.html");
  aplicarFadeAnimacao();
});
