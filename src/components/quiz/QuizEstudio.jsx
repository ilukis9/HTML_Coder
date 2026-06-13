import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuizEstudio } from '../../hooks/useQuizEstudio'
import { useQuizHeader } from '../../context/QuizHeaderContext'
import SlotBar from '../SlotBar'
import ImagenZoom from './ImagenZoom'

const LETRAS = ['A', 'B', 'C', 'D']

export default function QuizEstudio({ preguntas, storageKey, rutaExamen, titulo }) {
  const quiz = useQuizEstudio(preguntas, storageKey)
  const { setQuizHeader } = useQuizHeader()
  const n = quiz.preguntaActual

  useEffect(() => {
    setQuizHeader({ titulo, timerEl: null })
    return () => setQuizHeader(null)
  }, [titulo, setQuizHeader])

  if (quiz.finalizado) {
    return <ResultadoEstudio quiz={quiz} preguntas={preguntas} rutaExamen={rutaExamen} />
  }

  const pregunta       = preguntas[n]
  const respuesta      = quiz.respuestas[n]
  const yaRespondio    = respuesta === 'correcta' || respuesta === 'incorrecta'
  const esDuda         = respuesta === 'duda'
  const correctasCount   = quiz.respuestas.filter(r => r === 'correcta').length
  const incorrectasCount = quiz.respuestas.filter(r => r === 'incorrecta').length
  const dudasCount       = quiz.respuestas.filter(r => r === 'duda').length

  return (
    <>
      <SlotBar preguntas={preguntas} preguntaActual={n} respuestas={quiz.respuestas} />

      <div className="carta-pregunta shadow-sm">
        <div className="carta-pregunta-header">
          <span className="carta-num">Pregunta {n + 1} / {preguntas.length}</span>
          {esDuda && <span className="badge bg-warning text-dark">🤔 Duda</span>}
        </div>

        <p className="pregunta-texto">{pregunta.pregunta}</p>

        {pregunta.imagen && (
          <div className="text-center mb-3">
            <ImagenZoom src={pregunta.imagen} width={pregunta.imagenAncho} />
          </div>
        )}

        <div>
          {pregunta.opciones.map((opcion, i) => {
            let clase = 'preguntas-opciones'
            let icono = ''

            if (yaRespondio) {
              if (i === pregunta.correcta) { clase += ' opcion-correcta'; icono = '✔ ' }
              else if (i === quiz.opcionElegida[n]) { clase += ' opcion-incorrecta'; icono = '✗ ' }
              clase += ' bloqueada'
            }

            return (
              <label
                key={i}
                className={clase}
                onClick={() => !yaRespondio && quiz.responder(n, i)}
              >
                <input type="radio" name={`pregunta${n}`} value={i} readOnly />
                <span>{icono}{LETRAS[i]}: {opcion}</span>
              </label>
            )
          })}
        </div>

        {yaRespondio && respuesta === 'correcta' && (
          <div className="feedback-msg feedback-ok mt-3">✔ ¡Correcto!</div>
        )}
        {yaRespondio && respuesta === 'incorrecta' && (
          <div className="feedback-msg feedback-err mt-3">
            ✗ Incorrecto. La correcta era:{' '}
            <strong>{LETRAS[pregunta.correcta]}: {pregunta.opciones[pregunta.correcta]}</strong>
          </div>
        )}
        {esDuda && (
          <div className="feedback-msg feedback-duda mt-3">
            🤔 Marcada como duda. La vas a ver al final.
          </div>
        )}
      </div>

      <div className="quiz-bottom-bar">
        <div className="quiz-stats-bar">
          {correctasCount   > 0 && <span className="qsb-ok">✔ {correctasCount}</span>}
          {incorrectasCount > 0 && <span className="qsb-err">✗ {incorrectasCount}</span>}
          {dudasCount       > 0 && <span className="qsb-duda">🤔 {dudasCount}</span>}
          <span className="qsb-pos">{n + 1} / {preguntas.length}</span>
        </div>
        <div className="quiz-nav">
          {n > 0
            ? <button className="btn btn-outline-secondary" onClick={() => quiz.setPreguntaActual(n - 1)}>← Anterior</button>
            : <span />
          }
          {!yaRespondio
            ? <button className="btn btn-warning" onClick={() => quiz.marcarDuda(n)}>🤔 Duda</button>
            : <span />
          }
          {n === preguntas.length - 1
            ? <button className="btn btn-success" onClick={quiz.finalizar}>Ver resultados ✓</button>
            : <button className="btn btn-primary" onClick={() => quiz.setPreguntaActual(n + 1)}>Siguiente →</button>
          }
        </div>
      </div>
    </>
  )
}

function ResultadoEstudio({ quiz, preguntas, rutaExamen }) {
  const correctas = quiz.respuestas.filter(r => r === 'correcta').length
  const total = preguntas.length
  const porcentaje = Math.round((correctas / total) * 100)
  const colorBarra = porcentaje >= 75 ? 'bg-success' : 'bg-danger'

  const incorrectas = quiz.respuestas
    .map((r, i) => (r === 'incorrecta' ? i : null))
    .filter(n => n !== null)

  const dudas = quiz.respuestas
    .map((r, i) => (r === 'duda' ? i : null))
    .filter(n => n !== null)

  return (
    <div className="carta-pregunta shadow-sm p-4 mb-4 text-center">
      <h3 className="fw-bold mb-3">🎯 Resultado final</h3>
      <p className="fs-4">
        {correctas} / {total} correctas{' '}
        <span className={`badge ${colorBarra} ms-2`}>{porcentaje}%</span>
      </p>
      <div className="progress mb-4" style={{ height: 24 }}>
        <div className={`progress-bar ${colorBarra}`} style={{ width: `${porcentaje}%` }}>
          {porcentaje}%
        </div>
      </div>

      <h5 className="text-start fw-bold mt-4">✗ Preguntas incorrectas:</h5>
      {incorrectas.length === 0 ? (
        <p className="text-success">¡Sin errores!</p>
      ) : (
        <ul className="list-group mt-2 text-start">
          {incorrectas.map(i => (
            <li key={i} className="list-group-item list-group-item-danger">
              <strong>P{i + 1}:</strong> {preguntas[i].pregunta}
            </li>
          ))}
        </ul>
      )}

      {dudas.length > 0 && (
        <>
          <h5 className="text-start fw-bold mt-4">🤔 Dudas para repasar:</h5>
          <ul className="list-group mt-2 text-start">
            {dudas.map(i => (
              <li key={i} className="list-group-item list-group-item-warning">
                <strong>P{i + 1}:</strong> {preguntas[i].pregunta}
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-4 d-flex justify-content-center gap-2 flex-wrap">
        <button className="btn btn-primary" onClick={quiz.reiniciar}>Volver a intentar</button>
        <Link to="/perfil" className="btn btn-outline-secondary">Ver mi perfil</Link>
      </div>
    </div>
  )
}
