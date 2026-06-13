import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LicenciasPage from './pages/LicenciasPage'
import MisionPage from './pages/MisionPage'
import PerfilPage from './pages/PerfilPage'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import EstudioPage from './pages/quiz/EstudioPage'
import ExamenPage from './pages/quiz/ExamenPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/licencias" element={<LicenciasPage />} />
        <Route path="/mision" element={<MisionPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/licencias/:id/estudio" element={<EstudioPage />} />
        <Route path="/licencias/:id/examen" element={<ExamenPage />} />
      </Route>
    </Routes>
  )
}
