import { Minus, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ajustarMetaSemana } from '../../datos/habitos'
import type { Habito } from '../../datos/modelos'
import { diasDeLaSemana, textoDuracion, textoFechaCorta, type Dia } from '../../logica/fechas'
import { metaDeLaSemana, textoDias } from '../../logica/habitos'
import { Hoja } from '../Hoja'
import { Boton } from '../ui'

interface Props {
  habito: Habito
  /** Cualquier día de la semana que se ajusta. */
  dia: Dia
  abierta: boolean
  onCerrar: () => void
}

/** Cambiar el objetivo solo para una semana (ej. más horas en semana de exámenes). */
export function AjustarSemana({ habito, dia, abierta, onCerrar }: Props) {
  const porTiempo = habito.tipo === 'tiempo'
  const paso = porTiempo ? 60 : 1
  const maximo = porTiempo ? 70 * 60 : 7
  const [valor, setValor] = useState(0)

  useEffect(() => {
    if (abierta) setValor(metaDeLaSemana(habito, dia))
  }, [abierta, habito, dia])

  const texto = (v: number) => (v === 0 ? 'Semana libre' : porTiempo ? textoDuracion(v) : textoDias(v))
  const semana = diasDeLaSemana(dia)

  async function guardar(v: number | null) {
    await ajustarMetaSemana(habito.id, dia, v)
    onCerrar()
  }

  return (
    <Hoja abierta={abierta} titulo="Objetivo de esta semana" onCerrar={onCerrar}>
      <div className="grid grid-cols-1 gap-5">
        <p className="text-sm text-texto-suave">
          {habito.emoji} {habito.nombre} · del {textoFechaCorta(semana[0])} al {textoFechaCorta(semana[6])}. Solo cambia esta
          semana; la siguiente vuelve a tu objetivo habitual ({texto(habito.meta)}).
        </p>

        <div className="flex items-center justify-between rounded-2xl border border-borde px-3 py-3">
          <Boton variante="fantasma" className="size-11 !p-0" aria-label="Menos" disabled={valor <= 0} onClick={() => setValor((v) => Math.max(0, v - paso))}>
            <Minus className="size-5" />
          </Boton>
          <span className="text-2xl font-bold tracking-tight" aria-live="polite">
            {texto(valor)}
          </span>
          <Boton variante="fantasma" className="size-11 !p-0" aria-label="Más" disabled={valor >= maximo} onClick={() => setValor((v) => Math.min(maximo, v + paso))}>
            <Plus className="size-5" />
          </Boton>
        </div>

        {valor === 0 && <p className="-mt-3 text-center text-xs text-texto-suave">Una semana libre no rompe tu racha.</p>}

        <div className="grid grid-cols-2 gap-2">
          <Boton variante="secundario" onClick={() => guardar(null)}>
            Usar habitual
          </Boton>
          <Boton onClick={() => guardar(valor)}>Guardar</Boton>
        </div>
      </div>
    </Hoja>
  )
}
