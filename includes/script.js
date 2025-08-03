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

        if (caminho.includes("obras.html")) aplicarPaginacaoObras();
        if (caminho.includes("noticias.html")) carregarFeedAgenciaBrasil();
        if (caminho.includes("simulacao.html")) {
          ativarSimuladorFinanciamento();
          aplicarMascaras();
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

  function ativarSimuladorFinanciamento() {
    const form = document.getElementById("form-simulacao");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const vi = document.getElementById("valor-imovel");
      const ve = document.getElementById("valor-entrada");
      const j = document.getElementById("juros");

      const valorImovel = parseFloat(vi.value.replace(/[^\d]+/g, "")) / 100;
      const entrada = parseFloat(ve.value.replace(/[^\d]+/g, "")) / 100;
      const prazo = parseInt(document.getElementById("prazo").value);
      const jurosAno = parseFloat(j.value.replace(/[^\d,]+/g, "").replace(",", "."));
      const sistema = document.getElementById("sistema").value;

      const financiamento = valorImovel - entrada;
      const jurosMes = jurosAno / 100 / 12;
      const resultadoDiv = document.getElementById("resultado-simulacao");

      if (financiamento <= 0 || prazo <= 0 || jurosMes <= 0) {
        resultadoDiv.innerHTML = "<p style='color: red;'>Preencha os dados corretamente.</p>";
        return;
      }

      let mensagem = `🏠 *Simulação de Financiamento*\n\n`;
      mensagem += `• Valor do Imóvel: R$ ${valorImovel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
      mensagem += `• Entrada: R$ ${entrada.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
      mensagem += `• Prazo: ${prazo} meses\n`;
      mensagem += `• Juros: ${jurosAno.toFixed(2)}% ao ano\n`;
      mensagem += `• Sistema: ${sistema.toUpperCase()}\n`;

      if (sistema === "sac") {
        let amortizacao = financiamento / prazo;
        let saldo = financiamento;
        let totalPago = 0;
        let primeiraParcela = 0;
        let ultimaParcela = 0;

        for (let i = 1; i <= prazo; i++) {
          const juros = saldo * jurosMes;
          const parcela = amortizacao + juros;
          saldo -= amortizacao;

          if (i === 1) primeiraParcela = parcela;
          if (i === prazo) ultimaParcela = parcela;

          totalPago += parcela;
        }

        resultadoDiv.innerHTML = `
          <h2>Resultado (SAC)</h2>
          <p>Valor financiado: R$ ${financiamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p>Parcela inicial: R$ ${primeiraParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p>Parcela final: R$ ${ultimaParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p>Total pago: R$ ${totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        `;

        mensagem += `• Parcela inicial: R$ ${primeiraParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
        mensagem += `• Parcela final: R$ ${ultimaParcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
        mensagem += `• Total pago: R$ ${totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
      } else if (sistema === "price") {
        const parcela = financiamento * (jurosMes / (1 - Math.pow(1 + jurosMes, -prazo)));
        const totalPago = parcela * prazo;

        resultadoDiv.innerHTML = `
          <h2>Resultado (PRICE)</h2>
          <p>Valor financiado: R$ ${financiamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p>Parcela fixa: R$ ${parcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <p>Total pago: R$ ${totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        `;

        mensagem += `• Parcela fixa: R$ ${parcela.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n`;
        mensagem += `• Total pago: R$ ${totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
      } else {
        resultadoDiv.innerHTML = "<p style='color: red;'>Sistema de amortização inválido.</p>";
        return;
      }

      const numero = "5566999999999"; // Altere para seu número com DDD
      const link = `https://wa.me/${numero}?text=${encodeURIComponent("Olá! Fiz uma simulação no site e aqui estão os dados:\n\n" + mensagem)}`;

      let botao = document.getElementById("btn-whatsapp");
      if (!botao) {
        botao = document.createElement("a");
        botao.id = "btn-whatsapp";
        botao.className = "btn-black";
        botao.target = "_blank";
        botao.style.display = "inline-block";
        botao.style.marginTop = "2rem";
        botao.innerText = "Continuar pelo WhatsApp";
        resultadoDiv.after(botao);
      }

      botao.href = link;
      botao.style.display = "inline-block";
    });
  }

  function aplicarMascaras() {
    const vi = document.getElementById("valor-imovel");
    const ve = document.getElementById("valor-entrada");
    const ju = document.getElementById("juros");

    function formatarMoeda(input) {
      input.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        valor = (valor / 100).toFixed(2);
        valor = valor.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        e.target.value = "R$ " + valor;
      });

      input.addEventListener("focus", () => {
        if (!input.value) input.value = "R$ 0,00";
      });

      input.addEventListener("blur", () => {
        if (input.value === "R$ 0,00") input.value = "";
      });
    }

    function formatarPorcentagem(input) {
      input.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        valor = (valor / 100).toFixed(2);
        valor = valor.replace(".", ",");
        e.target.value = valor + " %";
      });

      input.addEventListener("focus", () => {
        if (!input.value) input.value = "0,00 %";
      });

      input.addEventListener("blur", () => {
        if (input.value === "0,00 %") input.value = "";
      });
    }

    if (vi) formatarMoeda(vi);
    if (ve) formatarMoeda(ve);
    if (ju) formatarPorcentagem(ju);
  }
});
