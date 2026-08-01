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
| `index.html` | Portada: tesis, doble hélice, circuito mínimo, selector de soluciones, familia de nodos, nodos en obra, límites, método y contacto |
| `soluciones/medicos.html` | Segmento médico: diagnóstico de la captura de valor, la posición ofrecida, el activo clínico y los límites |
| `soluciones/familias.html` | Segmento familia y diáspora, con video |
| `soluciones/desarrolladores.html` | KOSD: los tres niveles de certificación, el contrato y las objeciones |
| `styles.css` | Sistema visual completo, incluido el de las páginas de solución |
| `main.js` | Compartido por todas las páginas. Todo lo del hero va condicionado, porque las páginas de solución no tienen canvas, preloader ni reloj |
| `assets/` · `assets/video/` | Renders de los nodos y videos comprimidos para web |

## Arquitectura de navegación

La portada explica el sistema. Cada segmento tiene su propia página con su propio
diagnóstico, su propia promesa y sus propios límites — el modelo de una plataforma
que se organiza por industria y caso de uso, no por catálogo de funciones.

`Sistema · Médicos · Familias · Desarrolladores · Nodos`

**La página de desarrolladores es la pieza que faltaba.** Es la que convierte a
KONFOR de "otro proyecto inmobiliario" en "el estándar bajo el que otros
construyen". Sin ella no hay red: solo hay nodos propios.

## Versionado de assets

`styles.css` y `main.js` se referencian con `?v=AAAAMMDD`. **Al desplegar un
cambio hay que subir esa fecha en todos los HTML**, o los navegadores servirán la
versión anterior desde caché. Es exactamente el fallo que apareció al construir
las páginas de solución: el HTML nuevo cargaba el JavaScript viejo.

```bash
cd ~/Desktop/konfor-website && grep -rl 'v=2026' --include=*.html . | xargs sed -i '' 's/v=20260801/v=NUEVAFECHA/g'
```

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
