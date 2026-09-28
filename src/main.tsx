import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { cargarDatosIniciales } from './datos/iniciales'
import { aplicarTema } from './hooks/useTema'
import './estilos/index.css'

aplicarTema()

// Si algo falla al cargar los datos iniciales, la app se abre igualmente.
cargarDatosIniciales()
  .catch((error) => console.error('No se pudieron cargar los datos iniciales', error))
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
