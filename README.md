# CV de Filosofía — Steven Vallejo Ortiz

Sitio estático bilingüe (ES por defecto · EN por toggle) para el CV de **Filosofía / Lógica formal** de Steven Vallejo Ortiz.

Filósofo de formación analítica (Universidad de Antioquia). Lógica formal y simbólica, epistemología, filosofía de la mente y de la IA, ética. Autor del lenguaje de lógica formal ejecutable **ST** y del blog **«Abstracción»**.

## Stack

Sitio 100% estático, sin paso de build y sin riesgo de compilación:

- `index.html` — página única, contenido ES + EN embebido (alternado por CSS/JS). Cabecera con secciones, accesos al ecosistema (Inicio, CV Informático, Blog Scholḗ, Servicios) y WhatsApp.
- `styles.css` — estética Paideía: noche `#0b1417`, crema `#e8e0d4`, oro `#e0a85e`, teal, violeta y terracota; Cormorant Garamond + EB Garamond (griego) + Inter + JetBrains Mono; grano de película, § por sección, botones píldora.
- `graph.js` — constelación de conceptos filosóficos en canvas 2D (sin dependencias): esfera de ideas en griego y símbolos lógicos, anillos armilares e hilos de seda; cambia de posición, color y cúmulo según la sección. Calidad adaptativa y estática con `prefers-reduced-motion`.
- `app.js` — toggle ES/EN (localStorage, `?lang=en`, `/en`), preloader de sesión, revelados, título por letras, palabras que se iluminan, Áreas fijas y carril horizontal de Temas en escritorio, cinta, contadores, cursor. Sin JS todo el contenido queda visible.
- `public/pdf/` — `CV_filo_es.pdf` y `CV_filo_en.pdf` para descarga.
- `vercel.json` — `cleanUrls`, redirección `/en → /?lang=en`, headers de seguridad y de PDF.
- `robots.txt`, `sitemap.xml` — SEO.

SEO: `<title>`, `meta description`/`keywords`, Open Graph y **JSON-LD `schema.org/Person`** (`jobTitle: "Philosopher / Logician"`, `knowsAbout` filosófico) en el `<head>`.

## Desarrollo local

```bash
npx --yes serve@14 -l 4321 .
# o cualquier servidor estático
python3 -m http.server 4321
```

Abrir http://localhost:4321 — la versión EN en http://localhost:4321/?lang=en

## Deploy en Vercel

Es un sitio estático: Vercel lo sirve sin build.

```bash
# desde /workspace/cv-filosofo
vercel        # preview
vercel --prod # producción
```

No requiere variables de entorno, base de datos ni framework. "Build Command" vacío, "Output Directory" = raíz (`.`).
