import { Flame } from 'lucide-react'
import { Cabecera, Vacio } from '../componentes/Cabecera'

export default function Habitos() {
  return (
    <>
      <Cabecera titulo="Hábitos" />
      <Vacio
        icono={<Flame className="size-6" />}
        titulo="Tus hábitos y rachas"
        texto="Gimnasio 4 días por semana, estudiar 2 horas al día y lo que quieras añadir."
      />
    </>
  )
}
