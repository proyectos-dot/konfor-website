/* KONFOR — motor inmersivo (sin dependencias) */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => setTimeout(() => preloader.classList.add("done"), 700));
  setTimeout(() => preloader.classList.add("done"), 2800);

  /* ---------- Reloj del hero ---------- */
  const clock = document.getElementById("heroClock");
  const tickClock = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    clock.textContent = "SDQ " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + " AST";
  };
  tickClock();
  setInterval(tickClock, 1000);

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

  /* ---------- Canvas: red de nodos / capas de capital ---------- */
  const canvas = document.getElementById("heroCanvas");
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
          ctx.strokeStyle = "rgba(255, 90, 31," + a.toFixed(3) + ")";
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
  // Revelado por posición, no por IntersectionObserver: un salto instantáneo
  // (ancla, scroll brusco) puede llevar una sección de "debajo" a "encima" sin
  // que el ratio de intersección cambie nunca, y el observer jamás dispara.
  let pending = Array.from(document.querySelectorAll("[data-reveal]"));
  const revealPass = () => {
    if (!pending.length) return;
    const trigger = window.innerHeight * 0.85;
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top >= trigger) return true;
      el.classList.add("in-view");
      return false;
    });
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
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const docH = document.documentElement.scrollHeight - vh;

      progressBar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + "%";
      header.classList.toggle("scrolled", y > 40);

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
        if (step >= 1 && step <= 5) stackCaption.textContent = captions[step - 1];
        else if (step > 5) stackCaption.textContent = "la doble hélice · nodo físico + capa digital";
      }
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("load", onScroll);
  document.addEventListener("visibilitychange", onScroll);
  onScroll();

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
