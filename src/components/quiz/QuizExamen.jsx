import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuizExamen } from '../../hooks/useQuizExamen'
import { useQuizHeader } from '../../context/QuizHeaderContext'
import { useAuth } from '../../hooks/useAuth'
import SlotBar from '../SlotBar'
import ImagenZoom from './ImagenZoom'

const LETRAS = ['A', 'B', 'C', 'D']

export default function QuizExamen({ preguntas, storageKey, rutaEstudio, titulo }) {
  const exam = useQuizExamen(preguntas, storageKey)
  const { setQuizHeader } = useQuizHeader()
  const pos = exam.posicion
  const indiceReal = exam.ordenPreguntas[pos]
  const pregunta = preguntas[indiceReal]
  const respuestaActual = exam.respuestasExamen[pos]
  const respondidas = exam.respuestasExamen.filter(r => r !== undefined).length
  const [modalEntrega, setModalEntrega] = useState(null) // null | número de sin responder

  useEffect(() => {
    const urgente = exam.tiempoRestante <= 120
    setQuizHeader({
      titulo,
      timerEl: (
        <span className={`quiz-header-timer${urgente ? ' timer-urgente' : ''}`}>
          ⏱ {exam.formatearTiempo(exam.tiempoRestante)}
        </span>
      ),
    })
  }, [titulo, exam.tiempoRestante, exam.formatearTiempo, setQuizHeader])

  useEffect(() => () => setQuizHeader(null), [setQuizHeader])

  if (exam.finalizado) {
    return (
      <ResultadoExamen
        exam={exam}
        preguntas={preguntas}
        rutaEstudio={rutaEstudio}
      />
    )
  }

  const sinResponder = exam.respuestasExamen.filter(r => r === undefined).length
  const todasRespondidas = sinResponder === 0

  // Siguiente salta a la próxima sin responder (o avanza normal si todas respondidas)
  const handleSiguiente = () => {
    if (todasRespondidas) {
      exam.setPosicion(pos + 1)
      return
    }
    // Busca la siguiente sin responder después de la posición actual
    for (let i = pos + 1; i < preguntas.length; i++) {
      if (exam.respuestasExamen[i] === undefined) { exam.setPosicion(i); return }
    }
    // Si no hay después, busca desde el principio
    for (let i = 0; i < pos; i++) {
      if (exam.respuestasExamen[i] === undefined) { exam.setPosicion(i); return }
    }
  }

  const handleIrPrimeraSinResponder = () => {
    const primera = exam.respuestasExamen.findIndex(r => r === undefined)
    if (primera !== -1) exam.setPosicion(primera)
    setModalEntrega(false)
  }

  return (
    <>
      <SlotBar
        preguntas={preguntas}
        preguntaActual={pos}
        respuestas={exam.respuestasExamen}
        modoExamen
      />

      <div className="carta-pregunta shadow-sm">
        <div className="carta-pregunta-header">
          <span className="carta-num">Pregunta {pos + 1} / {preguntas.length}</span>
          <span className="badge bg-secondary">{respondidas} respondidas</span>
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
              className={`preguntas-opciones ${respuestaActual === i ? 'opcion-seleccionada' : ''}`}
              onClick={() => exam.seleccionarRespuesta(pos, i)}
            >
              <input type="radio" name={`pregEx${pos}`} value={i} readOnly />
              <span>{LETRAS[i]}: {opcion}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="quiz-bottom-bar">
        <div className="quiz-stats-bar">
          <span className="qsb-respondidas">{respondidas} / {preguntas.length} respondidas</span>
          <span className="qsb-pos">{pos + 1} / {preguntas.length}</span>
        </div>
        <div className="quiz-nav quiz-nav--examen">
          {pos > 0
            ? <button className="btn btn-outline-secondary" onClick={() => exam.setPosicion(pos - 1)}>← Anterior</button>
            : <span />
          }
          {(todasRespondidas || pos === preguntas.length - 1)
            ? <button className="btn btn-success" onClick={() => setModalEntrega(true)}>Entregar ✓</button>
            : <button className="btn btn-primary" onClick={handleSiguiente}>Siguiente →</button>
          }
        </div>
      </div>

      {modalEntrega && (
        <div className="modal-overlay" onClick={() => setModalEntrega(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-titulo">
                {sinResponder > 0 ? '⚠️ Preguntas sin responder' : '¿Confirmás la entrega?'}
              </h3>
            </div>
            <p style={{ marginBottom: '1.5rem' }}>
              {sinResponder > 0
                ? <>Respondiste <strong>{respondidas} de {preguntas.length}</strong> preguntas. Todavía te quedan <strong>{sinResponder}</strong> sin responder.</>
                : <>Respondiste todas las preguntas. Una vez que entregues no podés modificar las respuestas.</>
              }
            </p>
            <div className="modal-acciones">
              <button className="modal-btn-cancelar" onClick={handleIrPrimeraSinResponder}>
                Revisar
              </button>
              <button className="modal-btn-guardar" onClick={() => { setModalEntrega(false); exam.finalizar(exam.respuestasExamen) }}>
                {sinResponder > 0 ? 'Entregar con respuestas incompletas' : 'Entregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ResultadoExamen({ exam, preguntas, rutaEstudio }) {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  let correctas = 0
  const detalles = []

  for (let i = 0; i < preguntas.length; i++) {
    const indiceReal = exam.ordenPreguntas[i]
    const pregunta = preguntas[indiceReal]
    const respuesta = exam.respuestasExamen[i]
    const esCorrecta = respuesta === pregunta.correcta

    if (esCorrecta) correctas++

    detalles.push({
      numero: i + 1,
      pregunta: pregunta.pregunta,
      esCorrecta,
      opcionElegida: respuesta !== undefined
        ? `${LETRAS[respuesta]}: ${pregunta.opciones[respuesta]}`
        : 'Sin responder',
      opcionCorrecta: `${LETRAS[pregunta.correcta]}: ${pregunta.opciones[pregunta.correcta]}`,
    })
  }

  const total = preguntas.length
  const porcentaje = Math.round((correctas / total) * 100)
  const aprobado = porcentaje >= exam.UMBRAL_APROBACION
  const colorBarra = aprobado ? 'bg-success' : 'bg-danger'

  return (
    <div className="carta-pregunta shadow-sm p-4 mb-4 text-center">
      <h3 className="fw-bold mb-3">Resultado del Examen</h3>

      {aprobado
        ? <div className="alert alert-success fw-bold fs-5 mb-3">✈️ ¡Aprobado!</div>
        : <div className="alert alert-danger fw-bold fs-5 mb-3">
            ✗ Desaprobado — necesitás al menos {exam.UMBRAL_APROBACION}% para aprobar.
          </div>
      }

      <p className="fs-4 mb-2">
        {correctas} / {total} correctas{' '}
        <span className={`badge ${colorBarra} ms-2`}>{porcentaje}%</span>
      </p>
      <div className="progress mb-4" style={{ height: 24 }}>
        <div className={`progress-bar ${colorBarra}`} style={{ width: `${porcentaje}%` }}>
          {porcentaje}%
        </div>
      </div>

      <h5 className="text-start fw-bold mt-4">Detalle pregunta por pregunta:</h5>
      <ul className="list-group mt-2 text-start">
        {detalles.map(d => (
          <li
            key={d.numero}
            className={`list-group-item ${d.esCorrecta ? 'list-group-item-success' : 'list-group-item-danger'} py-2`}
          >
            <div className="fw-bold">{d.esCorrecta ? '✔' : '✗'} P{d.numero}: {d.pregunta}</div>
            {!d.esCorrecta && (
              <div className="small mt-1">
                Tu respuesta: <em>{d.opcionElegida}</em><br />
                Correcta: <strong>{d.opcionCorrecta}</strong>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
        <Link to={window.location.pathname} reloadDocument className="btn btn-primary">
          Volver a intentar
        </Link>
        {usuario
          ? <Link to="/perfil" className="btn btn-outline-secondary">Ver mi perfil</Link>
          : <button className="btn btn-outline-secondary" onClick={() => navigate('/login')}>
              Ver mi perfil
            </button>
        }
      </div>
    </div>
  )
}
