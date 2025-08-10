/* Construtora Vieira – JS enxuto, sem SPA e sem alteração de meta/SEO */
document.addEventListener("DOMContentLoaded", () => {
  // ====== MENU MOBILE =======================================================
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu   = document.getElementById("nav-menu");
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => navMenu.classList.toggle("open"));
  }

  // ====== FORMULÁRIOS =======================================================
  initFormularioContato();        // contato.html (#form-contato)
  initFormularioTrabalho();       // trabalheconosco.html (.formulario-trabalho)

  // ====== SIMULADOR (simulacao.html) ========================================
  initSimulador();                // #form-simulacao + máscaras

  // ====== CARROSSEL (obras/empreendimentos) =================================
  // Usa botões existentes com onclick="moverCarrossel('obras', 1)" se houver.
  // Também habilita uma API opcional via data-atributos.
  initCarrosseis();

  // ====== FEED (noticias.html) – opcional, não afeta SEO ====================
  carregarFeedAgenciaBrasil();    // só executa se #rss-feed existir
});

/* ============================ CARROSSEL ==================================== */
// Helpers de translateX mais seguros (suporta 'matrix(...)' e 'translateX(...)')
function getTranslateX(el) {
  const style = window.getComputedStyle(el);
  const t = style.transform || el.style.transform || "none";
  if (t === "none") return 0;
  // matrix(a,b,c,d,tx,ty) -> pega tx
  const m = t.match(/^matrix\(([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(",").map(s => parseFloat(s.trim()));
    return parts[4] || 0;
  }
  // translateX(123px)
  const tx = t.match(/translateX\(\s*(-?\d+(?:\.\d+)?)px\)/i);
  if (tx) return parseFloat(tx[1]);
  // fallback: qualquer número
  const num = t.match(/-?\d+(\.\d+)?/);
  return num ? parseFloat(num[0]) : 0;
}
function setTranslateX(el, x) {
  el.style.transform = `translateX(${x}px)`;
}

window.moverCarrossel = function(tipo, direcao) {
  const track = document.getElementById(`track-${tipo}`);
  if (!track) return;
  const item = track.querySelector(".carrossel-item");
  if (!item) return;

  const GAP_PX = 20; // manter compatível com CSS existente
  const itemWidth = item.offsetWidth + GAP_PX;
  const currentX = getTranslateX(track);

  // quantidade visível (3 em desktop; ajusta automaticamente em telas menores)
  const visible = Math.max(1, Math.round(track.parentElement.offsetWidth / item.offsetWidth));
  const maxScroll = -(itemWidth * (track.children.length - visible));

  let newX = currentX + (direcao * itemWidth);
  newX = Math.max(maxScroll, Math.min(0, newX));
  setTranslateX(track, newX);
};

function initCarrosseis() {
  // Suporte opcional para botões com data-target="obras|clientes" e data-dir="1|-1"
  document.querySelectorAll("[data-carousel-btn]").forEach(btn => {
    btn.addEventListener("click", () => {
      const alvo = btn.getAttribute("data-target");
      const dir  = parseInt(btn.getAttribute("data-dir") || "1", 10);
      window.moverCarrossel(alvo, dir);
    });
  });

  // Ajuste em resize para não “estourar” o limite após mudança de largura
  let rAF = 0;
  window.addEventListener("resize", () => {
    if (rAF) cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => {
      document.querySelectorAll("[id^='track-']").forEach(track => {
        const tipo = track.id.replace("track-", "");
        // força um clamp sem mover “visualmente” além do permitido
        window.moverCarrossel(tipo, 0);
      });
    });
  }, { passive: true });
}

/* ============================ FORMULÁRIOS ================================== */
function montarTextoWhatsApp(linhas) {
  return encodeURIComponent(linhas.filter(Boolean).join("\n"));
}

function abrirWhatsAppComTexto(numero, texto) {
  const url = `https://wa.me/${numero}?text=${texto}`;
  window.open(url, "_blank");
}

function initFormularioContato() {
  const form = document.getElementById("form-contato");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const nome     = form.querySelector("#nome")?.value.trim() || "";
    const email    = form.querySelector("#email")?.value.trim() || "";
    const telefone = form.querySelector("#telefone")?.value.trim() || "";
    const mensagem = form.querySelector("#mensagem")?.value.trim() || "";

    const linhas = [
      "📞 *Contato via site*",
      "",
      `*Nome:* ${nome}`,
      `*Email:* ${email}`,
      `*Telefone:* ${telefone}`,
      `*Mensagem:* ${mensagem}`
    ];

    const texto = montarTextoWhatsApp(linhas);

    // Se o form tiver action="https://wa.me/..." + input hidden name="text", respeita envio nativo
    const hidden = form.querySelector("input[name='text']");
    if (form.action && form.action.startsWith("https://wa.me") && hidden) {
      hidden.value = decodeURIComponent(texto); // o browser re-encodeia ao submeter
      form.submit();
      return;
    }

    abrirWhatsAppComTexto("5566999366313", texto);
  });
}

