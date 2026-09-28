# Arquitectura (explicada de forma sencilla)

## La idea general
La app es una **página web** que se descarga una vez y después funciona en el propio dispositivo, incluso sin internet. No hay servidor que guarde los datos: todo se queda en una pequeña base de datos del navegador (**IndexedDB**, una especie de "cajón" donde el navegador guarda información de forma permanente).

```
Tú  ──►  Pantallas (React)  ──►  Lógica (reglas: rachas, fechas…)  ──►  Datos (IndexedDB en tu móvil)
```

## Carpetas previstas
```
src/
  pantallas/     Cada pantalla de la app: Hoy, Calendario, Tareas, Hábitos, Ajustes
  componentes/   Piezas reutilizables: botones, tarjetas, casillas, ventanas…
  logica/        Reglas puras (sin pantallas): cálculo de rachas, semanas, progreso…
  datos/         Base de datos (Dexie), modelos y copia de seguridad
  hooks/         "Enganches" de React: piezas que conectan pantallas con datos o ajustes (ej. el tema)
  estilos/       Colores, tipografía y modo oscuro
public/          Iconos de la app instalable
tests/           Pruebas en navegador (Playwright), en móvil (375 px) y ordenador, y capturas para revisar el diseño
```
Las pruebas de la lógica van junto a cada archivo (`racha.ts` → `racha.test.ts`).

## Datos que guarda la app
| Tabla | Qué contiene |
|---|---|
| `habitos` | Cada hábito: nombre, color, tipo de objetivo (diario, veces por semana o por tiempo) y meta; en los de tiempo, si es al día o a la semana; y los ajustes de semanas concretas |
| `registros` | Cada vez que marcas un hábito: qué hábito, qué día y cuántos minutos (uno por hábito y día; id = `hábito|día`) |
| `asignaturas` | Nombre y color de cada asignatura |
| `horario` | Bloques fijos semanales: día de la semana, hora de inicio y de fin, asignatura y aula. Se repiten entre las fechas del cuatrimestre (ajuste `clases.periodo`) |
| `clasesPuntuales` | Clases de un día concreto (prácticas, Comunicación Persuasiva) |
| `festivos` | Días sin clase |
| `asistencia` | Si fuiste o no a cada clase: fecha, hora y asignatura. Solo se guardan las excepciones; id = `día|idDeLaClase` |
| `tareas` | Exámenes, entregas, repasos y otras tareas, con fecha límite y estado |
| `eventos` | Cosas puntuales de un día concreto (ej. cita médica) |
| `ajustes` | Preferencias de la app (el tema claro/oscuro se guarda aparte; ver DECISIONES n.º 14) |

Las fechas se guardan como texto `AAAA-MM-DD` (ej. `2026-09-28`), para evitar líos con las zonas horarias.

## Cómo llega la app a tu móvil
1. El código se guarda en GitHub (un sitio web para guardar código, gratis).
2. Cada vez que se guarda una versión, GitHub la publica automáticamente en una dirección web.
3. Abres esa dirección en Safari → "Compartir" → "Añadir a pantalla de inicio" y ya la tienes como una app más.

## Diseño
- Colores definidos una sola vez en `src/estilos/index.css` (fondo, superficie, borde, texto, acento…) con una versión clara y otra oscura. Las pantallas usan esos nombres (`bg-superficie`, `text-acento`…), así el modo oscuro funciona solo.
- Tipografía Inter, incluida en la app (funciona sin internet).
- Estructura común en `componentes/Marco.tsx`: menú lateral en ordenador, barra inferior y botón "+" en el móvil.
- Navegación con direcciones tipo `#/tareas` (HashRouter), que funcionan en GitHub Pages sin configuración extra.

## Comandos útiles
- `npm run dev`: abre la app en local.
- `npm run comprobar`: revisa los tipos y pasa las pruebas de lógica.
- `npx playwright test`: pruebas en navegador (genera capturas en `test-results/capturas/`).
- `npm run build`: crea la versión final en `dist/`.

## Piezas compartidas
- `componentes/Hoja.tsx`: ventana que sube desde abajo (móvil) o aparece centrada (ordenador).
- `componentes/ui.tsx`: botones, campos y selectores con el mismo estilo en toda la app.
- `componentes/acciones.tsx`: ventanas que se abren desde cualquier sitio (ej. apuntar horas de estudio).
- `componentes/colores.ts`: paleta de colores para hábitos y asignaturas.
- `datos/iniciales.ts`: datos con los que arranca la app la primera vez (cada bloque solo se carga una vez).
- `logica/clases.ts`: calcula las clases de cualquier día (horario semanal + clases puntuales − festivos) y el estado de asistencia.
- `datos/clases.ts`: `useDatosClases()` da a las pantallas todo lo necesario sobre clases, actualizado al momento.
