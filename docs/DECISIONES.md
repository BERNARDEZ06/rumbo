# Decisiones

Cada decisión se explica en una o dos frases. Las más recientes van al final.

| # | Fecha | Decisión | Por qué |
|---|---|---|---|
| 1 | 2026-09-28 | **React + Vite + TypeScript + Tailwind** | Es la combinación más usada hoy: rápida, con mucha documentación y con buenos resultados visuales. TypeScript detecta muchos errores antes de que lleguen a la app. |
| 2 | 2026-09-28 | **IndexedDB mediante Dexie** | IndexedDB guarda los datos en el dispositivo, gratis y sin cuentas. Dexie la hace mucho más sencilla de usar y actualiza las pantallas solas cuando cambian los datos. |
| 3 | 2026-09-28 | **GitHub Pages** en lugar de Vercel | Las dos son gratis, pero con GitHub Pages el código y la publicación están en el mismo sitio y no hace falta otra cuenta. Como la app no necesita servidor, no se pierde nada. |
| 4 | 2026-09-28 | **Notificaciones: no en la Fase 1** | En el iPhone, una web instalada solo puede recibir notificaciones si un servidor se las envía; no puede programarlas ella sola. La alternativa gratuita y fiable es exportar exámenes y entregas al **Calendario del iPhone** con aviso previo (Fase 2). Las notificaciones reales se estudiarán en la Fase 3 con un servicio gratuito (ej. Cloudflare Workers), solo si es 100 % gratis. |
| 5 | 2026-09-28 | **Copia de seguridad y almacenamiento persistente** | Safari puede borrar los datos de webs que no se usan en un tiempo. Instalarla en la pantalla de inicio y pedir almacenamiento persistente lo evita en la práctica, y la copia de seguridad cubre el resto. |
| 6 | 2026-09-28 | **Tres tipos de hábito** (diario, X veces/semana, por tiempo) | Cubren los hábitos del usuario: gimnasio 4 días/semana y estudiar 2 h/día. |
| 7 | 2026-09-28 | **Horario como "plantilla semanal"** | Las clases se repiten cada semana, así que se introducen una vez y aparecen solas. |
| 8 | 2026-09-28 | **Fechas guardadas como `AAAA-MM-DD`** | Evita errores de zona horaria (un día que "salta" al anterior). |
| 9 | 2026-09-28 | **Vitest + Playwright** para las pruebas | Vitest prueba la lógica (rachas, fechas) en segundos; Playwright abre un navegador de verdad, en tamaño móvil y ordenador, para comprobar las pantallas. |
| 10 | 2026-09-28 | **Calendario con vista mes y semana en una sola sección**, y **asistencia a clase en la Fase 1** | El usuario quiere un apartado de calendario para ver exámenes y entregas y marcar si ha ido a clase. Juntar mes y semana en una sección mantiene el menú en 5 botones. |
| 11 | 2026-09-28 | **Asistencia "por defecto sí"** | Marcar cada clase como asistida sería pesado (3 clases al día). Se asume que se fue y solo se marca la excepción. |
| 12 | 2026-09-28 | **Botón "+" rápido y cuenta atrás de exámenes** | Reducen la fricción: apuntar algo debe llevar segundos y los exámenes deben verse venir. |
| 13 | 2026-09-28 | **Sin cronómetro de estudio** | El usuario prefiere apuntar a mano lo que ha estudiado; un cronómetro añadiría complicación. |
| 14 | 2026-09-28 | **Tema guardado en el navegador (localStorage)**, no en la base de datos | Hay que saberlo antes de pintar la pantalla para evitar un destello blanco al abrir en modo oscuro. |
| 15 | 2026-09-28 | **Navegación con `#/` (HashRouter)** | GitHub Pages no sabe redirigir direcciones internas; con `#/` cualquier enlace funciona siempre. |
| 16 | 2026-09-28 | **Color principal índigo y tipografía Inter incluida** | Aspecto moderno y sobrio; la fuente va dentro de la app para que funcione sin conexión. |
