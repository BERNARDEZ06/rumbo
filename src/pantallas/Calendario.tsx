import { CalendarDays } from 'lucide-react'
import { Cabecera, Vacio } from '../componentes/Cabecera'

export default function Calendario() {
  return (
    <>
      <Cabecera titulo="Calendario" />
      <Vacio
        icono={<CalendarDays className="size-6" />}
        titulo="Vista mes y vista semana"
        texto="Tus clases, exámenes, entregas y festivos, y la asistencia a clase."
      />
    </>
  )
}
