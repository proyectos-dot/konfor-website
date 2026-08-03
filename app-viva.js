/* La app real, viva, dentro del marco del teléfono.
   No es un video ni una captura: es el prototipo funcionando en un iframe
   del mismo origen. Solo en escritorio y sin reduce-motion: en el móvil un
   iframe tocable dentro de una página que scrollea es una trampa de gestos.

   Microinteracción: el iframe nace sordo (pointer-events:none) para que el
   scroll de la página nunca se atasque sobre el teléfono. Un toque lo
   despierta; al sacar el cursor vuelve a dormirse. */
(() => {
  const marco = document.querySelector("[data-app-viva]");
  if (!marco) return;
  const escritorio = matchMedia("(min-width: 900px)").matches;
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!escritorio || quieto) return;

  // geometría del prototipo: pantalla de 374x846 en un lienzo de 430x932,
  // con la esquina de la pantalla en (28, 51) — medido, no estimado
  const PANTALLA = { x: 28, y: 51, w: 374, h: 846 };

  const armar = () => {
    const iframe = document.createElement("iframe");
    iframe.src = "assets/app/vivo.html";
    iframe.title = "La app KONFOR, funcionando";
    iframe.setAttribute("tabindex", "-1");
    Object.assign(iframe.style, {
      position: "absolute", left: "0", top: "0",
      width: "430px", height: "932px", border: "0",
      transformOrigin: "0 0", pointerEvents: "none",
      opacity: "0", transition: "opacity .6s ease",
      background: "transparent",
    });
    const ajustar = () => {
      const s = marco.clientWidth / PANTALLA.w;
      iframe.style.transform = `scale(${s}) translate(${-PANTALLA.x}px, ${-PANTALLA.y}px)`;
    };
    ajustar();
    addEventListener("resize", ajustar);

    iframe.addEventListener("load", () => {
      // saltar el tour de bienvenida: mismo origen, podemos entrar al DOM
      const saltar = () => {
        try {
          const d = iframe.contentDocument;
          const hojas = [...d.querySelectorAll("*")].filter(
            (e) => e.children.length === 0 && (e.textContent || "").trim() === "Saltar");
          if (!hojas.length) return false;
          let n = hojas[0];
          for (let i = 0; i < 6 && n; i++, n = n.parentElement) if (n.onclick) { n.click(); return true; }
          hojas[0].click(); return true;
        } catch { return false; }
      };
      let intentos = 0;
      const bucle = setInterval(() => {
        if (!saltar() && ++intentos > 2) clearInterval(bucle);
        if (intentos > 14) clearInterval(bucle);
      }, 420);
      setTimeout(() => {
        iframe.style.opacity = "1";
        marco.classList.add("app-despierta-lista");
      }, 1600);
    });

    marco.appendChild(iframe);

    // el velo: captura el primer toque, despierta el iframe, se aparta
    const velo = document.createElement("button");
    velo.type = "button";
    velo.className = "app-velo";
    velo.setAttribute("aria-label", "Tocar para usar la app de muestra");
    velo.innerHTML = '<span class="app-chip">Tócala — es la app real</span>';
    marco.appendChild(velo);

    const despertar = () => {
      iframe.style.pointerEvents = "auto";
      velo.classList.add("dormido");
    };
    const dormir = () => {
      iframe.style.pointerEvents = "none";
      velo.classList.remove("dormido");
    };
    velo.addEventListener("click", despertar);
    marco.addEventListener("mouseleave", dormir);
    addEventListener("scroll", () => {
      const r = marco.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) dormir();
    }, { passive: true });
  };

  // no compite con la carga inicial: entra cuando la página ya cargó
  // y el marco está cerca del viewport
  const arrancar = () => {
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); armar(); }
    }, { rootMargin: "200px" });
    io.observe(marco);
  };
  if (document.readyState === "complete") arrancar();
  else addEventListener("load", arrancar, { once: true });
})();
