# PAIC — Plataforma de Administración Inteligente de Copropiedades

Estos son 4 archivos HTML (index.html, cobro.html, tareas.html, informes.html) con estilos compartidos y un pequeño efecto en Three.js para el fondo de las secciones hero.

Qué hice:
- `index.html` — Página principal con imagen `assets/paic_home.png` y video embebido.
- `cobro.html` — Página de cobro con `assets/paic_mora.png`.
- `tareas.html` — Página de tareas con `assets/paic_tareas.png`.
- `informes.html` — Página de informes con `assets/paic_informe.png`.
 - `index.html` — Página principal con imagen `assets/paic_home.png` y video embebido.
 - `cobro.html` — Página de cobro con `assets/paic_mora.png`.
 - `tareas.html` — Página de tareas con `assets/paic_tareas.png`.
 - `informes.html` — Página de informes con `assets/paic_informe.png`.
 - `assets/Logo-PAIC.png` — Logo que se integra en el header de todas las páginas.
- `css/styles.css` — Estilos compartidos, variables de color según la paleta.
- `js/main.js` — Script que crea un efecto de partículas usando Three.js (CDN import in the HTML files).

Instrucciones rápidas:
1. Crea una carpeta `assets/` en la raíz y coloca las imágenes con los nombres indicados: `paic_home.png`, `paic_mora.png`, `paic_tareas.png`, `paic_informe.png`.
	Añade también `Logo-PAIC.png` con el logotipo para que aparezca en el header.
2. Abre `index.html` en el navegador (doble clic o "Abrir con" -> navegador) para ver la página principal. Las otras páginas están enlazadas entre sí.

Notas:
- El script usa Three.js desde un CDN. Si prefieres instalar dependencias locales, cambia el import por un build local.
- Ajustes recomendados: optimizar imágenes (WebP) y revisar accesibilidad y textos finales.
