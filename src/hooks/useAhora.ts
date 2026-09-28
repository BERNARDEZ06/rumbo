import { useEffect, useState } from 'react'
import { hoy, horaActual, type Dia } from '../logica/fechas'

/** Día y hora actuales; se refrescan cada minuto (y al volver a la app). */
export function useAhora(): { hoy: Dia; hora: string } {
  const leer = () => ({ hoy: hoy(), hora: horaActual() })
  const [ahora, setAhora] = useState(leer)

  useEffect(() => {
    const refrescar = () => setAhora((anterior) => {
      const nuevo = leer()
      return nuevo.hoy === anterior.hoy && nuevo.hora === anterior.hora ? anterior : nuevo
    })
    const intervalo = setInterval(refrescar, 30_000)
    document.addEventListener('visibilitychange', refrescar)
    return () => {
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', refrescar)
    }
  }, [])

  return ahora
}