function initFormularioTrabalho() {
  const form = document.querySelector("form.formulario-trabalho");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const nome     = form.querySelector("#nome")?.value.trim() || "";
    const email    = form.querySelector("#email")?.value.trim() || "";
    const telefone = form.querySelector("#telefone")?.value.trim() || "";
    const mensagem = form.querySelector("#mensagem")?.value.trim() || "";

    const linhas = [
      "*Trabalhe Conosco - Novo Cadastro*",
      "",
      `*Nome:* ${nome}`,
      `*Email:* ${email}`,
      `*Telefone:* ${telefone}`,
      mensagem ? `*Mensagem:* ${mensagem}` : "",
      "",
      "Por favor, envie seu currículo em PDF como anexo nesta conversa."
    ];

    const texto = montarTextoWhatsApp(linhas);

    // Alerta preservado (comportamento já usado)
    alert("Você será redirecionado para o WhatsApp. Anexe seu currículo (PDF).");

    // Suporte ao envio nativo se o HTML usar action=wa.me + input hidden name=text
    const hidden = form.querySelector("input[name='text']");
    if (form.action && form.action.startsWith("https://wa.me") && hidden) {
      hidden.value = decodeURIComponent(texto);
      form.submit();
      return;
    }

    abrirWhatsAppComTexto("5566999366313", texto);
  });
}

