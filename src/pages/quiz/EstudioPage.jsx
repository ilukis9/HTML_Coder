import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import QuizEstudio from '../../components/quiz/QuizEstudio'
import { REGISTRY } from '../../data/licencias-registry'
import { useAuth } from '../../hooks/useAuth'
import { TEST_MODE } from '../../lib/testMode'

export default function EstudioPage() {
  const { id } = useParams()
  const { usuario, cargando } = useAuth()
  const navigate = useNavigate()
  const licencia = REGISTRY[id]

  useEffect(() => {
    if (!TEST_MODE && !cargando && !usuario) {
      navigate('/licencias', { state: { modalEstudio: id }, replace: true })
    }
  }, [cargando, usuario, id, navigate])

  if (!licencia) return <Navigate to="/licencias" replace />
  if (!TEST_MODE && (cargando || !usuario)) return null

  return (
    <QuizEstudio
      preguntas={licencia.preguntas}
      storageKey={id}
      rutaExamen={`/licencias/${id}/examen`}
      titulo={licencia.titulo}
    />
  )
}
