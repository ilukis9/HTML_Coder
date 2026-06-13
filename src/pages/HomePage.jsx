import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content animate-slide-left">
          <p className="hero-tag">✈️ Plataforma de estudio aeronáutico</p>
          <h2 className="hero-title">
            Tu sueño puede ser realidad,<br />
            vos ya sos <strong>Piloto!</strong>
          </h2>
          <p className="hero-sub">
            Preparate para tus exámenes ANAC con simuladores, seguimiento de progreso
            y preguntas reales de cada licencia.
          </p>
          <div className="hero-actions">
            <Link to="/licencias" className="btn-hero-primary">Comenzar a estudiar →</Link>
            <Link to="/mision" className="btn-hero-secondary">Nuestra misión</Link>
          </div>
        </div>
        <div className="hero-image animate-slide-right">
          <img src="/img/avion.webp" alt="Cessna 172" />
        </div>
      </section>

      {/* Features */}
      <section className="features">
        {[
          { icon: '📋', titulo: 'Preguntas reales', texto: 'Banco de preguntas basado en el material oficial de ANAC para cada licencia.' },
          { icon: '📊', titulo: 'Seguimiento de progreso', texto: 'Guardamos tus intentos y te mostramos las preguntas donde más te confundís.' },
          { icon: '⏱️', titulo: 'Modo Examen', texto: 'Simulá el examen real con preguntas aleatorias y tiempo límite.' },
        ].map(f => (
          <div key={f.titulo} className="feature-card animate-fade-up">
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.titulo}</h3>
            <p>{f.texto}</p>
          </div>
        ))}
      </section>

      {/* Secciones alternadas */}
      <section className="home-section animate-fade-up">
        <div className="home-section-text">
          <p>
            Accedé a material pensado para la realidad del examen: preguntas tipo, explicaciones
            simples y seguimiento de tu progreso. Nuestro enfoque está diseñado para que entiendas,
            practiques y llegues seguro al momento de rendir, con la confianza que necesita todo piloto.
          </p>
        </div>
        <div className="home-section-img">
          <img src="/img/piloto 3.webp" alt="Piloto con avion" />
        </div>
      </section>

      <section className="home-section home-section-reverse animate-fade-up">
        <div className="home-section-text">
          <p>
            <strong>Tu formación empieza hoy, tu futuro despega mañana.</strong><br /><br />
            Ya sea que estés dando tus primeros pasos o avanzando hacia una nueva licencia, SoyPiloto
            te acompaña en cada etapa. Organizá tu estudio, reforzá tus puntos débiles y entrená como
            un verdadero piloto desde el primer día.
          </p>
        </div>
        <div className="home-section-img">
          <img src="/img/avion2.webp" alt="Cirrus Vision Jet" />
        </div>
      </section>
    </>
  )
}
