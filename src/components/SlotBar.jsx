export default function SlotBar({ preguntas, preguntaActual, respuestas, modoExamen = false }) {
  const total = preguntas.length

  const getColor = (i) => {
    if (modoExamen) return respuestas[i] !== undefined ? '#6c757d' : null
    if (respuestas[i] === 'correcta')  return '#28a745'
    if (respuestas[i] === 'incorrecta') return '#dc3545'
    if (respuestas[i] === 'duda')      return '#ffc107'
    return null
  }

  const correctas   = respuestas.filter(r => r === 'correcta').length
  const incorrectas = respuestas.filter(r => r === 'incorrecta').length
  const dudas       = respuestas.filter(r => r === 'duda').length
  const respondidas = respuestas.filter(r => r !== undefined).length

  return (
    <div className="progbar-wrapper">
      <div className="progbar-header">
        <span className="progbar-label">Pregunta {preguntaActual + 1} / {total}</span>
        <div className="progbar-legend">
          {!modoExamen ? (
            <>
              {correctas   > 0 && <span className="progbar-legend--ok">✔ {correctas}</span>}
              {incorrectas > 0 && <span className="progbar-legend--err">✗ {incorrectas}</span>}
              {dudas       > 0 && <span className="progbar-legend--duda">🤔 {dudas}</span>}
            </>
          ) : (
            <span className="progbar-label">{respondidas} respondidas</span>
          )}
        </div>
      </div>

      <div className="progbar-track">
        {Array.from({ length: total }, (_, i) => {
          const color = getColor(i)
          const esActual = i === preguntaActual && !color
          return (
            <div
              key={i}
              className={`progbar-slot${esActual ? ' progbar-slot--actual' : ''}`}
              style={{ background: color || undefined }}
              title={`Pregunta ${i + 1}`}
            />
          )
        })}
      </div>
    </div>
  )
}
