export default function MisionPage() {
  return (
    <div className="mision-page">

      {/* Hero */}
      <section className="mision-hero animate-slide-left">
        <p className="mision-tag">✈️ Quiénes somos</p>
        <h2 className="mision-titulo">Nuestra misión</h2>
        <p className="mision-subtitulo">
          Hacer que estudiar para los exámenes ANAC sea claro, accesible y efectivo para
          cada estudiante de aviación en Argentina.
        </p>
      </section>

      {/* Fundador */}
      <section className="mision-fundador animate-fade-up">
        <div className="mision-fundador-img">
          <img src="/img/lucas titulo.webp" alt="Lucas, fundador de SoyPiloto" />
        </div>
        <div className="mision-fundador-texto">
          <span className="mision-tag">👨‍✈️ El fundador</span>
          <h3>¿Por qué creé SoyPiloto?</h3>
          <p>
            Soy Piloto nace de mi propia experiencia rindiendo exámenes aeronáuticos. Encontré que
            el material estaba desordenado, faltaba práctica real y no había una forma clara de
            medir el progreso. Eso generaba dudas e inseguridad innecesarias.
          </p>
          <p>
            Quise cambiar eso: una plataforma donde puedas estudiar fácil, enfocarte en lo
            importante y ganar confianza antes de rendir.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="mision-valores">
        {[
          {
            icon: '📋',
            titulo: 'Material oficial',
            texto: 'Preguntas basadas en el programa de ANAC. Nada de inventar: lo que practicás es lo que vas a encontrar en el examen.',
          },
          {
            icon: '📊',
            titulo: 'Seguimiento real',
            texto: 'Guardamos tus intentos y te mostramos exactamente en qué preguntas te confundís más, para que refuerces donde importa.',
          },
          {
            icon: '🤝',
            titulo: 'Pensado para pilotos',
            texto: 'No somos una app genérica de quizzes. Cada detalle está pensado por alguien que pasó por el mismo proceso que vos.',
          },
        ].map((v, i) => (
          <div key={v.titulo} className="mision-valor-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="mision-valor-icon">{v.icon}</span>
            <h4>{v.titulo}</h4>
            <p>{v.texto}</p>
          </div>
        ))}
      </section>

      {/* Cierre */}
      <section className="mision-cierre animate-fade-up">
        <p>
          Soy Piloto no es solo una app de estudio: es una comunidad de personas que comparten el
          mismo objetivo. Aprender, mejorar y avanzar juntos, siempre con la mirada puesta en el
          próximo despegue.
        </p>
        <p className="mision-cierre-frase">⛅ Nos vemos en los cielos ☁️</p>
      </section>

    </div>
  )
}
