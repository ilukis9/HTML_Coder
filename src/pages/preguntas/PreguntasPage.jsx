import { useState, useEffect } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { REGISTRY } from '../../data/licencias-registry'
import { useAuth } from '../../hooks/useAuth'
import { usePreguntasEstado } from '../../hooks/usePreguntasEstado'
import { TEST_MODE } from '../../lib/testMode'
import ImagenZoom from '../../components/quiz/ImagenZoom'

const LETRAS = ['A', 'B', 'C', 'D']

const FILTROS = [
  { key: 'todas', label: 'Todas' },
  { key: 'favoritas', label: '⭐ Favoritas' },
  { key: 'priorizar', label: '🚩 Priorizar' },
]

export default function PreguntasPage() {
  const { id } = useParams()
  const { usuario, cargando } = useAuth()
  const navigate = useNavigate()
  const licencia = REGISTRY[id]
  const [filtro, setFiltro] = useState('todas')
  const {
    estado,
    limiteFavoritasAlcanzado,
    totalFavoritas,
    maxFavoritas,
    toggleFavorita,
    togglePrioridad,
  } = usePreguntasEstado(id)

  useEffect(() => {
    if (!TEST_MODE && !cargando && !usuario) {
      navigate('/login', { replace: true })
    }
  }, [cargando, usuario, navigate])

  if (!licencia) return <Navigate to="/preguntas" replace />
  if (!TEST_MODE && (cargando || !usuario)) return null

  const preguntasConIndice = licencia.preguntas.map((pregunta, index) => ({ ...pregunta, index }))

  const preguntasFiltradas = preguntasConIndice.filter(p => {
    if (filtro === 'favoritas')  return estado[p.index]?.favorita
    if (filtro === 'priorizar')  return estado[p.index]?.prioridad
    return true
  })

  const grupos = licencia.temas
    .map(tema => ({ tema, preguntas: preguntasFiltradas.filter(p => p.tema === tema) }))
    .filter(g => g.preguntas.length > 0)

  return (
    <>
      <div className="licencias-header">
        <h2>{licencia.icon} {licencia.titulo}</h2>
        <p className="licencias-subtitulo">
          Repasá las preguntas por tema — {totalFavoritas}/{maxFavoritas} favoritas.
        </p>
      </div>

      <div className="preguntas-filtro-tabs">
        {FILTROS.map(f => (
          <button
            key={f.key}
            className={`preguntas-filtro-tab${filtro === f.key ? ' preguntas-filtro-tab--activo' : ''}`}
            onClick={() => setFiltro(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {grupos.length === 0 && (
        <p className="historial-vacio">No hay preguntas para este filtro todavía.</p>
      )}

      {grupos.map(({ tema, preguntas }) => (
        <section key={tema} className="preguntas-tema-seccion">
          <h3 className="preguntas-tema-header">{tema}</h3>

          {preguntas.map(pregunta => {
            const est = estado[pregunta.index] ?? { favorita: false, prioridad: false }
            const favoritaDeshabilitada = !est.favorita && limiteFavoritasAlcanzado

            return (
              <div key={pregunta.index} className="carta-pregunta shadow-sm">
                <div className="carta-pregunta-header">
                  <span className="pregunta-num">Pregunta {pregunta.index + 1}</span>
                  <div className="pregunta-toggle-group">
                    <button
                      type="button"
                      className={`pregunta-toggle-btn${est.favorita ? ' pregunta-toggle-btn--activo' : ''}`}
                      onClick={() => toggleFavorita(pregunta.index)}
                      disabled={favoritaDeshabilitada}
                      title={favoritaDeshabilitada ? `Máximo ${maxFavoritas} favoritas — desmarcá una para agregar otra` : 'Marcar como favorita'}
                    >
                      ⭐
                    </button>
                    <button
                      type="button"
                      className={`pregunta-toggle-btn${est.prioridad ? ' pregunta-toggle-btn--activo' : ''}`}
                      onClick={() => togglePrioridad(pregunta.index)}
                      title="Marcar para priorizar / repasar"
                    >
                      🚩
                    </button>
                  </div>
                </div>

                <p className="pregunta-texto">{pregunta.pregunta}</p>

                {pregunta.imagen && (
                  <div className="text-center mb-3">
                    <ImagenZoom src={pregunta.imagen} width={pregunta.imagenAncho} />
                  </div>
                )}

                <div>
                  {pregunta.opciones.map((opcion, i) => (
                    <label
                      key={i}
                      className={`preguntas-opciones bloqueada${i === pregunta.correcta ? ' opcion-correcta' : ''}`}
                    >
                      <span>{i === pregunta.correcta ? '✔ ' : ''}{LETRAS[i]}: {opcion}</span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      ))}
    </>
  )
}