/* ============================ SIMULADOR ==================================== */
function initSimulador() {
  const form = document.getElementById("form-simulacao");
  if (!form) return;

  // máscaras
  aplicarMascaraMoeda(document.getElementById("valor-imovel"));
  aplicarMascaraMoeda(document.getElementById("valor-entrada"));
  aplicarMascaraPercentual(document.getElementById("juros"));

  form.addEventListener("submit", e => {
    e.preventDefault();
    const vi      = parseMoeda(document.getElementById("valor-imovel")?.value);
    const ve      = parseMoeda(document.getElementById("valor-entrada")?.value);
    const prazo   = parseInt(document.getElementById("prazo")?.value || "0", 10);
    const sistema = (document.getElementById("sistema")?.value || "").toLowerCase();
    const jAno    = parsePercentual(document.getElementById("juros")?.value);
    const resEl   = document.getElementById("resultado-simulacao");

    if (!resEl || !vi || prazo <= 0 || jAno < 0) {
      if (resEl) resEl.innerHTML = "<p style='color:red'>Preencha os dados corretamente.</p>";
      return;
    }

    const financiamento = Math.max(0, vi - (ve || 0));
    const jMes = jAno / 12;

    let html = "";
    let resumoWhatsapp = `🏠 *Simulação de Financiamento*\n\n• Valor do Imóvel: R$ ${formatBR(vi)}\n• Entrada: R$ ${formatBR(ve || 0)}\n• Prazo: ${prazo} meses\n• Juros: ${(jAno*100).toFixed(2)}% ao ano\n• Sistema: ${sistema.toUpperCase()}\n`;

    if (sistema === "sac") {
      const amort = financiamento / prazo;
      let saldo = financiamento, total = 0, p1 = 0, pF = 0;
      for (let i = 1; i <= prazo; i++) {
        const juros = saldo * jMes;
        const parcela = amort + juros;
        if (i === 1) p1 = parcela;
        if (i === prazo) pF = parcela;
        total += parcela; saldo -= amort;
      }
      html = `
        <h2>Resultado (SAC)</h2>
        <p>Valor financiado: R$ ${formatBR(financiamento)}</p>
        <p>Parcela inicial: R$ ${formatBR(p1)}</p>
        <p>Parcela final: R$ ${formatBR(pF)}</p>
        <p>Total pago: R$ ${formatBR(total)}</p>`;
      resumoWhatsapp += `• Parcela inicial: R$ ${formatBR(p1)}\n• Parcela final: R$ ${formatBR(pF)}\n• Total pago: R$ ${formatBR(total)}`;
    } else {
      // PRICE (parcela fixa) — trata juros 0%
      let parcela, total;
      if (jMes === 0) {
        parcela = financiamento / prazo;
      } else {
        parcela = financiamento * (jMes / (1 - Math.pow(1 + jMes, -prazo)));
      }
      total   = parcela * prazo;
      html = `
        <h2>Resultado (PRICE)</h2>
        <p>Valor financiado: R$ ${formatBR(financiamento)}</p>
        <p>Parcela fixa: R$ ${formatBR(parcela)}</p>
        <p>Total pago: R$ ${formatBR(total)}</p>`;
      resumoWhatsapp += `• Parcela fixa: R$ ${formatBR(parcela)}\n• Total pago: R$ ${formatBR(total)}`;
    }

    resEl.innerHTML = html;

    // botão WhatsApp (preservado, com pequenos reforços)
    let btn = document.getElementById("btn-whatsapp");
    if (!btn) {
      btn = document.createElement("a");
      btn.id = "btn-whatsapp";
      btn.className = "btn btn-black";
      btn.target = "_blank";
      btn.rel = "noopener";
      btn.style.display = "inline-block";
      btn.style.marginTop = "2rem";
      btn.innerText = "Continuar pelo WhatsApp";
      resEl.after(btn);
    }
    btn.href = `https://wa.me/5566999366313?text=${encodeURIComponent("Olá! Fiz uma simulação no site e aqui estão os dados:\n\n" + resumoWhatsapp)}`;
  });
}

