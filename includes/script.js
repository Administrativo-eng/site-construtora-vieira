document.addEventListener("DOMContentLoaded", () => {
  // Configuração das rotas válidas
  const rotasValidas = {
    '': 'home',
    'home': 'home',
    'sobrenos': 'sobrenos',
    'servicos': 'servicos',
    'obras': 'obras',
    'empreendimentos': 'empreendimentos',
    'sustentabilidade': 'sustentabilidade',
    'noticias': 'noticias',
    'simulacao': 'simulacao',
    'trabalheconosco': 'trabalheconosco',
    'contato': 'contato'
  };

  // Configuração do menu mobile
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
  }

  // Observer para animações fade
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

  // Função para obter rota atual
  function obterRotaAtual() {
    const path = window.location.pathname.replace(/^\//, "").replace(/\/$/, "");
    return path;
  }

  // Função para validar rota
  function validarRota(rota) {
    return rotasValidas.hasOwnProperty(rota);
  }

  // Função para carregar página
  function carregarPagina(rota) {
    if (!validarRota(rota)) {
      rota = ''; // Fallback para home
    }

    const paginaReal = rotasValidas[rota];
    const caminhoArquivo = `paginas/${paginaReal}.html`;

    fetch(caminhoArquivo)
      .then(resp => {
        if (!resp.ok) throw new Error("Erro ao carregar a página");
        return resp.text();
      })
      .then(html => {
        const container = document.getElementById("conteudo");
        if (container) {
          container.innerHTML = html;
          
          // Atualizar meta tags
          atualizarMetas(rota);
          
          // Aplicar funcionalidades específicas da página
          aplicarFuncionalidadesPagina(rota, container);
          
          // Aplicar animações
          aplicarFadeAnimacao(container);
          
          // Atualizar menu ativo
          atualizarMenuAtivo(rota);
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar página:', error);
        const container = document.getElementById("conteudo");
        if (container) {
          container.innerHTML = "<p>Erro ao carregar conteúdo.</p>";
        }
      });
  }

  // Função para aplicar funcionalidades específicas de cada página
  function aplicarFuncionalidadesPagina(rota, container) {
    switch(rota) {
      case 'obras':
        inicializarCarrosselObras(container);
        inicializarCarrosselClientes(container);
        break;
      case 'empreendimentos':
        inicializarListagemEmpreendimentos(container);
        break;
      case 'noticias':
        carregarFeedAgenciaBrasil();
        break;
      case 'simulacao':
        ativarSimuladorFinanciamento();
        aplicarMascaras();
        break;
      case 'trabalheconosco':
        configurarFormularioTrabalho(container);
        break;
      case 'contato':
        configurarFormularioContato(container);
        break;
    }
  }

  // Função para atualizar menu ativo
  function atualizarMenuAtivo(rota) {
    document.querySelectorAll('nav a').forEach(link => {
      link.classList.remove('active');
    });
    
    const rotaMenu = rota === '' ? '/' : `/${rota}`;
    const linkAtivo = document.querySelector(`nav a[href="${rotaMenu}"]`);
    if (linkAtivo) {
      linkAtivo.classList.add('active');
    }
  }

  // Função para navegar
  function navegar(rota) {
    if (!validarRota(rota)) {
      rota = '';
    }
    
    const url = rota === '' ? '/' : `/${rota}`;
    history.pushState({ rota }, "", url);
    carregarPagina(rota);
  }

  // Event listeners para navegação
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="/"]');
    if (link && !link.hasAttribute('target') && !link.href.includes('whatsapp') && !link.href.includes('wa.me')) {
      e.preventDefault();
      const href = link.getAttribute('href');
      const rota = href.replace(/^\//, "").replace(/\/$/, "");
      navegar(rota);
    }
  });

  // Listener para botão voltar/avançar do navegador
  window.addEventListener("popstate", event => {
    const rota = event.state?.rota || obterRotaAtual();
    carregarPagina(rota);
  });

  // Inicialização
  const rotaInicial = obterRotaAtual();
  carregarPagina(rotaInicial);

  // Aplicar animações iniciais
  aplicarFadeAnimacao();

  // ===== FUNCIONALIDADES ESPECÍFICAS =====

  // Carrossel de Obras
  function inicializarCarrosselObras(container) {
    const obras = [
      {
        id: 1,
        titulo: "Escola Municipal Santos Dumont",
        imagem: "clientes/uniaofamiliar.png",
        tipo: "publica"
      },
      {
        id: 2,
        titulo: "Residencial Vila Verde",
        imagem: "clientes/uniaofamiliar.png",
        tipo: "privada"
      },
      {
        id: 3,
        titulo: "Galpão Industrial Metalúrgica",
        imagem: "clientes/uniaofamiliar.png",
        tipo: "privada"
      },
      {
        id: 4,
        titulo: "UBS Centro de Saúde",
        imagem: "clientes/uniaofamiliar.png",
        tipo: "publica"
      }
    ];

    const carrosselObras = container.querySelector('#carrossel-obras');
    if (carrosselObras) {
      let html = '<div class="carrossel-container"><div class="carrossel-track" id="track-obras">';
      
      obras.forEach(obra => {
        html += `
          <div class="carrossel-item" onclick="abrirDetalheObra(${obra.id})">
            <img src="${obra.imagem}" alt="${obra.titulo}">
            <div class="carrossel-info">
              <h3>${obra.titulo}</h3>
              <span class="tipo-obra ${obra.tipo}">${obra.tipo === 'publica' ? 'Pública' : 'Privada'}</span>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      html += `
        <button class="carrossel-btn prev" onclick="moverCarrossel('obras', -1)">‹</button>
        <button class="carrossel-btn next" onclick="moverCarrossel('obras', 1)">›</button>
      </div>`;
      
      carrosselObras.innerHTML = html;
    }
  }

  // Carrossel de Clientes
  function inicializarCarrosselClientes(container) {
    const clientes = [
      {
        id: 1,
        titulo: "União Familiar",
        imagem: "clientes/uniaofamiliar.png",
        link: "https://uniaofamiliar.com.br"
      },
      {
        id: 2,
        titulo: "Prefeitura Municipal",
        imagem: "clientes/uniaofamiliar.png",
        link: "#"
      },
      {
        id: 3,
        titulo: "Construtora Parceira",
        imagem: "clientes/uniaofamiliar.png",
        link: "#"
      },
      {
        id: 4,
        titulo: "Empresa Industrial",
        imagem: "clientes/uniaofamiliar.png",
        link: "#"
      }
    ];

    const carrosselClientes = container.querySelector('#carrossel-clientes');
    if (carrosselClientes) {
      let html = '<div class="carrossel-container"><div class="carrossel-track" id="track-clientes">';
      
      clientes.forEach(cliente => {
        html += `
          <div class="carrossel-item" onclick="abrirDetalheCliente(${cliente.id})">
            <img src="${cliente.imagem}" alt="${cliente.titulo}">
            <div class="carrossel-info">
              <h3>${cliente.titulo}</h3>
            </div>
          </div>
        `;
      });
      
      html += '</div>';
      html += `
        <button class="carrossel-btn prev" onclick="moverCarrossel('clientes', -1)">‹</button>
        <button class="carrossel-btn next" onclick="moverCarrossel('clientes', 1)">›</button>
      </div>`;
      
      carrosselClientes.innerHTML = html;
    }
  }

  // Listagem de Empreendimentos
  function inicializarListagemEmpreendimentos(container) {
    const empreendimentos = [
      {
        id: 1,
        titulo: "Edifício Meridian",
        imagem: "clientes/uniaofamiliar.png",
        descricao: "Residencial corporativo com design moderno",
        valor: "R$ 450.000",
        tipo: "venda",
        medidas: "120m²",
        endereco: "Rua das Flores, 123 - Centro"
      },
      {
        id: 2,
        titulo: "Vista Parque",
        imagem: "clientes/uniaofamiliar.png",
        descricao: "Conforto, segurança e natureza ao redor",
        valor: "R$ 2.500/mês",
        tipo: "aluguel",
        medidas: "85m²",
        endereco: "Av. Brasil, 456 - Jardim América"
      },
      {
        id: 3,
        titulo: "Plaza Central",
        imagem: "clientes/uniaofamiliar.png",
        descricao: "Empreendimento comercial completo",
        valor: "R$ 650.000",
        tipo: "venda",
        medidas: "200m²",
        endereco: "Rua Comercial, 789 - Centro"
      }
    ];

    const listaEmpreendimentos = container.querySelector('#lista-empreendimentos');
    if (listaEmpreendimentos) {
      let html = '';
      
      empreendimentos.forEach(emp => {
        html += `
          <div class="empreendimento-card" onclick="abrirDetalheEmpreendimento(${emp.id})">
            <img src="${emp.imagem}" alt="${emp.titulo}">
            <div class="empreendimento-info">
              <h3>${emp.titulo}</h3>
              <p>${emp.descricao}</p>
              <div class="empreendimento-detalhes">
                <span class="valor">${emp.valor}</span>
                <span class="tipo ${emp.tipo}">${emp.tipo === 'venda' ? 'Venda' : 'Aluguel'}</span>
                <span class="medidas">${emp.medidas}</span>
              </div>
              <p class="endereco">${emp.endereco}</p>
            </div>
          </div>
        `;
      });
      
      listaEmpreendimentos.innerHTML = html;
    }
  }

  // Funções auxiliares para carrossel
  window.moverCarrossel = function(tipo, direcao) {
    const track = document.getElementById(`track-${tipo}`);
    if (!track) return;
    
    const items = track.querySelectorAll('.carrossel-item');
    if (items.length === 0) return;
    
    const itemWidth = items[0].offsetWidth + 20; // 20px de gap
    const currentTransform = track.style.transform || 'translateX(0px)';
    const currentX = parseInt(currentTransform.match(/-?\d+/) || [0]);
    const maxScroll = -(itemWidth * (items.length - 3)); // Mostrar 3 items
    
    let newX = currentX + (direcao * itemWidth);
    newX = Math.max(maxScroll, Math.min(0, newX));
    
    track.style.transform = `translateX(${newX}px)`;
  };

  // Funções para abrir detalhes
  window.abrirDetalheObra = function(id) {
    window.location.href = `/obra/${id}`;
  };

  window.abrirDetalheCliente = function(id) {
    window.location.href = `/cliente/${id}`;
  };

  window.abrirDetalheEmpreendimento = function(id) {
    window.location.href = `/empreendimento/${id}`;
  };

  // Feed de notícias
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

  // Simulador de financiamento
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

      if (!vi || !ve || !j) return;

      const valorImovel = parseFloat(vi.value.replace(/[^\d]+/g, "")) / 100;
      const entrada = parseFloat(ve.value.replace(/[^\d]+/g, "")) / 100;
      const jurosAno = parseFloat(j.value.replace(/[^\d,]+/g, "").replace(",", "."));
      const jurosMes = jurosAno / 100 / 12;
      const financiamento = valorImovel - entrada;

      const resultado = document.getElementById("resultado-simulacao");
      if (!resultado) return;

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

  // Máscaras para formulários
  function aplicarMascaras() {
    const formatar = (input, tipo) => {
      if (!input) return;
      
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

  // Formulário de trabalho
  function configurarFormularioTrabalho(container) {
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

  // Formulário de contato
  function configurarFormularioContato(container) {
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

        const numero = "5566999366313";
        const link = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

        window.open(link, "_blank");
      });
    }
  }

  // Atualizar meta tags
  function atualizarMetas(rota) {
    const dados = {
      "": {
        title: "Construtora Vieira - Obras e Reformas",
        description: "Construção civil em Rondonópolis-MT com qualidade, agilidade e segurança.",
        keywords: "construtora, obras, reformas, engenharia civil, Rondonópolis"
      },
      "home": {
        title: "Construtora Vieira - Obras e Reformas",
        description: "Construção civil em Rondonópolis-MT com qualidade, agilidade e segurança.",
        keywords: "construtora, obras, reformas, engenharia civil, Rondonópolis"
      },
      "obras": {
        title: "Obras Realizadas - Construtora Vieira",
        description: "Conheça algumas obras executadas pela M V de Souza em Rondonópolis e região.",
        keywords: "obras, construções, portfólio, projetos"
      },
      "servicos": {
        title: "Serviços - Construtora Vieira",
        description: "Serviços completos de construção civil, reformas e estruturas metálicas.",
        keywords: "serviços, construção, reformas, estruturas metálicas"
      },
      "empreendimentos": {
        title: "Empreendimentos - Construtora Vieira",
        description: "Conheça nossos empreendimentos em destaque para venda e aluguel.",
        keywords: "empreendimentos, imóveis, venda, aluguel, Rondonópolis"
      }
    };

    const meta = dados[rota] || dados["home"];
    
    document.title = meta.title;
    
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.content = meta.description;
    
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) keywordsMeta.content = meta.keywords;
  }
});

function atualizarMetas(rota) {
  const dados = {
  "": {
    "title": "Construtora Vieira - Obras e Reformas",
    "description": "Constru\u00e7\u00e3o civil em Rondon\u00f3polis-MT com qualidade, agilidade e seguran\u00e7a.",
    "keywords": "construtora, obras, reformas, engenharia civil, Rondon\u00f3polis",
    "schema": {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Construtora Vieira",
      "url": "https://construtoravieira.com.br",
      "logo": "https://construtoravieira.com.br/img_site/logocerta.png",
      "sameAs": [
        "https://www.instagram.com/",
        "https://www.facebook.com/",
        "https://www.linkedin.com/"
      ]
    }
  },
  "home": {
    "title": "Construtora Vieira - Obras e Reformas",
    "description": "Constru\u00e7\u00e3o civil em Rondon\u00f3polis-MT com qualidade, agilidade e seguran\u00e7a.",
    "keywords": "construtora, obras, reformas, engenharia civil, Rondon\u00f3polis",
    "schema": {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Construtora Vieira"
    }
  },
  "obras": {
    "title": "Obras Realizadas - Construtora Vieira",
    "description": "Conhe\u00e7a algumas obras executadas pela M V de Souza em Rondon\u00f3polis e regi\u00e3o.",
    "keywords": "obras, constru\u00e7\u00f5es, portf\u00f3lio, projetos",
    "schema": {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Obras Realizadas",
      "description": "Lista de obras executadas pela Construtora Vieira",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": []
      }
    }
  },
  "servicos": {
    "title": "Servi\u00e7os - Construtora Vieira",
    "description": "Servi\u00e7os completos de constru\u00e7\u00e3o civil, reformas e estruturas met\u00e1licas.",
    "keywords": "servi\u00e7os, constru\u00e7\u00e3o, reformas, estruturas met\u00e1licas",
    "schema": {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Servi\u00e7os de Constru\u00e7\u00e3o",
      "provider": {
        "@type": "Organization",
        "name": "Construtora Vieira"
      },
      "areaServed": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Rondon\u00f3polis",
          "addressRegion": "MT",
          "addressCountry": "BR"
        }
      }
    }
  },
  "empreendimentos": {
    "title": "Empreendimentos - Construtora Vieira",
    "description": "Conhe\u00e7a nossos empreendimentos em destaque para venda e aluguel.",
    "keywords": "empreendimentos, im\u00f3veis, venda, aluguel, Rondon\u00f3polis",
    "schema": {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Construtora Vieira"
    }
  },
  "sobrenos": {
    "title": "Sobre N\u00f3s - Construtora Vieira",
    "description": "Conhe\u00e7a a hist\u00f3ria, miss\u00e3o e valores da Construtora Vieira.",
    "keywords": "sobre, hist\u00f3ria, miss\u00e3o, construtora, Rondon\u00f3polis",
    "schema": {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "Sobre a Construtora Vieira",
      "description": "Conhe\u00e7a a hist\u00f3ria, miss\u00e3o e valores da Construtora Vieira em Rondon\u00f3polis."
    }
  },
  "sustentabilidade": {
    "title": "Sustentabilidade - Construtora Vieira",
    "description": "Nossas a\u00e7\u00f5es e compromissos com a sustentabilidade na constru\u00e7\u00e3o civil.",
    "keywords": "sustentabilidade, meio ambiente, constru\u00e7\u00e3o verde",
    "schema": {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Sustentabilidade",
      "description": "Compromissos ambientais da Construtora Vieira em Rondon\u00f3polis-MT."
    }
  },
  "noticias": {
    "title": "Not\u00edcias - Construtora Vieira",
    "description": "Fique por dentro das novidades, lan\u00e7amentos e atualiza\u00e7\u00f5es da construtora.",
    "keywords": "not\u00edcias, lan\u00e7amentos, novidades, obras",
    "schema": {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Not\u00edcias da Construtora Vieira",
      "description": "Blog de atualiza\u00e7\u00f5es e not\u00edcias sobre obras e projetos."
    }
  },
  "simulacao": {
    "title": "Simulador de Financiamento - Construtora Vieira",
    "description": "Calcule seu financiamento de forma r\u00e1pida e pr\u00e1tica com nosso simulador.",
    "keywords": "simulador, financiamento, im\u00f3veis, c\u00e1lculo",
    "schema": {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Simulador de Financiamento",
      "applicationCategory": "FinanceApplication"
    }
  },
  "trabalheconosco": {
    "title": "Trabalhe Conosco - Construtora Vieira",
    "description": "Envie seu curr\u00edculo e venha fazer parte da nossa equipe.",
    "keywords": "trabalho, vagas, recrutamento, equipe",
    "schema": {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": "Envie seu curr\u00edculo - Construtora Vieira",
      "description": "Trabalhe conosco e fa\u00e7a parte da nossa equipe em Rondon\u00f3polis-MT."
    }
  },
  "contato": {
    "title": "Contato - Construtora Vieira",
    "description": "Fale conosco para or\u00e7amentos, d\u00favidas ou informa\u00e7\u00f5es.",
    "keywords": "contato, atendimento, construtora, or\u00e7amento",
    "schema": {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Fale Conosco",
      "description": "Entre em contato com a Construtora Vieira para informa\u00e7\u00f5es e or\u00e7amentos."
    }
  }
};
  const meta = dados[rota] || dados["home"];
  document.title = meta.title;
  const descMeta = document.querySelector('meta[name="description"]');
  if (descMeta) descMeta.content = meta.description;
  const keywordsMeta = document.querySelector('meta[name="keywords"]');
  if (keywordsMeta) keywordsMeta.content = meta.keywords;
  const schemaTag = document.getElementById("schema-json");
  if (schemaTag && meta.schema) {
    schemaTag.textContent = JSON.stringify(meta.schema, null, 2);
  }
}