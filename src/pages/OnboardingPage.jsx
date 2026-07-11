import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { upsertPerfil } from '../lib/db'
import { REGISTRY, PROXIMAS } from '../data/licencias-registry'

const TODAS_LICENCIAS = [
  ...Object.entries(REGISTRY).map(([id, l]) => ({ id, icon: l.icon, titulo: l.titulo })),
  ...PROXIMAS.map(l => ({ id: l.id, icon: l.icon, titulo: l.titulo })),
]

export default function OnboardingPage() {
  const { usuario, cargando } = useAuth()
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [nombre, setNombre] = useState('')
  const [licencias, setLicencias] = useState([])
  const [vencCMA, setVencCMA] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!cargando && !usuario) navigate('/login', { replace: true })
  }, [cargando, usuario, navigate])

  if (cargando || !usuario) return null

  const toggleLicencia = (id) => {
    setLicencias(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    )
  }

  const handleFinalizar = async () => {
    setGuardando(true)
    await upsertPerfil(usuario.id, {
      nombre: nombre.trim() || 'Sin nombre',
      licencias_obtenidas: licencias,
      venccma: vencCMA || null,
    })
    navigate('/licencias', { replace: true })
  }

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-steps">
        {[1, 2, 3].map(n => (
          <div key={n} className={`onboarding-step-dot${paso >= n ? ' onboarding-step-dot--activo' : ''}`} />
        ))}
      </div>

      {paso === 1 && (
        <div className="onboarding-card">
          <div className="onboarding-icon">✈️</div>
          <h2 className="onboarding-titulo">¡Bienvenido a SoyPiloto!</h2>
          <p className="onboarding-subtitulo">Para personalizar tu experiencia, necesitamos algunos datos.</p>
          <div className="perfil-campo">
            <label>¿Cómo te llamamos?</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && nombre.trim() && setPaso(2)}
            />
          </div>
          <button className="onboarding-btn" onClick={() => setPaso(2)} disabled={!nombre.trim()}>
            Continuar →
          </button>
        </div>
      )}

      {paso === 2 && (
        <div className="onboarding-card">
          <h2 className="onboarding-titulo">Tu perfil de piloto</h2>
          <p className="onboarding-subtitulo">Opcional — podés completarlo después desde tu perfil.</p>

          <div className="perfil-campo">
            <label>Licencias que ya obtuviste</label>
            <div className="perfil-lic-checks">
              {TODAS_LICENCIAS.map(l => (
                <div
                  key={l.id}
                  className={`perfil-lic-check${licencias.includes(l.id) ? ' perfil-lic-check--activa' : ''}`}
                  onClick={() => toggleLicencia(l.id)}
                >
                  <input type="checkbox" readOnly checked={licencias.includes(l.id)} />
                  <span>{l.icon} {l.titulo}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="perfil-campo">
            <label>Vencimiento de CMA (opcional)</label>
            <input
              type="date"
              value={vencCMA}
              onChange={e => setVencCMA(e.target.value)}
            />
          </div>

          <div className="onboarding-nav">
            <button className="onboarding-btn-sec" onClick={() => setPaso(1)}>← Atrás</button>
            <button className="onboarding-btn onboarding-btn--inline" onClick={() => setPaso(3)}>Continuar →</button>
          </div>
        </div>
      )}

      {paso === 3 && (
        <div className="onboarding-card">
          <h2 className="onboarding-titulo">¿Cómo funciona SoyPiloto?</h2>
          <p className="onboarding-subtitulo">Dos modos de práctica para que llegues preparado al ANAC.</p>

          <div className="onboarding-tour-grid">
            <div className="onboarding-tour-card">
              <div className="onboarding-tour-icon">📝</div>
              <h4 className="onboarding-tour-titulo">Modo Estudio</h4>
              <p className="onboarding-tour-desc">
                Practicá pregunta por pregunta con feedback inmediato.
                Marcá las que tenés duda para repasar.
                Tu progreso se guarda automáticamente.
              </p>
            </div>
            <div className="onboarding-tour-card">
              <div className="onboarding-tour-icon">⏱️</div>
              <h4 className="onboarding-tour-titulo">Modo Examen</h4>
              <p className="onboarding-tour-desc">
                Simulá el examen real con tiempo y sin pistas.
                Preguntas aleatorias, igual que en el ANAC.
                Gratis para todos.
              </p>
            </div>
          </div>

          <div className="onboarding-nav">
            <button className="onboarding-btn-sec" onClick={() => setPaso(2)}>← Atrás</button>
            <button className="onboarding-btn onboarding-btn--inline" onClick={handleFinalizar} disabled={guardando}>
              {guardando ? 'Guardando...' : '¡Empecemos! →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
