# KONFOR — Sitio web

Experiencia de scroll inmersiva para **KONFOR**, sistema de continuidad humana. Sin dependencias, sin build: HTML, CSS y JavaScript nativo.

## Correr en local

```bash
python3 -m http.server 4802 -d .
```

Luego abrir `http://localhost:4802`.

## Estructura

| Archivo | Qué contiene |
|---|---|
| `index.html` | Ocho movimientos: hero, tesis, doble hélice, circuito mínimo, límites, nodos, personas, método y contacto |
| `styles.css` | Sistema visual completo |
| `main.js` | Canvas de red de nodos, ensamblaje del stack por scroll, revelados, iluminación de la tesis |
| `assets/` | Renders de los nodos físicos |

## Sistema visual — "Obsidiana & Oro"

- **Obsidiana** `#070a14` / `#0a0e1c` — el sitio entero vive en oscuro
- **Oro** `#c9a052` — acentos en itálica y una sola llamada a la acción por pantalla
- Tipografía: **Fraunces** (títulos, editorial) + **Space Grotesk** (UI) + **IBM Plex Mono** (etiquetas técnicas)

## La pieza central: la sección de límites

`#limites` publica la tabla "KONFOR no es / KONFOR busca ser" y admite en texto que el sistema todavía no opera como una sola red clínica y comercial demostrada.

Eso es deliberado y no debe suavizarse. El *Contexto Maestro 360°* identifica el reto de marca así: el problema no es parecer más grande, sino que la superficie pública tenga la misma disciplina de evidencia que los documentos internos. La honestidad sobre los límites **es** el posicionamiento — "una institución serena que sabe hasta dónde llega".

## Reglas de contenido (no negociables)

1. **No afirmar que la capa clínica o digital ya opera.** No existe evidencia pública de ello. Usar "proyectado", "en estructuración", "en diseño".
2. **Verbos de coordinación**: organizar, conectar, preparar, acompañar, verificar, escalar. **Nunca** verbos de omnisciencia: predecir, evitar, curar, garantizar, controlar.
3. **Nombrar primero la fricción humana**, explicar después la tecnología.
4. **No infantilizar, no medicalizar la vivienda, no romantizar la vejez.** La persona es sujeto de decisión, no fuente de datos.
5. **Sin lenguaje de oferta de valores ni de rendimiento** (Ley 249-17). El multiplicador refiere compradores; no capta inversión.
6. **El motor no se muestra.** Modelos, algoritmos y bases de datos no entran en ningún data room ni en la web.

## Verificado

Consola sin errores, sin desbordes horizontales de 375px a 1440px, los 26 elementos revelables aparecen incluso navegando por anclas o con la pestaña en segundo plano, y el ensamblaje del stack responde correctamente al scroll.

## Pendiente de confirmar con la dirección

- Datos de contacto reales y dominio definitivo.
- Si se abre una vía de acceso al data room desde la web, debe quedar detrás de NDA y fuera del circuito público.
