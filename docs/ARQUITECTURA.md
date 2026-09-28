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
  estilos/       Colores, tipografía y modo oscuro
public/          Iconos de la app instalable
tests/           Pruebas en navegador (Playwright)
```
Las pruebas de la lógica van junto a cada archivo (`racha.ts` → `racha.test.ts`).

## Datos que guarda la app
| Tabla | Qué contiene |
|---|---|
| `habitos` | Cada hábito: nombre, color, tipo de objetivo (diario, veces por semana o por tiempo) y meta |
| `registros` | Cada vez que marcas un hábito: qué hábito, qué día y cuántos minutos |
| `asignaturas` | Nombre y color de cada asignatura |
| `horario` | Bloques fijos semanales: día de la semana, hora de inicio y de fin, y asignatura |
| `clasesPuntuales` | Clases de un día concreto (prácticas, Comunicación Persuasiva) |
| `festivos` | Días sin clase |
| `asistencia` | Si fuiste o no a cada clase: fecha, hora y asignatura |
| `tareas` | Exámenes, entregas, repasos y otras tareas, con fecha límite y estado |
| `eventos` | Cosas puntuales de un día concreto (ej. cita médica) |
| `ajustes` | Tema (claro, oscuro o automático) y otras preferencias |

Las fechas se guardan como texto `AAAA-MM-DD` (ej. `2026-09-28`), para evitar líos con las zonas horarias.

## Cómo llega la app a tu móvil
1. El código se guarda en GitHub (un sitio web para guardar código, gratis).
2. Cada vez que se guarda una versión, GitHub la publica automáticamente en una dirección web.
3. Abres esa dirección en Safari → "Compartir" → "Añadir a pantalla de inicio" y ya la tienes como una app más.
