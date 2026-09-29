import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { pedirAlmacenamientoPersistente } from './datos/copia'
import { cargarDatosIniciales } from './datos/iniciales'
import { aplicarTema } from './hooks/useTema'
import './estilos/index.css'

aplicarTema()

// Pedir al navegador que no borre los datos (sin esperar: no bloquea el arranque).
void pedirAlmacenamientoPersistente()

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
