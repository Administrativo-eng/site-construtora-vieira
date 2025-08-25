/* Construtora Vieira — JS global
   - Menu Mobile
   - Eventos GTM (WhatsApp + outbound)
   - Slider progressivo apenas na galeria de detalhes (.galeria-detalhes)
*/
document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     MENU MOBILE
     ========================= */
  (function initMenuMobile(){
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
    menuToggle.addEventListener("click", toggleMenu, false);

    navMenu.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link) return;
      navMenu.classList.remove("open");
      setExpanded(false);
    }, false);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        navMenu.classList.remove("open");
        setExpanded(false);
      }
    }, false);

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        navMenu.classList.remove("open");
        setExpanded(false);
      }
    }, { passive: true });
  })();


  /* =========================
     TRACKING BÁSICO (GTM)
     ========================= */
  (function initTracking(){
    // CTA WhatsApp
    document.body.addEventListener("click", (e) => {
      const a = e.target.closest('a[data-cta="whatsapp"]');
      if (!a) return;
      (window.dataLayer = window.dataLayer || []).push({
        event: "cta_whatsapp_click",
        link_url: a.href,
        page_path: location.pathname,
        page_title: document.title
      });
    }, false);

    // Links externos (outbound)
    document.body.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="http"]');
      if (!a) return;
      if (a.host === location.host) return;
      (window.dataLayer = window.dataLayer || []).push({
        event: "outbound_click",
        link_url: a.href,
        link_text: (a.textContent || "").trim(),
        page_path: location.pathname,
        page_title: document.title
      });
    }, false);
  })();


  /* =========================
     SLIDER — GALERIA DE DETALHES
     (não interfere na HERO)
     ========================= */
  (function initDetalhesSlider(){
    // Só nas páginas de empreendimento
    if (!document.body.classList.contains("empreendimento")) return;

    // A galeria tem a classe .galeria-detalhes
    const slider = document.querySelector(".galeria-detalhes");
    if (!slider) return;

    const wrap   = slider.querySelector(".slides");
    const slides = Array.from(slider.querySelectorAll(".slide"));
    const prevBtn = slider.querySelector(".navegacao .prev");
    const nextBtn = slider.querySelector(".navegacao .next");
    let dotsWrap = slider.querySelector(".nav-dots");

    const total = slides.length;
    if (!wrap || total === 0 || !prevBtn || !nextBtn) return;

    // Define largura do trilho conforme número de slides
    wrap.style.display = "flex";
    wrap.style.width   = (total * 100) + "%";
    wrap.style.transition = "transform .5s ease";
    slides.forEach(s => { s.style.flex = "0 0 100%"; });

    // Constrói os dots se necessário
    if (!dotsWrap) {
      dotsWrap = document.createElement("div");
      dotsWrap.className = "nav-dots";
      slider.appendChild(dotsWrap);
    }
    dotsWrap.innerHTML = "";
    const dots = [];
    for (let i = 0; i < total; i++){
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dot";
      b.setAttribute("aria-label", `Ir para imagem ${i+1}`);
      dotsWrap.appendChild(b);
      dots.push(b);
    }

    // Estado
    let idx = 0;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const AUTO_MS = 6000;
    let timer = null;

    function update(){
      // cada slide ocupa 100% da largura da viewport do slider
      wrap.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d,i)=>d.classList.toggle("ativo", i===idx));
    }
    function goTo(i){
      idx = (i + total) % total;
      update();
      (window.dataLayer = window.dataLayer || []).push({
        event: "slider_view",
        slider_index: idx + 1,
        slider_total: total,
        page_path: location.pathname
      });
    }
    const next = () => goTo(idx + 1);
    const prev = () => goTo(idx - 1);

    // Controles
    nextBtn.addEventListener("click", next, false);
    prevBtn.addEventListener("click", prev, false);
    dots.forEach((d,i)=>d.addEventListener("click", ()=>goTo(i), false));

    // Teclado (acessível)
    slider.setAttribute("tabindex", "0");
    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
    }, false);

    // Swipe (touch)
    let startX = 0, startY = 0, isTouch = false;
    slider.addEventListener("touchstart", (e) => {
      if (!e.touches || !e.touches[0]) return;
      isTouch = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    slider.addEventListener("touchend", (e) => {
      if (!isTouch) return;
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dy) > Math.abs(dx)) return; // ignora rolagem vertical
      if (dx < -40) next();
      else if (dx > 40) prev();
      isTouch = false;
    }, { passive: true });

    // Auto‑avanço (respeita redução de movimento)
    function startAuto(){ if (!prefersReduced) { stopAuto(); timer = setInterval(next, AUTO_MS); } }
    function stopAuto(){ if (timer) { clearInterval(timer); timer = null; } }
    slider.addEventListener("mouseenter", stopAuto, false);
    slider.addEventListener("mouseleave", startAuto, false);
    slider.addEventListener("focusin",  stopAuto, false);
    slider.addEventListener("focusout", startAuto, false);
    document.addEventListener("visibilitychange", () => { document.hidden ? stopAuto() : startAuto(); }, false);

    // Inicializa
    update();
    startAuto();
  })();
});
