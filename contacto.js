/* Publica los datos de contacto solo cuando existen de verdad.
   Un teléfono que dice PENDIENTE es peor que no tener teléfono. */
(function () {
  "use strict";
  const D = window.DATOS || {};
  const real = (v) => v && v !== "PENDIENTE";


  // Identidad de empresa: Twilio, Meta y Google la exigen visible.
  // Cada campo aparece solo si tiene valor real — publicar
  // "PENDIENTE" es peor que no publicar nada.
  document.querySelectorAll("[data-identidad] [data-campo]").forEach(function (el) {
    var campo = el.dataset.campo;
    var v = D[campo];
    // El teléfono se guarda en formato E.164 para el enlace tel:,
    // pero se muestra como lo escribiría una persona.
    if (campo === "telefono" && real(D.telefonoVisible)) v = D.telefonoVisible;
    if (!real(v)) return;
    if (campo === "telefono" && real(D.telefono)) {
      el.querySelector(".ident-valor").innerHTML =
        '<a href="tel:' + D.telefono + '">' + v + '</a>';
    } else {
      el.querySelector(".ident-valor").textContent = v;
    }
    el.hidden = false;
  });

  const barra = document.querySelector("[data-contacto]");
  if (!barra) return;

  const piezas = [];
  if (real(D.whatsapp)) {
    piezas.push('<a class="cta-wa" href="https://wa.me/' + D.whatsapp +
      '" target="_blank" rel="noopener">Escribir por WhatsApp</a>');
  }
  if (real(D.telefono)) {
    piezas.push('<a class="cta-tel" href="tel:' + D.telefono + '">Llamar</a>');
  }
  if (piezas.length) barra.innerHTML = piezas.join("");
})();
