# Progreso

_Última actualización: 2026-09-28_

## Estado actual
**Fase 1: en construcción.** Plan aprobado por el usuario. Tareas 0 a 6 terminadas; siguiente: tarea 7 (pantalla Hoy).

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
| 7 | Hoy: pantalla de inicio con todo lo del día (asistencia y cuenta atrás de exámenes) | ⬜ |
| 8 | Ajustes: tema, exportar/importar copia y almacenamiento persistente | ⬜ |
| 9 | App instalable (PWA) y publicación en GitHub Pages | ⬜ |
| 10 | Revisión final de la Fase 1 en móvil y ordenador | ⬜ |

## Pendiente del usuario
- Decidir si quiere la sincronización entre móvil y ordenador ya en la Fase 1 (recomendación: Fase 2).
- (Para la tarea 9) Crear una cuenta gratuita de GitHub, si no tiene una.

## Notas técnicas para la próxima sesión
- Node.js está en `C:\Program Files\nodejs`. En PowerShell puede hacer falta añadirlo al PATH de la sesión: `$env:Path = "C:\Program Files\nodejs;" + $env:Path`.
- Comandos: `npm run dev` (abrir en local), `npm run comprobar` (tipos + pruebas), `npm run build` (versión final).
- Vista previa en el navegador integrado: configuración `rumbo` en `.claude/launch.json` (puerto 5173).
- Versiones muy recientes (TypeScript 7, Vite 8, react-router 8): comprobar la documentación si algo no encaja.
