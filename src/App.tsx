import { HashRouter, Route, Routes } from 'react-router'
import { Marco } from './componentes/Marco'
import Ajustes from './pantallas/Ajustes'
import Calendario from './pantallas/Calendario'
import Habitos from './pantallas/Habitos'
import Hoy from './pantallas/Hoy'
import Tareas from './pantallas/Tareas'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Marco />}>
          <Route index element={<Hoy />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="tareas" element={<Tareas />} />
          <Route path="habitos" element={<Habitos />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="*" element={<Hoy />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
