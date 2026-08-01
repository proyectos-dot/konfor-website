/* KONFOR — motor inmersivo (sin dependencias) */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Este archivo lo comparten la portada y las páginas de solución, que no
  // tienen preloader, reloj ni canvas. Todo lo del hero va condicionado.

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById("preloader");
  if (preloader) {
    window.addEventListener("load", () => setTimeout(() => preloader.classList.add("done"), 700));
    setTimeout(() => preloader.classList.add("done"), 2800);
  }

  /* ---------- Reloj del hero ---------- */
  const clock = document.getElementById("heroClock");
  if (clock) {
    const tickClock = () => {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      clock.textContent = "SDQ " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + " AST";
    };
    tickClock();
    setInterval(tickClock, 1000);
  }

  /* ---------- Typewriter del tag ---------- */
  const tag = document.querySelector("[data-type-target]");
  if (tag && !reduceMotion) {
    const full = tag.textContent;
    tag.textContent = "";
    let i = 0;
    const type = () => {
      if (i <= full.length) {
        tag.textContent = full.slice(0, i);
        i++;
        setTimeout(type, 26);
      }
    };
    setTimeout(type, 700);
  }

  /* ---------- Canvas: red de nodos ---------- */
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
  const ctx = canvas.getContext("2d");
  let W, H, dpr, nodes = [];

  const initCanvas = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(Math.floor((W * H) / 16000), 90);
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6,
    }));
  };

  let mouse = { x: -9999, y: -9999 };
  window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  const drawCanvas = () => {
    ctx.clearRect(0, 0, W, H);
    const LINK = 130;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      const dmx = n.x - mouse.x, dmy = n.y - mouse.y;
      const md = Math.hypot(dmx, dmy);
      if (md < 140 && md > 0.1) {
        n.x += (dmx / md) * 0.6;
        n.y += (dmy / md) * 0.6;
      }

      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const dx = n.x - m.x, dy = n.y - m.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK) {
          const a = (1 - d / LINK) * 0.16;
          ctx.strokeStyle = "rgba(201, 160, 82," + a.toFixed(3) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = "rgba(232, 236, 239, 0.5)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  let rafId;
  const loop = () => {
    drawCanvas();
    rafId = requestAnimationFrame(loop);
  };
  initCanvas();
  if (!reduceMotion) loop(); else drawCanvas();
  window.addEventListener("resize", () => { initCanvas(); if (reduceMotion) drawCanvas(); });

  // Pausar canvas fuera de viewport
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { if (!rafId && !reduceMotion) loop(); }
      else { cancelAnimationFrame(rafId); rafId = null; }
    });
  }).observe(canvas);
  }

  /* ---------- Tesis: palabras encendidas ---------- */
  const thesisText = document.getElementById("thesisText");
  let words = [];
  if (thesisText) {
    const text = thesisText.textContent.trim();
    thesisText.textContent = "";
    text.split(/\s+/).forEach((word, i, arr) => {
      const span = document.createElement("span");
      span.className = "w";
      span.textContent = word;
      thesisText.appendChild(span);
      words.push(span);
      if (i < arr.length - 1) thesisText.appendChild(document.createTextNode(" "));
    });
  }

  /* ---------- Reveals ---------- */
  // Dos mecanismos a propósito, porque cada uno cubre el punto ciego del otro:
  //
  // 1) IntersectionObserver: no depende de eventos de scroll. Cuando el
  //    elemento que scrollea no es el documento (basta un `overflow` en un
  //    ancestro), `window` no recibe ningún evento de scroll y todo el
  //    contenido se queda invisible para siempre. El observer sí dispara.
  // 2) Barrido por posición: un salto instantáneo — un ancla, un
  //    scrollIntoView — puede pasar una sección de "debajo" a "encima" sin que
  //    el ratio de intersección cambie nunca, y ahí el observer no dispara.
  let pending = Array.from(document.querySelectorAll("[data-reveal]"));
  const reveal = (el) => {
    el.classList.add("in-view");
    pending = pending.filter((p) => p !== el);
    io.unobserve(el);
  };
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) reveal(e.target); }),
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
  );
  pending.forEach((el) => io.observe(el));

  const revealPass = () => {
    if (!pending.length) return;
    const trigger = window.innerHeight * 0.85;
    pending.slice().forEach((el) => {
      if (el.getBoundingClientRect().top < trigger) reveal(el);
    });
  };

  /* ---------- Apertura: el scroll conduce el video ---------- */
  const opening = document.querySelector(".opening");
  const openingVideo = document.getElementById("openingVideo");
  const bands = Array.from(document.querySelectorAll(".band"));
  const cue = document.querySelector(".opening-cue");
  let videoDur = 0;

  // Pedir un seek nuevo mientras el anterior sigue en curso hace que el
  // navegador descarte la petición sin avisar: el video se queda clavado.
  // Guardamos el último objetivo y lo aplicamos cuando el seek termina.
  let objetivo = null;
  const buscar = (t) => {
    if (!openingVideo || !videoDur) return;
    objetivo = t;
    if (openingVideo.seeking) return;
    openingVideo.currentTime = objetivo;
  };

  if (openingVideo) {
    const noteDur = () => {
      if (openingVideo.duration && isFinite(openingVideo.duration)) {
        videoDur = openingVideo.duration;
        updateOpening();
      }
    };
    openingVideo.addEventListener("loadedmetadata", noteDur);
    let nudge = false;
    openingVideo.addEventListener("seeked", () => {
      if (objetivo !== null && Math.abs(openingVideo.currentTime - objetivo) > 0.05) {
        openingVideo.currentTime = objetivo;
        return;
      }
      // Un video pausado no siempre repinta su capa tras un seek: se queda
      // en negro aunque el fotograma esté decodificado. Un cambio mínimo de
      // transform obliga al compositor a redibujarlo.
      nudge = !nudge;
      openingVideo.style.transform = nudge ? "translateZ(0)" : "translateZ(0) scale(1.0001)";
    });
    noteDur();
    const listo = () => openingVideo.classList.add("listo");
    if (openingVideo.requestVideoFrameCallback) {
      // Solo mostramos el video cuando el navegador confirma que pintó un
      // fotograma. Si nunca ocurre, el póster de fondo queda visible.
      openingVideo.requestVideoFrameCallback(listo);
    } else {
      openingVideo.addEventListener("loadeddata", listo, { once: true });
    }
    openingVideo.play().then(() => openingVideo.pause()).catch(() => {});
  }

  const updateOpening = () => {
    if (!opening || !bands.length) return;
    const rect = opening.getBoundingClientRect();
    const total = opening.offsetHeight - window.innerHeight;
    const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;

    if (videoDur && !reduceMotion) buscar(p * videoDur);

    // Cada banda ocupa su tramo del recorrido
    const activa = Math.min(Math.floor(p * bands.length), bands.length - 1);
    bands.forEach((b, i) => b.classList.toggle("on", i === activa));
    if (cue) cue.classList.toggle("hide", p > 0.06);
  };

  /* ---------- Scroll unificado ---------- */
  const header = document.getElementById("siteHeader");
  const progressBar = document.getElementById("progressBar");
  const stack = document.querySelector(".stack");
  const layers = Array.from(document.querySelectorAll(".slayer"));
  const stackCaption = document.getElementById("stackCaption");
  const captions = [
    "01 · todo empieza en un lugar real donde ocurre la vida",
    "02 · la identidad conecta persona, hogar y profesionales",
    "03 · la información dispersa se vuelve una ruta visible",
    "04 · lo que se opera enseña; lo que se aprende mejora el nodo",
    "05 · cuando se verifica en varios sitios, es un estándar",
  ];

  let ticking = false;
  const onScroll = () => {
    // Fuera del rAF: en pestañas ocultas rAF no corre y el contenido
    // se quedaría invisible hasta que el usuario vuelva y haga scroll.
    revealPass();
    updateOpening();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight - vh;

      if (progressBar) progressBar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + "%";
      // Las páginas de solución nacen con el encabezado ya en estado "scrolled"
      if (header && !document.body.classList.contains("page-solution")) {
        header.classList.toggle("scrolled", y > 40);
      }

      // Tesis
      if (words.length) {
        const rect = thesisText.getBoundingClientRect();
        const start = vh * 0.85, end = vh * 0.3;
        const p = Math.min(Math.max((start - rect.top) / (start - end + rect.height), 0), 1);
        const lit = Math.floor(p * words.length);
        words.forEach((w, i) => w.classList.toggle("lit", i <= lit));
      }

      // Capital stack: ensamblaje por scroll dentro del track
      if (stack) {
        const rect = stack.getBoundingClientRect();
        const total = rect.height - vh;
        const p = Math.min(Math.max(-rect.top / total, 0), 1);
        const step = Math.floor(p * (layers.length + 0.9));
        layers.forEach((l) => {
          const idx = parseInt(l.dataset.layer, 10);
          l.classList.toggle("on", idx <= step);
        });
        if (stackCaption) {
          if (step >= 1 && step <= 5) stackCaption.textContent = captions[step - 1];
          else if (step > 5) stackCaption.textContent = "la doble hélice · nodo físico + capa digital";
        }
      }
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", onScroll);
  document.addEventListener("visibilitychange", onScroll);
  onScroll();

  /* ---------- Selector de perfil del mockup ---------- */
  const pvBtns = Array.from(document.querySelectorAll(".pv-btn"));
  if (pvBtns.length) {
    const screens = Array.from(document.querySelectorAll(".scr"));
    const copies = Array.from(document.querySelectorAll(".pc"));
    const show = (view) => {
      pvBtns.forEach((b) => {
        const on = b.dataset.view === view;
        b.classList.toggle("active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
      });
      screens.forEach((s) => s.classList.toggle("active", s.dataset.screen === view));
      copies.forEach((c) => c.classList.toggle("active", c.dataset.copy === view));
    };
    pvBtns.forEach((b) => b.addEventListener("click", () => show(b.dataset.view)));

    // Cada página de solución abre el mockup en su propio perfil
    const preset = document.querySelector(".product")?.dataset.default;
    if (preset) show(preset);
  }

  /* ---------- Magnéticos ---------- */
  if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.16 + "px," + (e.clientY - r.top - r.height / 2) * 0.2 + "px)";
      });
      btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
    });
  }
})();
