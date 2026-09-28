import { Monitor, Moon, Sun } from 'lucide-react'
import { Cabecera } from '../componentes/Cabecera'
import { useTema } from '../hooks/useTema'
import type { Tema } from '../logica/tema'

const OPCIONES_TEMA: { valor: Tema; nombre: string; icono: typeof Sun }[] = [
  { valor: 'auto', nombre: 'Automático', icono: Monitor },
  { valor: 'claro', nombre: 'Claro', icono: Sun },
  { valor: 'oscuro', nombre: 'Oscuro', icono: Moon },
]

export default function Ajustes() {
  const [tema, setTema] = useTema()

  return (
    <>
      <Cabecera titulo="Ajustes" />
      <section className="rounded-3xl border border-borde bg-superficie p-5">
        <h2 className="font-semibold">Apariencia</h2>
        <p className="mt-1 text-sm text-texto-suave">"Automático" sigue el modo claro u oscuro de tu dispositivo.</p>
        <div role="radiogroup" aria-label="Tema" className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-superficie-2 p-1">
          {OPCIONES_TEMA.map(({ valor, nombre, icono: Icono }) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={tema === valor}
              onClick={() => setTema(valor)}
              className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2 text-sm font-medium transition ${
                tema === valor ? 'bg-superficie text-texto shadow-sm' : 'text-texto-suave hover:text-texto'
              }`}
            >
              <Icono className="size-4" />
              {nombre}
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
