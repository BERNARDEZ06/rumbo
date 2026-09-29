# Progreso

_Última actualización: 2026-09-28_

## Estado actual
**Fase 1: en construcción.** Plan aprobado por el usuario. Tareas 0 a 9 terminadas. **App publicada en https://bernardez06.github.io/rumbo/**. Siguiente: tarea 10 (revisión final de la Fase 1, incluida la prueba del usuario en su iPhone).

## Hecho
- ✅ Preguntas iniciales sobre la rutina.
- ✅ Documentos del proyecto: CLAUDE.md, VISION, FUNCIONALIDADES, ARQUITECTURA, DECISIONES y PROGRESO.
- ✅ Horario de clase transcrito en `docs/HORARIO.md` (a partir del PDF de Comillas).
- ✅ Plan ajustado: sección Calendario (mes + semana), asistencia a clase, botón "+" y cuenta atrás de exámenes.
- ✅ Tarea 0: Node.js 24 instalado; proyecto base con Vite 8, React 19, TypeScript 7, Tailwind 4 y Vitest 5. Compila, pasa las pruebas y se abre en el navegador.
- ✅ Tarea 1: diseño base (colores, modo claro/oscuro/automático, tipografía), menú de 5 secciones (barra inferior en móvil, lateral en ordenador), botón "+" con menú de añadir (opciones aún desactivadas), pantallas vacías y selector de tema en Ajustes. 12 pruebas en navegador + 4 de lógica.
- ✅ Tarea 2: base de datos en el dispositivo (Dexie, 11 tablas, preparada para sincronizar) y lógica de fechas (semanas de lunes a domingo, cuadrícula del mes, textos en español, cuenta atrás, cambio de hora). 18 pruebas nuevas.
- ✅ Tarea 3: hábitos. Tres tipos (cada día, X días/semana, por tiempo); crear, editar, archivar y borrar; marcar hoy con un toque o corregir cualquier día de la semana; apuntar horas a mano (+15m…+2h) también desde el botón "+"; racha actual y mejor racha; progreso semanal. Gimnasio (4 días/semana) y Estudiar (2 h/día) se crean solos la primera vez. 19 pruebas de lógica/datos nuevas + 5 en navegador.
- ✅ Mejora pedida por el usuario: Estudiar pasa a ser **14 h por semana** (en lugar de 2 h al día) y cualquier hábito semanal puede **ajustarse solo para una semana** ("Ajustar esta semana"), incluida la "semana libre" que no rompe la racha.
- ✅ Tarea 4: asignaturas, horario semanal, clases puntuales y festivos, con pantalla para verlos y editarlos (Ajustes → Clases). Cargado el horario real: 8 asignaturas, 14 clases semanales, 10 viernes de Comunicación Persuasiva, 9 prácticas de Estadística (G1 y Todos) y 4 festivos. Lógica de "clases de un día" y de asistencia (por defecto asistida; porcentaje por asignatura) lista para el Calendario y Hoy.
- ✅ Fin de clases confirmado: 8 dic 2026 (festivo; último día de clase el lunes 7). No hay más festivos.
- ✅ Tarea 5: tareas (examen, entrega, repaso, otra) con asignatura, fecha, hora y notas; título automático ("Examen de Macro") si se deja vacío; lista agrupada (Atrasadas, Hoy, Próximos 7 días, Más adelante, Sin fecha), pendientes/hechas y filtro por asignatura; se abren desde el botón "+". Cargados los 9 exámenes y la entrega del usuario.
- ✅ Tarea 6: Calendario con vista mes (exámenes en rojo, entregas en verde, festivos en violeta; en ordenador, etiquetas con la asignatura) y vista semana (lunes a domingo con clases, tareas y eventos); detalle del día; eventos puntuales (también desde el "+"); asistencia en cada clase ("Fui" por defecto al terminar, "No fui" / "No iré" con un toque) y resumen de asistencia por asignatura (en rojo si baja del 80 %). Corregido un desbordamiento horizontal en móvil con nombres de clase largos.
- ✅ Las prácticas de Estadística se muestran como "Práctica" (sin grupo), a petición del usuario.
- ✅ Tarea 7: pantalla Hoy con saludo y fecha, cuenta atrás de los 3 próximos exámenes (en rojo si faltan 3 días o menos), tareas para hoy (incluidas las atrasadas; las hechas quedan tachadas con contador "x/y hechas"), clases con asistencia ("x por delante"), festivo o "hoy no tienes clase", eventos del día y hábitos en versión compacta con su progreso semanal.
- ✅ Tarea 8: Ajustes → "Tus datos": descargar copia de seguridad (archivo .json; en el móvil se abre "Compartir" para guardarla en Archivos/iCloud), recuperar una copia (con resumen y confirmación; sustituye todo o nada), aviso si nunca se ha hecho copia o hace 14 días o más, estado de protección de los datos y botón "Pedir protección". La app pide almacenamiento persistente al arrancar. Se muestra la versión.
- ✅ Tarea 9 (parte 1): icono (brújula), ficha de la app (manifest), iconos para iPhone, "service worker" (funciona sin conexión y se actualiza sola), publicación automática con GitHub Actions (pasa las pruebas antes de publicar) y prueba que simula GitHub Pages y quita la conexión.
- ✅ Tarea 9 (parte 2): código subido a https://github.com/BERNARDEZ06/rumbo (rama main) y publicado con GitHub Actions en https://bernardez06.github.io/rumbo/. Comprobado: carga, ficha de la app, icono de iPhone y service worker activo.

