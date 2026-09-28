import { ListChecks } from 'lucide-react'
import { Cabecera, Vacio } from '../componentes/Cabecera'

export default function Tareas() {
  return (
    <>
      <Cabecera titulo="Tareas" />
      <Vacio
        icono={<ListChecks className="size-6" />}
        titulo="Exámenes, entregas y repasos"
        texto="Ordenados por fecha, con aviso de lo que se acerca."
      />
    </>
  )
}
