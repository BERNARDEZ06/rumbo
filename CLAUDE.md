# CLAUDE.md — Reglas del proyecto "Rumbo"

App personal de hábitos, agenda semanal y tareas de estudio. Nombre provisional: **Rumbo**.

> **Al empezar cualquier sesión:** lee este archivo y después `docs/PROGRESO.md` para saber dónde estamos.

## Sobre el usuario
- No sabe programar: yo tomo las decisiones técnicas y se las explico.
- Estudia ADE + Business Analytics. Tiene clases principalmente de lunes a viernes de 15:00 a 21:00, más alguna clase de mañana (ver `docs/HORARIO.md`). Sus objetivos son ir al gimnasio 4 días por semana y estudiar 2 horas al día.
- Usa **iPhone** (y ordenador). La semana va de lunes a domingo.
- Todo (app, textos, documentos y explicaciones) va **en español**.

## Reglas de trabajo
1. **Documentación primero.** Los documentos de `docs/` son la memoria del proyecto. Consúltalos antes de tocar código.
2. **Auto-actualización.** Al terminar cada tarea, actualiza `docs/PROGRESO.md` sin que te lo pidan. Si cambia algo de funciones, arquitectura o decisiones, actualiza también el documento correspondiente.
3. **QA antes de decir "terminado".** Después de cada tarea:
   - comprueba que funciona (compilación, pruebas automáticas y prueba real en el navegador);
   - comprueba que no se ha roto nada anterior (se pasan todas las pruebas);
   - revisa cómo se ve en móvil (375 px) y en ordenador, en modo claro y oscuro;
   - corrige los fallos antes de dar la tarea por cerrada.
   - Añade pruebas automáticas para la lógica importante (rachas, fechas, copias de seguridad, etc.).
4. **Pasos pequeños.** Cada fase se divide en tareas cortas. Una tarea cada vez y un commit de git por tarea, con un mensaje claro en español.
5. **Explicaciones sencillas.** Al terminar cada tarea, di en 3-5 frases sin tecnicismos: qué se ha hecho, cómo probarlo y cuál es el siguiente paso. Si aparece una palabra técnica, explícala en pocas palabras.
6. **Recomendar, no solo listar.** Cuando haya que elegir, di qué opción eliges y por qué.
7. **Preguntar solo lo necesario.** Pregunta cuando algo del producto no esté claro. Las decisiones técnicas las tomo yo (y las anoto en `docs/DECISIONES.md`).
8. **Coste cero siempre.** Ningún servicio de pago, ni ahora ni en el futuro.

## Tecnología elegida
| Pieza | Elección |
|---|---|
| Interfaz | React + TypeScript |
| Herramienta de desarrollo | Vite |
| Estilos | Tailwind CSS (con modo oscuro) |
| Datos | IndexedDB (a través de la librería Dexie), en el propio dispositivo |
| Fechas | date-fns (en español, semana de lunes a domingo) |
| Iconos | lucide-react |
| App instalable (PWA) | vite-plugin-pwa |
| Pruebas | Vitest (lógica) + Playwright (pruebas en navegador) |
| Publicación | GitHub Pages (gratis) |

El porqué de cada elección está en `docs/DECISIONES.md`.

## Índice de documentos
- [docs/VISION.md](docs/VISION.md): qué es la app y para qué sirve.
- [docs/FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md): todas las funciones, por fases.
- [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md): cómo está organizado el código.
- [docs/PROGRESO.md](docs/PROGRESO.md): qué está hecho, en curso y pendiente.
- [docs/DECISIONES.md](docs/DECISIONES.md): decisiones importantes y su porqué.
- [docs/HORARIO.md](docs/HORARIO.md): horario real de clase del usuario.
