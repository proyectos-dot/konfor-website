/* Envío de formularios al CRM (Company OS).
   POST JSON a /api/v1/public/leads con la atribución que atribucion.js dejó
   en campos ocultos. Éxito → gracias.html. Fallo → el teléfono como respaldo:
   una cita no se pierde porque un servidor esté caído. */
(() => {
  const ENDPOINT = "https://konfor-company-os.onrender.com/api/v1/public/leads";
  const RESPALDO_TEL = "tel:+18092215566";

  const enviar = async (form) => {
    const datos = Object.fromEntries(new FormData(form).entries());
    const cuerpo = {
      name: (datos.nombre || "").trim(),
      phone: (datos.telefono || "").trim(),
      intent: "cliente",
      consent: true, // el texto junto al botón declara el uso del dato
      message: `Formulario ${datos.pagina_envio || location.pathname}`,
      source_detail: datos.canal || "",
      submission_id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
      website: datos.website || "", // honeypot: si un bot lo llenó, el servidor rechaza
      utm_source: datos.utm_source || "",
      utm_medium: datos.utm_medium || "",
      utm_campaign: datos.utm_campaign || "",
      utm_term: datos.utm_term || "",
      utm_content: datos.utm_content || "",
      gclid: datos.gclid || "",
      fbclid: datos.fbclid || "",
      ttclid: datos.ttclid || "",
      referrer: datos.referrer || "",
      landing_page: datos.landing || "",
    };
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": cuerpo.submission_id },
      body: JSON.stringify(cuerpo),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };

  document.addEventListener("submit", async (ev) => {
    const form = ev.target;
    if (!(form instanceof HTMLFormElement) || !form.classList.contains("forma")) return;
    ev.preventDefault();
    const boton = form.querySelector('button[type="submit"]');
    const texto = boton ? boton.textContent : "";
    if (boton) { boton.disabled = true; boton.textContent = "Enviando…"; }
    try {
      await enviar(form);
      location.href = "gracias.html";
    } catch {
      if (boton) { boton.disabled = false; boton.textContent = texto; }
      let aviso = form.querySelector(".forma-aviso");
      if (!aviso) {
        aviso = document.createElement("p");
        aviso.className = "nota forma-aviso";
        aviso.setAttribute("role", "alert");
        aviso.style.marginTop = ".8rem";
        form.appendChild(aviso);
      }
      aviso.innerHTML = `No se pudo enviar. Llámanos directo: <a href="${RESPALDO_TEL}" style="text-decoration:underline">(809) 221-5566</a>`;
    }
  });
})();
