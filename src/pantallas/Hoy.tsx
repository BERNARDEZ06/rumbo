import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Sun } from 'lucide-react'
import { Cabecera, Vacio } from '../componentes/Cabecera'

export default function Hoy() {
  const fecha = format(new Date(), "EEEE, d 'de' MMMM", { locale: es })
  return (
    <>
      <Cabecera titulo="Hoy" subtitulo={fecha} />
      <Vacio
        icono={<Sun className="size-6" />}
        titulo="Tu día aparecerá aquí"
        texto="Clases, hábitos, tareas y la cuenta atrás de tus exámenes."
      />
    </>
  )
}
