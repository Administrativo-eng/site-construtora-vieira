

// Envia mensagem para WhatsApp com os dados do formulário
function enviarWhatsApp() {
  const nome = document.getElementById("nome")?.value || "";
  const telefone = document.getElementById("telefone")?.value || "";
  const mensagem = document.getElementById("mensagem")?.value || "";

  if (!nome || !mensagem) {
    alert("Por favor, preencha seu nome e mensagem.");
    return;
  }

  const texto = `Olá, meu nome é ${nome} (whatsapp: ${telefone}). Quero falar com vocês: ${mensagem}`;
  const link = `https://wa.me/5566999366313?text=${encodeURIComponent(texto)}`;
  window.open(link, "_blank");
}

// Carrega trechos HTML marcados com [include-html]
async function includeHTML() {
  const elements = document.querySelectorAll('[include-html]');
  for (const el of elements) {
    const file = el.getAttribute('include-html');
    if (file) {
      try {
        const res = await fetch(file);
        if (res.ok) {
          const text = await res.text();
          el.innerHTML = text;
        } else {
          el.innerHTML = "<!-- Erro ao carregar include -->";
        }
      } catch (e) {
        console.error("Erro ao carregar include:", e);
      }
    }
  }
}

// Carrega páginas SPA
async function loadPage(page, link = null, event = null) {
  if (event) event.preventDefault();

  try {
    const res = await fetch(`/paginas/${page}.html`);
    if (!res.ok) throw new Error("Página não encontrada.");
    const html = await res.text();
    document.getElementById("content").innerHTML = html;

    if (link) {
      document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
      link.classList.add("active");
    }
  } catch (e) {
    document.getElementById("content").innerHTML = "<p>Erro ao carregar conteúdo.</p>";
    console.error(e);
  }
}

// Inserção dinâmica do header e footer
document.addEventListener("DOMContentLoaded", function () {
  fetch('../includes/header.html')
    .then(res => res.text())
    .then(data => document.body.insertAdjacentHTML('afterbegin', data));

  fetch('../includes/footer.html')
    .then(res => res.text())
    .then(data => document.body.insertAdjacentHTML('beforeend', data));
});


// Inicia o site com includes e página inicial
includeHTML().then(() => loadPage("index"));
