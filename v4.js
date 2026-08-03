/* ════════════════════════════════════════════════════════════
   KONFOR · V4 — motor de experiencia
   Vanilla JS, sin dependencias. Todo se apaga con
   prefers-reduced-motion.
   ════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tactil = window.matchMedia("(hover: none)").matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, mn, mx) => Math.min(mx, Math.max(mn, v));

  /* ── Preloader ──────────────────────────────────────────── */
  const preloader = $("#preloader");
  const preNum = $("#preloader-num");
  const preFill = $("#preloader-fill");
  if (preloader) {
    document.body.classList.add("sin-scroll");
    const qa = location.search.includes("qa");
    let carga = 0;
    const paso = () => {
      carga = qa ? 100 : Math.min(100, carga + Math.random() * 14 + 4);
      if (preNum) preNum.textContent = String(Math.floor(carga)).padStart(2, "0");
      if (preFill) preFill.style.width = carga + "%";
      if (carga < 100) { setTimeout(paso, 90 + Math.random() * 140); }
      else {
        setTimeout(() => {
          preloader.classList.add("listo");
          document.body.classList.remove("sin-scroll");
          iniciarScramble();
          iniciarContadoresHero();
          if (location.hash) {
            const dest = $(location.hash);
            if (dest) { dest.scrollIntoView({ behavior: "instant", block: "start" }); barrido(); }
          }
        }, quieto || qa ? 0 : 350);
      }
    };
    paso();
  } else {
    iniciarScramble();
    iniciarContadoresHero();
  }

  /* ── Año y reloj Santo Domingo ──────────────────────────── */
  const anioEl = $("#anio");
  if (anioEl) anioEl.textContent = new Date().getFullYear();
  const reloj = $("#reloj");
  if (reloj) {
    const fmt = new Intl.DateTimeFormat("es-DO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Santo_Domingo" });
    const latir = () => { reloj.textContent = "SDO " + fmt.format(new Date()); };
    latir(); setInterval(latir, 20000);
  }

  /* ── Cabecera ───────────────────────────────────────────── */
  const cabecera = $("#cabecera");
  if (cabecera) {
    const posar = () => cabecera.classList.toggle("posada", scrollY > 60);
    posar(); addEventListener("scroll", posar, { passive: true });
  }

  /* ── Cursor + magnéticos ────────────────────────────────── */
  if (!tactil && !quieto) {
    const cursor = $("#cursor");
    const punto = $(".cursor-punto");
    const anillo = $(".cursor-anillo");
    const texto = $(".cursor-texto");
    let mx = innerWidth / 2, my = innerHeight / 2, ax = mx, ay = my;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    addEventListener("mousedown", () => cursor.classList.add("presion"));
    addEventListener("mouseup", () => cursor.classList.remove("presion"));
    (function cicloCursor() {
      ax = lerp(ax, mx, 0.16); ay = lerp(ay, my, 0.16);
      punto.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      anillo.style.transform = `translate(${ax}px, ${ay}px) translate(-50%,-50%)`;
      requestAnimationFrame(cicloCursor);
    })();

    $$("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => { texto.textContent = el.dataset.cursor; cursor.classList.add("activo"); });
      el.addEventListener("mouseleave", () => cursor.classList.remove("activo"));
    });

    /* Botones magnéticos */
    $$("[data-magnet]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.1}px, ${dy * 0.14}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ── Scramble del titular ───────────────────────────────── */
  const GLIFOS = "KONFOR·▮▯01#/\\|—";
  const scramble = (el, retardo = 0) => {
    const final = el.textContent;
    if (quieto) return;
    let marco = 0;
    const total = 26;
    setTimeout(() => {
      const tick = () => {
        marco++;
        const resueltos = Math.floor((marco / total) * final.length);
        el.textContent = final.slice(0, resueltos) +
          final.slice(resueltos).replace(/[^\s]/g, () => GLIFOS[Math.floor(Math.random() * GLIFOS.length)]);
        if (marco < total) requestAnimationFrame(tick);
        else el.textContent = final;
      };
      tick();
    }, retardo);
  };
  function iniciarScramble() {
    $$("[data-scramble]").forEach((el) => scramble(el, Number(el.dataset.retardo || 0)));
  }

  /* ── Revelados ──────────────────────────────────────────── */
  $$("[data-retardo]").forEach((el) => el.style.setProperty("--retardo", el.dataset.retardo + "ms"));
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  /* Barrido de respaldo: el observador no dispara para lo que ya
     está en pantalla al cargar (anclas, pestaña en segundo plano).
     Lección heredada del sitio oficial — no quitar. */
  const barrido = () => {
    const h = innerHeight;
    $$("[data-reveal]").forEach((el) => {
      if (el.classList.contains("visto")) return;
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.9 && r.bottom > 0) el.classList.add("visto");
    });
  };
  barrido();
  addEventListener("scroll", barrido, { passive: true });
  addEventListener("resize", barrido);
  setTimeout(barrido, 600);

  /* ── Contadores ─────────────────────────────────────────── */
  const formato = (n) => n.toLocaleString("es-DO");
  const animarContador = (el) => {
    const fin = Number(el.dataset.contador);
    if (quieto || fin === 0) { el.textContent = formato(fin); return; }
    const t0 = performance.now(), dur = 1800;
    const pasoC = (t) => {
      const p = clamp((t - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = formato(Math.round(fin * e));
      if (p < 1) requestAnimationFrame(pasoC);
    };
    requestAnimationFrame(pasoC);
  };
  function iniciarContadoresHero() { $$(".hero [data-contador]").forEach(animarContador); }
  const ioCont = new IntersectionObserver((ents) => {
    ents.forEach((e) => { if (e.isIntersecting) { animarContador(e.target); ioCont.unobserve(e.target); } });
  }, { threshold: 0.4 });
  $$(".cifras [data-contador]").forEach((el) => ioCont.observe(el));

  /* ── Declaración: palabras que se encienden con el scroll ── */
  const declaracion = $("#declaracion");
  if (declaracion) {
    const claves = ["cuidar", "cuando", "solo?"];
    declaracion.innerHTML = declaracion.textContent.trim().split(/\s+/)
      .map((p) => `<span class="palabra${claves.includes(p.toLowerCase()) ? " clave" : ""}">${p}</span>`).join(" ");
    const palabras = $$(".palabra", declaracion);
    const encender = () => {
      const r = declaracion.getBoundingClientRect();
      const avance = clamp((innerHeight * 0.82 - r.top) / (innerHeight * 0.75), 0, 1);
      const hasta = Math.floor(avance * palabras.length);
      palabras.forEach((p, i) => p.classList.toggle("encendida", i < hasta));
    };
    encender();
    addEventListener("scroll", encender, { passive: true });
  }

  /* ── Tilt de tarjetas ───────────────────────────────────── */
  if (!tactil && !quieto) {
    $$("[data-tilt], [data-tilt-suave]").forEach((el) => {
      const suave = el.hasAttribute("data-tilt-suave");
      const limite = suave ? 2 : 4.5;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", px * 100 + "%");
        el.style.setProperty("--my", py * 100 + "%");
        el.style.transform = `rotateY(${(px - 0.5) * limite}deg) rotateX(${(0.5 - py) * limite}deg)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ── Red de partículas (hero + cierre) ──────────────────── */
  function red(canvas, densidad = 22000) {
    const ctx = canvas.getContext("2d");
    let w, h, puntos = [];
    let raton = { x: -9999, y: -9999 };
    const medir = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = r.width * devicePixelRatio;
      h = canvas.height = r.height * devicePixelRatio;
      const n = Math.floor((r.width * r.height) / densidad);
      puntos = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.1 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.1 * devicePixelRatio,
        r: (Math.random() * 1.4 + 0.6) * devicePixelRatio
      }));
    };
    medir();
    addEventListener("resize", medir);
    canvas.parentElement.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      raton.x = (e.clientX - r.left) * devicePixelRatio;
      raton.y = (e.clientY - r.top) * devicePixelRatio;
    }, { passive: true });
    canvas.parentElement.addEventListener("mouseleave", () => { raton.x = -9999; raton.y = -9999; });

    const enlace = 130 * devicePixelRatio;
    let visible = true;
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(canvas);

    (function ciclo() {
      requestAnimationFrame(ciclo);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of puntos) {
        const dx = p.x - raton.x, dy = p.y - raton.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22000 * devicePixelRatio) { p.vx += dx * 0.000012; p.vy += dy * 0.000012; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(232, 200, 122, 0.38)";
        ctx.fill();
      }
      for (let i = 0; i < puntos.length; i++) {
        for (let j = i + 1; j < puntos.length; j++) {
          const a = puntos[i], b = puntos[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < enlace) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(201, 162, 75, ${(1 - d / enlace) * 0.09})`;
            ctx.lineWidth = devicePixelRatio * 0.6;
            ctx.stroke();
          }
        }
      }
    })();
  }
  if (!quieto) {
    const redHero = $("#red");
    const redCierre = $("#red-cierre");
    if (redHero) red(redHero);
    if (redCierre) red(redCierre, 26000);
  }

  /* ── Gráfica de signos (simulación) ─────────────────────── */
  const signos = $("#signos");
  if (signos) {
    const ctx = signos.getContext("2d");
    let w, h;
    const medir = () => {
      const r = signos.getBoundingClientRect();
      w = signos.width = r.width * devicePixelRatio;
      h = signos.height = 180 * devicePixelRatio;
    };
    medir(); addEventListener("resize", medir);
    let t = 0;
    const onda = (x) =>
      Math.sin(x * 0.02 + t * 0.03) * 0.22 +
      Math.sin(x * 0.055 + t * 0.021) * 0.1 +
      Math.sin(x * 0.011 + t * 0.008) * 0.3;
    let visibleS = true;
    new IntersectionObserver((en) => { visibleS = en[0].isIntersecting; }).observe(signos);
    (function cicloS() {
      requestAnimationFrame(cicloS);
      if (!visibleS) return;
      t += 0.55;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(245,243,238,0.05)";
      ctx.lineWidth = 1;
      for (let g = 1; g < 4; g++) {
        ctx.beginPath(); ctx.moveTo(0, (h / 4) * g); ctx.lineTo(w, (h / 4) * g); ctx.stroke();
      }
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(201,162,75,0.1)");
      grad.addColorStop(0.5, "rgba(232,200,122,0.95)");
      grad.addColorStop(1, "rgba(201,162,75,0.35)");
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = h * 0.5 + onda(x) * h * 0.5;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6 * devicePixelRatio;
      ctx.shadowColor = "rgba(232,200,122,0.7)";
      ctx.shadowBlur = 9 * devicePixelRatio;
      ctx.stroke();
      ctx.shadowBlur = 0;
      const px = w * 0.72;
      const py = h * 0.5 + onda(px) * h * 0.5;
      ctx.beginPath(); ctx.arc(px, py, 4 * devicePixelRatio, 0, Math.PI * 2);
      ctx.fillStyle = "#e8c87a"; ctx.fill();
    })();

    /* Métricas que respiran */
    const ritmo = $("#m-ritmo"), presion = $("#m-presion"), sueno = $("#m-sueno");
    setInterval(() => {
      if (!visibleS) return;
      ritmo.textContent = 70 + Math.floor(Math.random() * 6);
      presion.textContent = `${116 + Math.floor(Math.random() * 6)}/${74 + Math.floor(Math.random() * 5)}`;
      sueno.textContent = (7 + Math.random() * 0.5).toFixed(1) + "h";
    }, 4200);
  }

  /* ── Nodos: pista horizontal ligada al scroll ───────────── */
  const seccionNodos = $("#nodos");
  const pista = $("#nodos-pista");
  if (seccionNodos && pista) {
    const ajustar = () => {
      if (innerWidth < 820 || quieto) {
        seccionNodos.style.height = "";
        pista.style.transform = "";
        pista.style.overflowX = "auto";
        pista.parentElement.style.overflowX = "auto";
        return;
      }
      const recorrido = pista.scrollWidth - innerWidth + parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--margen")) * 2;
      seccionNodos.style.height = (innerHeight + recorrido * 1.1) + "px";
    };
    ajustar();
    addEventListener("resize", ajustar);
    const deslizar = () => {
      if (innerWidth < 820 || quieto) return;
      const r = seccionNodos.getBoundingClientRect();
      const total = r.height - innerHeight;
      const avance = clamp(-r.top / total, 0, 1);
      const recorrido = pista.scrollWidth - innerWidth + 96;
      pista.style.transform = `translateX(${-avance * recorrido}px)`;
    };
    deslizar();
    addEventListener("scroll", deslizar, { passive: true });
  }

  /* ── Parallax ───────────────────────────────────────────── */
  if (!quieto) {
    const capas = $$("[data-parallax]");
    const fondos = $$("[data-parallax-fondo]");
    const mover = () => {
      for (const el of capas) {
        const r = el.getBoundingClientRect();
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `scale(1.05) translateY(${p * -13}px)`;
      }
      for (const el of fondos) {
        const r = el.parentElement.getBoundingClientRect();
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translateY(${p * 32}px)`;
      }
    };
    mover();
    addEventListener("scroll", mover, { passive: true });
  }

  /* ── Explorador de cuerpo (Salud) ───────────────────────── */
  const cuerpoImg = $("#cuerpo-img");
  if (cuerpoImg) {
    const titulo = $("#cuerpo-titulo");
    const texto = $("#cuerpo-texto");
    const dato = $("#cuerpo-dato");
    const botones = $$("[data-organo]");
    const datos = {
      todos:        { img: "assets/cuerpo-todos.jpg",        t: "Tu cuerpo, por dentro", x: "Cada estudio que te haces deja de ser un PDF frío: se convierte en tu propio cuerpo, que ves y entiendes.", d: "41 BIOMARCADORES LEÍDOS" },
      corazon:      { img: "assets/cuerpo-corazon.jpg",      t: "Corazón", x: "Ecocardiograma normal. El corazón no es el problema hoy — es lo que hay que proteger para los próximos 30 años.", d: "EN RANGO · ECO 2026" },
      higado:       { img: "assets/cuerpo-higado.jpg",       t: "Hígado", x: "Esteatosis grado II. El hígado envejece más rápido que tú. Es el primer frente del protocolo: nutrición y movimiento, no pastillas.", d: "A VIGILAR · GGT 63.4" },
      sangre:       { img: "assets/cuerpo-sangre.jpg",       t: "Sangre", x: "LDL 157, triglicéridos 237. La curva se sale, y por eso se ve a tiempo: antes de que tenga nombre de evento.", d: "FUERA DE RANGO · LDL 157" },
      rinones:      { img: "assets/cuerpo-rinones.jpg",      t: "Riñones", x: "Filtrado 135, estadio G1. Funcionan bien. El sistema los vigila para que sigan así.", d: "EN RANGO · eTFG 135" },
      metabolismo:  { img: "assets/cuerpo-metabolismo.jpg",  t: "Metabolismo", x: "A1c 5.82: en el límite. Todavía no es diabetes. Es exactamente el momento en que la prevención funciona.", d: "LÍMITE · A1c 5.82" },
      digestivo:    { img: "assets/cuerpo-digestivo.jpg",    t: "Sistema digestivo", x: "Sangre oculta por cerrar. Nada grave detectado, pero el protocolo no lo deja pasar: cierra en 30 días.", d: "POR CONFIRMAR" },
      hepatorenal:  { img: "assets/cuerpo-hepatorenal.jpg",  t: "Eje hepato-renal", x: "Hígado y riñón se leen juntos. Lo que uno procesa, el otro lo filtra. Por eso el protocolo ataca los dos a la vez.", d: "VISTA COMBINADA" }
    };
    botones.forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.organo;
      const d = datos[k];
      if (!d) return;
      botones.forEach((x) => x.classList.toggle("activo", x === b));
      cuerpoImg.style.opacity = 0;
      setTimeout(() => {
        cuerpoImg.src = d.img;
        cuerpoImg.onload = () => { cuerpoImg.style.opacity = 1; };
      }, quieto ? 0 : 260);
      if (titulo) titulo.textContent = d.t;
      if (texto) texto.textContent = d.x;
      if (dato) dato.textContent = d.d;
    }));
  }

  /* ── Reveal de edad biológica ───────────────────────────── */
  const edadNum = $("#edad-num");
  if (edadNum) {
    const meta = parseFloat(edadNum.dataset.edad || "48.2");
    const inicio = parseFloat(edadNum.dataset.desde || "62");
    const ioEdad = new IntersectionObserver((en) => {
      if (!en[0].isIntersecting) return;
      ioEdad.disconnect();
      if (quieto) { edadNum.textContent = meta.toFixed(1); return; }
      const t0 = performance.now(), dur = 2400;
      const pasoE = (t) => {
        const p = clamp((t - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - p, 4);
        edadNum.textContent = (inicio + (meta - inicio) * e).toFixed(1);
        if (p < 1) requestAnimationFrame(pasoE);
      };
      requestAnimationFrame(pasoE);
    }, { threshold: 0.5 });
    ioEdad.observe(edadNum);
  }

  /* ── Travesía: hitos que se encienden con el scroll ─────── */
  const travesia = $("#travesia");
  if (travesia) {
    const hitos = $$("[data-hito]", travesia);
    const imgT = $(".travesia-img img", travesia);
    const marcarHitos = () => {
      const r = travesia.getBoundingClientRect();
      const avance = clamp((innerHeight * 0.7 - r.top) / r.height, 0, 1);
      hitos.forEach((h, i) => {
        h.classList.toggle("encendido", avance >= (i + 0.5) / hitos.length);
      });
      if (imgT && !quieto) imgT.style.transform = `scale(1.07) translateY(${(avance - 0.5) * -16}px)`;
    };
    marcarHitos();
    addEventListener("scroll", marcarHitos, { passive: true });
  }

  /* ── Chat WhatsApp (Familias) ───────────────────────────── */
  const chat = $("#chat");
  if (chat) {
    const mensajes = $$("[data-msg]", chat);
    mensajes.forEach((m) => m.classList.add("msg-oculto"));
    const ioChat = new IntersectionObserver((en) => {
      if (!en[0].isIntersecting) return;
      ioChat.disconnect();
      mensajes.forEach((m, i) => {
        setTimeout(() => m.classList.add("msg-entra"), quieto ? 0 : 500 + i * 900);
      });
    }, { threshold: 0.3 });
    ioChat.observe(chat);
  }

  /* ── Feed de señales (Médicos) ──────────────────────────── */
  const feed = $("#feed-senales");
  if (feed && !quieto) {
    const items = $$(".feed-item", feed);
    let actualFeed = 0;
    setInterval(() => {
      if (!feed.getBoundingClientRect || feed.getBoundingClientRect().top > innerHeight) return;
      items[actualFeed].classList.remove("destacado");
      actualFeed = (actualFeed + 1) % items.length;
      items[actualFeed].classList.add("destacado");
    }, 4500);
  }

  /* ── Anillos que se dibujan ─────────────────────────────── */
  $$("[data-anillo]").forEach((svg) => {
    const arco = $("circle[data-arco]", svg);
    if (!arco) return;
    const pct = parseFloat(svg.dataset.anillo);
    const r = parseFloat(arco.getAttribute("r"));
    const c = 2 * Math.PI * r;
    arco.style.strokeDasharray = c;
    arco.style.strokeDashoffset = c;
    const ioA = new IntersectionObserver((en) => {
      if (!en[0].isIntersecting) return;
      ioA.disconnect();
      arco.style.transition = quieto ? "none" : "stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1)";
      requestAnimationFrame(() => { arco.style.strokeDashoffset = c * (1 - pct / 100); });
    }, { threshold: 0.4 });
    ioA.observe(svg);
  });

  /* ── Progreso + riel de capítulos ───────────────────────── */
  const progresoFill = $("#progreso-fill");
  const rielNum = $("#riel-num");
  const rielNombre = $("#riel-nombre");
  const rielFill = $("#riel-fill");
  const capitulos = $$("[data-capitulo-id]");
  const medirProgreso = () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    const p = clamp(scrollY / total, 0, 1);
    if (progresoFill) progresoFill.style.width = p * 100 + "%";
    if (rielFill) rielFill.style.height = p * 100 + "%";
    let actual = { id: "00", nombre: "LLEGADA" };
    for (const c of capitulos) {
      const r = c.getBoundingClientRect();
      if (r.top < innerHeight * 0.5) actual = { id: c.dataset.capituloId, nombre: c.dataset.capituloNombre };
    }
    if (rielNum && rielNum.textContent !== actual.id) {
      rielNum.textContent = actual.id;
      rielNombre.textContent = actual.nombre;
    }
  };
  /* ── Gaveta de acceso ───────────────────────────────────── */
  const gaveta = $("#gaveta");
  if (gaveta) {
    const abrir = () => document.body.classList.add("gaveta-abierta");
    const cerrar = () => document.body.classList.remove("gaveta-abierta");
    $$("[data-gaveta]").forEach((b) => b.addEventListener("click", abrir));
    $$("[data-gaveta-cerrar]").forEach((b) => b.addEventListener("click", cerrar));
    addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
    $$("a", gaveta).forEach((a) => a.addEventListener("click", cerrar));
  }

  medirProgreso();
  addEventListener("scroll", medirProgreso, { passive: true });
})();
