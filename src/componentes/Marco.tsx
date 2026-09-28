import { Compass, Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { ProveedorAcciones } from './acciones'
import { AnadirRapido } from './AnadirRapido'
import { SECCIONES } from './navegacion'

/** Estructura común de todas las pantallas: menú, contenido y botón "+". */
export function Marco() {
  const [anadirAbierto, setAnadirAbierto] = useState(false)
  const cerrarAnadir = useCallback(() => setAnadirAbierto(false), [])

  return (
    <ProveedorAcciones>
      <div className="min-h-dvh md:flex">
        {/* Menú lateral (ordenador) */}
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-borde bg-superficie px-3 py-5 md:flex">
          <div className="mb-6 flex items-center gap-2 px-3">
            <span className="grid size-8 place-items-center rounded-xl bg-acento text-acento-texto">
              <Compass className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Rumbo</span>
          </div>
          <button
            type="button"
            onClick={() => setAnadirAbierto(true)}
            className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-acento px-3 py-2.5 font-medium text-acento-texto shadow-sm transition hover:opacity-90"
          >
            <Plus className="size-5" /> Añadir
          </button>
          <nav aria-label="Secciones" className="grid gap-1">
            {SECCIONES.map(({ ruta, nombre, icono: Icono }) => (
              <NavLink
                key={ruta}
                to={ruta}
                end={ruta === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 font-medium transition ${
                    isActive ? 'bg-acento-suave text-acento' : 'text-texto-suave hover:bg-superficie-2 hover:text-texto'
                  }`
                }
              >
                <Icono className="size-5" />
                {nombre}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Contenido */}
        <main className="mx-auto w-full max-w-3xl px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-32 md:px-8 md:pt-10 md:pb-12">
          <Outlet />
        </main>

        {/* Botón "+" flotante (móvil) */}
        <button
          type="button"
          onClick={() => setAnadirAbierto(true)}
          aria-label="Añadir"
          className="fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 grid size-14 place-items-center rounded-2xl bg-acento text-acento-texto shadow-lg shadow-acento/30 transition active:scale-95 md:hidden"
        >
          <Plus className="size-7" />
        </button>

        {/* Barra inferior (móvil) */}
        <nav
          aria-label="Secciones"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-superficie/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
        >
          <ul className="mx-auto grid max-w-md grid-cols-5">
            {SECCIONES.map(({ ruta, nombre, icono: Icono }) => (
              <li key={ruta}>
                <NavLink
                  to={ruta}
                  end={ruta === '/'}
                  className={({ isActive }) =>
                    `flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
                      isActive ? 'text-acento' : 'text-texto-suave'
                    }`
                  }
                >
                  <Icono className="size-6" />
                  {nombre}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <AnadirRapido abierta={anadirAbierto} onCerrar={cerrarAnadir} />
      </div>
    </ProveedorAcciones>
  )
}
