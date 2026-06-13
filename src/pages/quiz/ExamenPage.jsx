import { useParams, Navigate } from 'react-router-dom'
import QuizExamen from '../../components/quiz/QuizExamen'
import { REGISTRY } from '../../data/licencias-registry'

export default function ExamenPage() {
  const { id } = useParams()
  const licencia = REGISTRY[id]

  if (!licencia) return <Navigate to="/licencias" replace />

  return (
    <QuizExamen
      preguntas={licencia.preguntas}
      storageKey={`${id}_examen`}
      rutaEstudio={`/licencias/${id}/estudio`}
      titulo={licencia.titulo}
    />
  )
}