/* ===== Helpers de máscara/parse/format ===== */
function aplicarMascaraMoeda(input) {
  if (!input) return;
  input.addEventListener("input", e => e.target.value = formatInputCurrency(e.target.value));
  input.addEventListener("focus", e => { if (!e.target.value) e.target.value = "R$ 0,00"; });
  input.addEventListener("blur",  e => { if (e.target.value === "R$ 0,00") e.target.value = ""; });
}
function aplicarMascaraPercentual(input) {
  if (!input) return;
  input.addEventListener("input", e => e.target.value = formatInputPercent(e.target.value));
  input.addEventListener("focus", e => { if (!e.target.value) e.target.value = "0,00 %"; });
  input.addEventListener("blur",  e => { if (e.target.value === "0,00 %") e.target.value = ""; });
}
function formatInputCurrency(v) {
  let num = (v || "").replace(/\D/g, "");
  num = (Number(num) / 100).toFixed(2).replace(".", ",");
  return "R$ " + num.replace(/\B?(?=(\d{3})+(?!\d))/g, ".");
}
function formatInputPercent(v) {
  let num = (v || "").replace(/\D/g, "");
  num = (Number(num) / 100).toFixed(2).replace(".", ",");
  return num + " %";
}
function parseMoeda(v) {
  if (!v) return 0;
  return Number(v.replace(/[^\d]/g, "")) / 100;
}
function parsePercentual(v) {
  if (!v) return 0;
  return Number(v.replace(/[^\d]/g, "")) / 100; // ex.: "12,34 %" -> 0.1234
}
function formatBR(n) {
  return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ============================ FEED (Opcional) ============================== */
async function carregarFeedAgenciaBrasil() {
  const feedEl = document.getElementById("rss-feed");
  if (!feedEl) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout p/ não travar UX

  try {
    const rssUrl = "https://agenciabrasil.ebc.com.br/rss.xml";
    // usa serviço público rss2json (graceful degradation se bloquear)
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=1`;
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const data = await resp.json();
    const item = data?.items?.[0];

    if (!item) {
      feedEl.innerHTML = "<p>Nenhuma notícia disponível no momento.</p>";
      return;
    }

    const img = item.enclosure?.link ? `<img src="${item.enclosure.link}" alt="${item.title}" style="width:100%;height:auto">` : "";
    feedEl.innerHTML = `
      <div style="background:#111;border-radius:10px;overflow:hidden;box-shadow:0 0 10px #000;">
        ${img}
        <div style="padding:1rem">
          <p style="color:#888;font-size:.9rem;margin:0 0 .5rem">Fonte: Agência Brasil</p>
          <h2 style="font-size:1.1rem;margin:0 0 .5rem">
            <a href="${item.link}" target="_blank" rel="noopener" style="color:#fff;text-decoration:none">${item.title}</a>
          </h2>
          <p style="color:#ccc;font-size:.95rem">${(item.description||"").substring(0,140)}…</p>
        </div>
      </div>`;
  } catch {
    clearTimeout(timeout);
    feedEl.innerHTML = "<p>Erro ao carregar notícias.</p>";
  }
}


/* ====== SIMULADOR – etapas e cálculo (wizard) ====== */
window.proximaEtapa = function (etapa) {
  // valida etapa atual
  const etapaAtual = document.querySelector(".etapa-conteudo.ativa");
  if (etapaAtual) {
    const campos = etapaAtual.querySelectorAll("input[required], select[required]");
    let valido = true;
    campos.forEach(c => {
      if (!c.value.trim()) { c.style.borderColor = "#dc3545"; valido = false; }
      else { c.style.borderColor = "#e9ecef"; }
    });
    if (!valido) { alert("Por favor, preencha todos os campos obrigatórios."); return; }
  }
  document.querySelectorAll(".etapa-conteudo").forEach(el => el.classList.remove("ativa"));
  document.querySelectorAll(".etapa").forEach(el => el.classList.remove("ativa"));
  document.getElementById(`etapa-${etapa}`)?.classList.add("ativa");
  document.querySelector(`[data-etapa="${etapa}"]`)?.classList.add("ativa");
};

window.etapaAnterior = function (etapa) {
  document.querySelectorAll(".etapa-conteudo").forEach(el => el.classList.remove("ativa"));
  document.querySelectorAll(".etapa").forEach(el => el.classList.remove("ativa"));
  document.getElementById(`etapa-${etapa}`)?.classList.add("ativa");
  document.querySelector(`[data-etapa="${etapa}"]`)?.classList.add("ativa");
};

window.calcularSimulacao = function () {
  // valida etapa 2
  const campos = document.querySelectorAll("#etapa-2 input[required], #etapa-2 select[required]");
  let valido = true;
  campos.forEach(c => {
    if (!c.value.trim()) { c.style.borderColor = "#dc3545"; valido = false; }
    else { c.style.borderColor = "#e9ecef"; }
  });
  if (!valido) { alert("Por favor, preencha todos os campos obrigatórios."); return; }

  // valores
  const vi   = parseMoeda(document.getElementById("valor-imovel")?.value);
  const ve   = parseMoeda(document.getElementById("valor-entrada")?.value);
  const prazo = parseInt(document.getElementById("prazo")?.value || "0", 10);
  const sistema = (document.getElementById("sistema")?.value || "").toLowerCase();
  const jAno = parsePercentual(document.getElementById("juros")?.value);
  const renda = parseMoeda(document.getElementById("renda-bruta")?.value);

  const resEl = document.getElementById("resultado-simulacao");
  if (!resEl || !vi || prazo <= 0 || jAno < 0) {
    if (resEl) resEl.innerHTML = "<p style='color:red'>Preencha os dados corretamente.</p>";
    return;
  }

  const financiamento = Math.max(0, vi - (ve || 0));
  if (financiamento <= 0) { alert("O valor da entrada não pode ser maior ou igual ao valor do imóvel."); return; }

  const jMes = jAno / 12;
  let html = "";

  if (sistema === "sac") {
    const amort = financiamento / prazo;
    let saldo = financiamento, total = 0, p1 = 0, pF = 0;
    for (let i = 1; i <= prazo; i++) {
      const juros = saldo * jMes;
      const parcela = amort + juros;
      if (i === 1) p1 = parcela;
      if (i === prazo) pF = parcela;
      total += parcela; saldo -= amort;
    }
    const compromet = renda ? (p1 / renda) * 100 : 0;
    html = `
      <div class="resultado-item"><span class="resultado-label">Sistema de Amortização:</span><span class="resultado-valor">SAC</span></div>
      <div class="resultado-item"><span class="resultado-label">Valor Financiado:</span><span class="resultado-valor">R$ ${formatBR(financiamento)}</span></div>
      <div class="resultado-item"><span class="resultado-label">Primeira Parcela:</span><span class="resultado-valor">R$ ${formatBR(p1)}</span></div>
      <div class="resultado-item"><span class="resultado-label">Última Parcela:</span><span class="resultado-valor">R$ ${formatBR(pF)}</span></div>
      <div class="resultado-item"><span class="resultado-label">Total a Pagar:</span><span class="resultado-valor">R$ ${formatBR(total)}</span></div>
      <div class="resultado-item"><span class="resultado-label">Comprometimento da Renda:</span><span class="resultado-valor">${compromet.toFixed(1)}%</span></div>
    `;
  } else {
    // PRICE (parcela fixa) — trata juros 0%
    let parcela;
    if (jMes === 0) parcela = financiamento / prazo;
    else parcela = financiamento * (jMes / (1 - Math.pow(1 + jMes, -prazo)));
    const total = parcela * prazo;
    const compromet = renda ? (parcela / renda) * 100 : 0;
    html = `
      <div class="resultado-item"><span class="resultado-label">Sistema de Amortização:</span><span class="resultado-valor">PRICE</span></div>
      <div class="resultado-item"><span class="resultado-label">Valor Financiado:</span><span class="resultado-valor">R$ ${formatBR(financiamento)}</span></div>
      <div class="resultado-item"><span class="resultado-label">Parcela Fixa:</span><span class="resultado-valor">R$ ${formatBR(parcela)}</span></div>
      <div class="resultado-item"><span class="resultado-label">Total a Pagar:</span><span class="resultado-valor">R$ ${formatBR(total)}</span></div>
      <div class="resultado-item"><span class="resultado-label">Comprometimento da Renda:</span><span class="resultado-valor">${compromet.toFixed(1)}%</span></div>
    `;
  }

  html += `
    <div style="margin-top:2rem; text-align:center;">
      <a class="btn btn-green" target="_blank"
         href="https://wa.me/5566999366313?text=${encodeURIComponent('Olá! Fiz uma simulação de financiamento no site e gostaria de mais informações sobre as condições.')}">
        💬 Falar com Especialista
      </a>
    </div>
  `;

  resEl.innerHTML = html;
  window.proximaEtapa(3);
};

window.novaSimulacao = function () {
  const form = document.getElementById("form-simulacao");
  if (form) form.reset();
  document.querySelectorAll(".etapa-conteudo").forEach(el => el.classList.remove("ativa"));
  document.querySelectorAll(".etapa").forEach(el => el.classList.remove("ativa"));
  document.getElementById("etapa-1")?.classList.add("ativa");
  document.querySelector('[data-etapa="1"]')?.classList.add("ativa");
};

// Máscaras também no campo de renda (além dos já aplicados)
document.addEventListener("DOMContentLoaded", function () {
  const renda = document.getElementById("renda-bruta");
  if (typeof aplicarMascaraMoeda === "function") aplicarMascaraMoeda(renda);
});
