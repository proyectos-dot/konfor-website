/* Atribución de origen — primer toque y último toque.
   Captura por dónde llegó la persona (UTM, click IDs, referrer, landing) y
   lo adjunta como campos ocultos a todo formulario de la página.
   Sin cookies de terceros, sin fingerprinting: solo localStorage propio. */
(() => {
  const CLAVE = "konfor_atribucion_v1";
  const AHORA = new Date().toISOString();

  const params = new URLSearchParams(location.search);
  const leer = (k) => params.get(k) || "";

  // señales de la visita actual
  const toque = {
    utm_source: leer("utm_source"),
    utm_medium: leer("utm_medium"),
    utm_campaign: leer("utm_campaign"),
    utm_term: leer("utm_term"),
    utm_content: leer("utm_content"),
    gclid: leer("gclid"),       // Google Ads
    fbclid: leer("fbclid"),     // Meta
    ttclid: leer("ttclid"),     // TikTok
    referrer: document.referrer || "",
    landing: location.pathname + location.search,
    fecha: AHORA,
  };

  // clasificación de canal cuando no hay UTM
  const canalDe = (t) => {
    if (t.utm_source || t.gclid || t.fbclid || t.ttclid) {
      if (t.gclid) return "google-ads";
      if (t.fbclid) return "meta";
      if (t.ttclid) return "tiktok";
      return `${t.utm_source || "utm"}/${t.utm_medium || ""}`.replace(/\/$/, "");
    }
    if (!t.referrer) return "directo";
    try {
      const h = new URL(t.referrer).hostname;
      if (h.includes(location.hostname)) return "interno";
      if (/google\./.test(h)) return "google-organico";
      if (/facebook|instagram|fb\./.test(h)) return "meta-organico";
      if (/tiktok/.test(h)) return "tiktok-organico";
      if (/twitter|t\.co|x\.com/.test(h)) return "x-organico";
      if (/youtube/.test(h)) return "youtube";
      if (/linkedin/.test(h)) return "linkedin";
      if (/whatsapp|wa\.me/.test(h)) return "whatsapp";
      return `referido:${h}`;
    } catch { return "desconocido"; }
  };
  toque.canal = canalDe(toque);

  // primer toque se conserva; último toque solo lo actualiza una visita con
  // señal real (utm/click id o referrer externo) — modelo last non-direct:
  // volver directo o navegar dentro del sitio no borra la campaña que trajo
  let reg;
  try { reg = JSON.parse(localStorage.getItem(CLAVE) || "null"); } catch { reg = null; }
  const traeSenal = toque.canal !== "interno" && toque.canal !== "directo";
  if (!reg) {
    reg = { primero: toque, ultimo: toque, visitas: 1 };
  } else {
    reg.visitas = (reg.visitas || 1) + 1;
    if (traeSenal) reg.ultimo = toque;
  }
  try { localStorage.setItem(CLAVE, JSON.stringify(reg)); } catch {}

  // adjuntar a todos los formularios como campos ocultos
  const plano = {
    canal: reg.ultimo.canal,
    primer_canal: reg.primero.canal,
    primer_toque: reg.primero.fecha,
    utm_source: reg.ultimo.utm_source,
    utm_medium: reg.ultimo.utm_medium,
    utm_campaign: reg.ultimo.utm_campaign,
    utm_term: reg.ultimo.utm_term,
    utm_content: reg.ultimo.utm_content,
    gclid: reg.ultimo.gclid,
    fbclid: reg.ultimo.fbclid,
    ttclid: reg.ultimo.ttclid,
    referrer: reg.ultimo.referrer,
    landing: reg.primero.landing,
    pagina_envio: location.pathname,
    visitas: String(reg.visitas),
  };
  const poblar = () => {
    document.querySelectorAll("form").forEach((f) => {
      for (const [k, v] of Object.entries(plano)) {
        if (!v) continue;
        let campo = f.querySelector(`input[name="${k}"]`);
        if (!campo) {
          campo = document.createElement("input");
          campo.type = "hidden"; campo.name = k;
          f.appendChild(campo);
        }
        campo.value = v;
      }
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", poblar);
  else poblar();
})();
