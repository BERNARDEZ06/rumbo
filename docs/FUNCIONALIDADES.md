# Funcionalidades

Leyenda: ⬜ pendiente · 🔄 en curso · ✅ hecho

## Fase 1: lo mínimo útil

### Estructura y diseño
- ⬜ Navegación con 5 secciones: **Hoy**, **Calendario**, **Tareas**, **Hábitos** y **Ajustes**. En el móvil se muestra como barra inferior y en el ordenador como menú lateral.
- ⬜ Botón "+" siempre visible para añadir rápido una tarea, un examen o un repaso.
- ⬜ Modo claro, modo oscuro y opción "automático" (según el sistema).
- ⬜ Todo en español, con la semana de lunes a domingo.

### Hábitos
- ✅ Crear, editar, archivar y borrar hábitos, con nombre, icono o emoji y color.
- ✅ Tres tipos de objetivo:
  - **Diario**: cada día (ej. "leer").
  - **X veces por semana**: ej. "gimnasio 4 días/semana".
  - **Por tiempo**, al día o a la semana: ej. "estudiar 14 h por semana". Se apuntan las horas a mano y la app muestra una barra de progreso.
- ✅ Marcar como hecho con un toque (o sumar minutos).
- ✅ Racha: días seguidos para los hábitos diarios y semanas seguidas cumpliendo el objetivo para los semanales.
- ✅ Progreso de la semana actual en cada hábito.
- ✅ **Ajustar el objetivo de una semana concreta** (ej. 20 h de estudio en semana de exámenes, 2 días de gimnasio en una semana complicada). La semana siguiente vuelve al habitual. Una "semana libre" (0) no rompe la racha.

### Horario fijo (clases)
- ⬜ Asignaturas con nombre y color.
- ⬜ Plantilla semanal: bloques fijos que se repiten cada semana (ej. "Estadística, lunes 15:00-17:00").
- ⬜ Clases con fechas concretas (ej. Comunicación Persuasiva, que solo tiene clase algunos viernes).
- ⬜ Días festivos: ese día no aparecen las clases.
- ⬜ Carga inicial del horario real, los festivos, los exámenes y las entregas (ver `HORARIO.md`).

### Asistencia a clase
- ⬜ Cuando termina una clase, se da por asistida automáticamente; solo hay que tocarla si **no** se fue (se puede cambiar desde Hoy o desde el Calendario).
- ⬜ Porcentaje de asistencia por asignatura.

### Tareas (exámenes, entregas y repasos)
- ⬜ Crear tareas con título, tipo (**Examen**, **Entrega**, **Repaso** u **Otra**), asignatura (opcional), fecha límite (opcional) y notas.
- ⬜ Marcar como hecha y deshacer.
- ⬜ Lista ordenada por fecha, con filtros de pendientes, hechas y por asignatura.
- ⬜ Aviso visual de las tareas vencidas y de las próximas (en los siguientes 7 días).

### Calendario
- ⬜ **Vista mes**: cuadrícula de lunes a domingo con marcas de colores para los exámenes (rojo), las entregas (verde), los festivos y las clases. Al tocar un día, se ve su detalle.
- ⬜ **Vista semana**: de lunes a domingo, con las clases, las tareas y los hábitos de cada día.
- ⬜ Cambiar entre mes y semana, y moverse adelante y atrás.
- ⬜ Añadir cosas puntuales a un día concreto (ej. "cita médico jueves 10:00").

### Hoy
- ⬜ La app se abre aquí: fecha, clases de hoy, hábitos pendientes de hoy, tareas de hoy y vencidas, y próximos exámenes.
- ⬜ Marcar hábitos, tareas y asistencia a clase directamente desde esta pantalla.
- ⬜ Cuenta atrás de los próximos exámenes (ej. "Macro en 7 días").

### Datos
- ⬜ Todo se guarda en el dispositivo.
- ⬜ Exportar copia de seguridad (archivo `.json`) e importarla.
- ⬜ Pedir al navegador que no borre los datos (almacenamiento persistente).

### App instalable
- ⬜ Instalable en el iPhone ("Añadir a pantalla de inicio"), con icono y funcionamiento sin conexión.
- ⬜ Publicada gratis en una dirección web.

## Fase 2: mejoras
- ⬜ **Sincronización entre móvil y ordenador**, gratis, usando un archivo privado en la cuenta de GitHub del usuario. Lo que se apunta en un dispositivo aparece en el otro.
- ⬜ **Resumen semanal**: qué se ha cumplido y qué no (hábitos y tareas), visible cualquier día y destacado el domingo por la noche y el lunes por la mañana.
- ⬜ **Recordatorios en el calendario del iPhone**: exportar los exámenes y las entregas como eventos (archivo `.ics`) con aviso previo. Así avisa el propio iPhone, sin coste.
- ⬜ Estadísticas de los hábitos: historial de las últimas semanas y porcentaje de cumplimiento.
- ⬜ Planificar el estudio: repartir las 2 h diarias entre asignaturas.
- ⬜ Aviso para hacer copia de seguridad si hace tiempo que no se hace.

## Fase 3: extras (opcionales)
- ⬜ Notificaciones reales en el iPhone (ej. "a las 22:00 te falta el gimnasio"), si se consigue una forma 100 % gratuita y fiable. Ver `DECISIONES.md`.
- ⬜ Periodos especiales: semanas de exámenes y vacaciones sin clases.
- ⬜ Reordenar arrastrando y otros atajos rápidos.
