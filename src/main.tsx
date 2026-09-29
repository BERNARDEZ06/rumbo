import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { pedirAlmacenamientoPersistente } from './datos/copia'
import { cargarDatosIniciales } from './datos/iniciales'
import { iniciarSincronizacion } from './datos/sincronizacion/motor'
import { aplicarTema } from './hooks/useTema'
import './estilos/index.css'

aplicarTema()

// Pedir al navegador que no borre los datos (sin esperar: no bloquea el arranque).
void pedirAlmacenamientoPersistente()

// Si algo falla al cargar los datos iniciales, la app se abre igualmente.
cargarDatosIniciales()
  .catch((error) => console.error('No se pudieron cargar los datos iniciales', error))
  .finally(() => {
    // Sincronización con GitHub (solo si este dispositivo está conectado).
    iniciarSincronizacion()
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
