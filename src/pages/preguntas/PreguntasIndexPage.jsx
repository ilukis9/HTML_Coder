import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { REGISTRY } from '../../data/licencias-registry'
import { useAuth } from '../../hooks/useAuth'
import { TEST_MODE } from '../../lib/testMode'

export default function PreguntasIndexPage() {
  const { usuario, cargando } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!TEST_MODE && !cargando && !usuario) {
      navigate('/login', { replace: true })
    }
  }, [cargando, usuario, navigate])

  if (!TEST_MODE && (cargando || !usuario)) return null

  return (
    <>
      <div className="licencias-header">
        <h2>Preguntas</h2>
        <p className="licencias-subtitulo">Elegí una licencia para repasar sus preguntas por tema.</p>
      </div>

      <div className="licencias-grid">
        {Object.entries(REGISTRY).map(([id, lic], index) => (
          <article
            key={id}
            className="licencia-card licencia-card-activa"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="licencia-card-icon">{lic.icon}</div>
            <div className="licencia-card-body">
              <h3 className="licencia-card-titulo">{lic.titulo}</h3>
              <p className="licencia-card-detalle">{lic.detalle}</p>
            </div>
            <div className="licencia-card-footer">
              <Link to={`/preguntas/${id}`} className="btn-licencia">
                Ver preguntas
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