## En curso
- 🔄 Nada.

## Plan de la Fase 1 (tareas pequeñas, una por commit)
| # | Tarea | Estado |
|---|---|---|
| 0 | Instalar Node.js en el ordenador y crear el proyecto base (Vite, React, TypeScript, Tailwind y pruebas) | ✅ |
| 1 | Diseño base: colores, modo oscuro, navegación (barra inferior en móvil y menú lateral en ordenador) y botón "+" | ✅ |
| 2 | Base de datos en el dispositivo y lógica de fechas y semanas (con pruebas) | ✅ |
| 3 | Hábitos: crear, editar, marcar, rachas y progreso semanal (con pruebas) | ✅ |
| 4 | Asignaturas, horario semanal, clases puntuales, festivos + carga de tus datos reales | ✅ |
| 5 | Tareas: exámenes, entregas y repasos, con fechas y filtros | ✅ |
| 6 | Calendario: vista mes y vista semana + eventos puntuales + asistencia a clase | ✅ |
| 7 | Hoy: pantalla de inicio con todo lo del día (asistencia y cuenta atrás de exámenes) | ✅ |
| 8 | Ajustes: tema, exportar/importar copia y almacenamiento persistente | ✅ |
| 9 | App instalable (PWA) y publicación en GitHub Pages | ✅ |
| 10 | Revisión final de la Fase 1 en móvil y ordenador | ⬜ |

## Pendiente del usuario
- Decidir si quiere la sincronización entre móvil y ordenador ya en la Fase 1 (recomendación: Fase 2).
- Instalar la app en el iPhone (Safari → Compartir → Añadir a pantalla de inicio) y contar si algo se ve o funciona mal.

## Notas técnicas para la próxima sesión
- Publicar: basta con `git push` (rama main); GitHub Actions pasa las pruebas y publica en 1-2 min. Estado: https://github.com/BERNARDEZ06/rumbo/actions (o la API pública `api.github.com/repos/BERNARDEZ06/rumbo/actions/runs`). El inicio de sesión de git ya está guardado (Git Credential Manager).
- Iconos: se generan con `node scripts/iconos.mjs` a partir de `public/icono.svg`.
- Versión publicada en local: `npm run build && node scripts/servir-dist.mjs` → http://localhost:4173/rumbo/ (proyecto de pruebas "publicada").
- Al pasar las pruebas en navegador, NO usar `npx playwright test | tail`: el servidor de pruebas deja la salida abierta y la orden no termina. Redirigir a un archivo: `npx playwright test > /tmp/pw.txt 2>&1; tail /tmp/pw.txt`.
- Node.js está en `C:\Program Files\nodejs`. En PowerShell puede hacer falta añadirlo al PATH de la sesión: `$env:Path = "C:\Program Files\nodejs;" + $env:Path`.
- Comandos: `npm run dev` (abrir en local), `npm run comprobar` (tipos + pruebas), `npm run build` (versión final).
- Vista previa en el navegador integrado: configuración `rumbo` en `.claude/launch.json` (puerto 5173).
- Versiones muy recientes (TypeScript 7, Vite 8, react-router 8): comprobar la documentación si algo no encaja.
