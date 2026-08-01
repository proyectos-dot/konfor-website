/* ============================================================
   KONFOR — motor V3
   Las ocho transiciones del contrato. Nada de librerías.

   Nota de método: los revelados usan DOS mecanismos a la vez
   (IntersectionObserver y un barrido por posición). No es
   redundancia: el observador no dispara para lo que ya está en
   pantalla al cargar, y el barrido no ve lo que entra sin que
   haya evento de scroll. Cada uno cubre el punto ciego del otro.
   ============================================================ */

(() => {
  "use strict";

  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ── Cabecera ───────────────────────────────────────────── */
  const cabecera = $(".cabecera");
  if (cabecera) {
    const posar = () => cabecera.classList.toggle("posada", window.scrollY > 40);
    posar();
    addEventListener("scroll", posar, { passive: true });
  }

  /* ── Revelados: T3 pliegue, T8 máscara y entradas ───────── */
  const marcar = (el) => el.classList.add("visto");

  const io = new IntersectionObserver(
    (ent) => ent.forEach((e) => { if (e.isIntersecting) { marcar(e.target); io.unobserve(e.target); } }),
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  const candidatos = () => $$("[data-revelar], .pliegue, .mascara, .telefono").filter((e) => !e.classList.contains("visto"));
  candidatos().forEach((e) => io.observe(e));

  const barrido = () => {
    const h = innerHeight;
    candidatos().forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.top < h * 0.88 && r.bottom > 0) marcar(e);
    });
  };
  barrido();
  addEventListener("scroll", barrido, { passive: true });
  addEventListener("resize", barrido);

  /* ── Escalonado dentro de un grupo ──────────────────────── */
  $$("[data-escalonar]").forEach((grupo) => {
    Array.from(grupo.children).forEach((hijo, i) => {
      hijo.style.transitionDelay = `${i * 90}ms`;
    });
  });

  /* ── T2 · recorrido continuo sobre canvas ───────────────
     Nunca <video> con seeks: el navegador descarta seeks en cola
     sobre un vídeo pausado y no siempre repinta la capa. Ya falló. */
  const recorrido = $(".recorrido");
  if (recorrido) {
    const lienzo = $("#lienzo");
    const pintor = lienzo ? lienzo.getContext("2d", { alpha: false }) : null;
    const tiempos = $$(".tiempo", recorrido);
    const TOTAL = 40;
    const cuadros = [];
    let ultimo = -1;
    let listo = false;

    const ruta = (i) => `assets/seq/f_${String(i + 1).padStart(3, "0")}.jpg`;

    const medir = () => {
      if (!lienzo) return;
      const d = Math.min(devicePixelRatio || 1, 2);
      lienzo.width  = lienzo.clientWidth  * d;
      lienzo.height = lienzo.clientHeight * d;
      ultimo = -1;
    };

    // object-fit: cover a mano, porque drawImage no lo hace solo
    const pintar = (i) => {
      const img = cuadros[i];
      if (!img || !img.complete || !pintor) return;
      const cw = lienzo.width, ch = lienzo.height;
      const ei = img.naturalWidth / img.naturalHeight;
      const ec = cw / ch;
      let w, h, x, y;
      if (ei > ec) { h = ch; w = h * ei; x = (cw - w) / 2; y = 0; }
      else         { w = cw; h = w / ei; x = 0; y = (ch - h) / 2; }
      pintor.drawImage(img, x, y, w, h);
      ultimo = i;
    };

    const cargar = () => {
      for (let i = 0; i < TOTAL; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = ruta(i);
        if (i === 0) img.onload = () => { listo = true; medir(); pintar(0); };
        cuadros[i] = img;
      }
    };

    const avanzar = () => {
      const caja = recorrido.getBoundingClientRect();
      const total = recorrido.offsetHeight - innerHeight;
      const p = total > 0 ? Math.min(Math.max(-caja.top / total, 0), 1) : 0;

      if (listo && !quieto) {
        const i = Math.min(Math.round(p * (TOTAL - 1)), TOTAL - 1);
        if (i !== ultimo) pintar(i);
      }
      if (tiempos.length) {
        const activo = Math.min(Math.floor(p * tiempos.length), tiempos.length - 1);
        tiempos.forEach((t, i) => t.classList.toggle("on", i === activo));
      }
    };

    cargar();
    addEventListener("scroll", avanzar, { passive: true });
    addEventListener("resize", () => { medir(); avanzar(); });
    avanzar();
  }

  /* ── T4 · pliegue inverso: la tarjeta se voltea con el scroll ──
     Disparo por scroll, no por hover: en móvil no hay hover. */
  const volteas = $$(".voltea");
  if (volteas.length && !quieto) {
    const girar = () => {
      const centro = innerHeight * 0.46;
      volteas.forEach((v) => {
        const r = v.getBoundingClientRect();
        v.classList.toggle("girada", r.top < centro && r.bottom > centro * 0.5);
      });
    };
    addEventListener("scroll", girar, { passive: true });
    girar();
  }

  /* ── T6 · el día: el sujeto queda fijo, el mundo cambia ─── */
  const dia = $(".dia");
  if (dia) {
    const pantallas = $$(".dia-marco img", dia);
    const glosas = $$(".dia-glosa > div", dia);
    const n = Math.max(pantallas.length, glosas.length);
    let activo = -1;

    const seguir = () => {
      const caja = dia.getBoundingClientRect();
      const total = dia.offsetHeight - innerHeight;
      const p = total > 0 ? Math.min(Math.max(-caja.top / total, 0), 1) : 0;
      const i = Math.min(Math.floor(p * n), n - 1);
      if (i === activo) return;
      activo = i;
      pantallas.forEach((el, k) => el.classList.toggle("on", k === i));
      glosas.forEach((el, k) => el.classList.toggle("on", k === i));
    };
    addEventListener("scroll", seguir, { passive: true });
    addEventListener("resize", seguir);
    seguir();
  }

  /* ── T5 · traspaso entre páginas ────────────────────────
     Si la API no está, el respaldo es un fundido — jamás un
     parpadeo ni una pantalla en blanco. */
  if (document.startViewTransition) {
    $$("a[data-traspaso]").forEach((a) => {
      a.addEventListener("click", (e) => {
        const url = a.getAttribute("href");
        if (!url || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
        e.preventDefault();
        document.startViewTransition(() => { location.href = url; });
      });
    });
  }

  /* ── Año en el pie ──────────────────────────────────────── */
  $$("[data-anio]").forEach((e) => { e.textContent = new Date().getFullYear(); });
})();
