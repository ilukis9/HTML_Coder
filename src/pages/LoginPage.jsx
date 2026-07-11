import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { guardarIntento, getPerfil, upsertPerfil } from '../lib/db'
import { REGISTRY, PROXIMAS } from '../data/licencias-registry'
import { TEST_MODE } from '../lib/testMode'

const TODAS_LICENCIAS = [
  ...Object.entries(REGISTRY).map(([id, l]) => ({ id, icon: l.icon, titulo: l.titulo })),
  ...PROXIMAS.map(l => ({ id: l.id, icon: l.icon, titulo: l.titulo })),
]

const FADE_OUT = 160
const FADE_IN  = 40

export default function LoginPage() {
  // ── Auth ──────────────────────────────────────────────────────────
  const [etapa, setEtapa]             = useState('email') // email | codigo | nombre | licencias | tutorial
  const [modo, setModo]               = useState('login')
  const [imagenDerecha, setImagenDerecha] = useState(true)
  const [visible, setVisible]         = useState(true)
  const [email, setEmail]             = useState('')
  const [codigo, setCodigo]           = useState('')
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState(null)
  const [sesion, setSesion]           = useState(null)

  // ── Onboarding ────────────────────────────────────────────────────
  const [nombre, setNombre]           = useState('')
  const [licencias, setLicencias]     = useState([])
  const [vencCMA, setVencCMA]         = useState('')
  const [guardando, setGuardando]     = useState(false)

  const navigate     = useNavigate()
  const esRegistro   = modo === 'registro'
  const enOnboarding = ['nombre', 'licencias', 'tutorial'].includes(etapa)
  const etapaRef     = useRef(etapa)
  const imagenDerechaRef = useRef(imagenDerecha)
  useEffect(() => { etapaRef.current = etapa }, [etapa])
  useEffect(() => { imagenDerechaRef.current = imagenDerecha }, [imagenDerecha])

  // ── Post-login: pendientes + detección nuevo usuario ─────────────
  const handlePostLogin = useCallback(async (newSession) => {
    setSesion(newSession)
    const pendingRaw = localStorage.getItem('soypiloto_pending_intento')
    if (pendingRaw) {
      try {
        const p = JSON.parse(pendingRaw)
        await guardarIntento(newSession.user.id, p.licenciaId, p.modo, p.stats)
        localStorage.removeItem('soypiloto_pending_intento')
      } catch (_) {}
    }
    const perfil = await getPerfil(newSession.user.id)
    if (perfil) {
      navigate('/perfil')
    } else {
      // Nuevo usuario: onboarding dentro del card
      const voltear = imagenDerechaRef.current
      setVisible(false)
      if (voltear) setImagenDerecha(false)
      setTimeout(() => { setEtapa('nombre'); setError(null) }, FADE_OUT)
      setTimeout(() => setVisible(true), FADE_OUT + FADE_IN)
    }
  }, [navigate])

  // Escucha el magic link (cuando el usuario hace click en el mail)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_IN' && newSession) {
        const etapaActual = etapaRef.current
        if (etapaActual === 'email' || etapaActual === 'codigo') {
          handlePostLogin(newSession)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [handlePostLogin])

  // ── Animación de transición ───────────────────────────────────────
  const transicion = (nuevaEtapa, { voltearImagen = false } = {}) => {
    setVisible(false)
    if (voltearImagen) setImagenDerecha(d => !d)
    setTimeout(() => {
      setEtapa(nuevaEtapa)
      setError(null)
    }, FADE_OUT)
    setTimeout(() => setVisible(true), FADE_OUT + FADE_IN)
  }

  // ── Handlers auth ─────────────────────────────────────────────────
  const handleEnviar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    setCargando(false)
    if (error) {
      setError('No se pudo enviar el código. Revisá el email e intentá de nuevo.')
    } else {
      transicion('codigo')
    }
  }

  const handleVerificar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError(null)
    const { data, error } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'email' })
    setCargando(false)
    if (error) {
      setError('Código incorrecto o vencido. Revisá el mail e intentá de nuevo.')
      return
    }

    // Sincronizar intento pendiente
    const pendingRaw = localStorage.getItem('soypiloto_pending_intento')
    if (pendingRaw && data.session) {
      try {
        const p = JSON.parse(pendingRaw)
        await guardarIntento(data.session.user.id, p.licenciaId, p.modo, p.stats)
        localStorage.removeItem('soypiloto_pending_intento')
      } catch (_) {}
    }

    await handlePostLogin(data.session)
  }

  // ── [Modo prueba] Saltear login sin sesión real ────────────────────
  // No crea sesión en Supabase: navega directo como invitado, igual que
  // ya permite Modo Examen. Los resultados se guardan solo en localStorage.
  const handleSaltearLogin = () => navigate('/licencias')

  // ── Handlers onboarding ───────────────────────────────────────────
  const toggleLicencia = (id) =>
    setLicencias(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id])

  const handleFinalizar = async () => {
    setGuardando(true)
    await upsertPerfil(sesion.user.id, {
      nombre: nombre.trim() || 'Sin nombre',
      licencias_obtenidas: licencias,
      venccma: vencCMA || null,
    })
    navigate('/licencias', { replace: true })
  }

  // ── Cambiar login ↔ registro ──────────────────────────────────────
  const cambiarModo = () => {
    setVisible(false)
    setImagenDerecha(d => !d)
    setTimeout(() => {
      setModo(m => m === 'login' ? 'registro' : 'login')
      setEtapa('email')
      setError(null)
      setCodigo('')
    }, FADE_OUT)
    setTimeout(() => setVisible(true), FADE_OUT + FADE_IN)
  }

  // ── Indicador de pasos (onboarding) ──────────────────────────────
  const PASOS_OB = ['nombre', 'licencias', 'tutorial']
  const pasoActual = PASOS_OB.indexOf(etapa) // -1 si no está en onboarding

  return (
    <div className="login-wrap">
      <div className={`login-card${imagenDerecha ? '' : ' login-card--registro'}`}>

        {/* ── Contenido ── */}
        <div className={`login-content${visible ? '' : ' login-content--oculto'}`}>

          {/* Indicador de pasos durante onboarding */}
          {enOnboarding && (
            <div className="login-ob-steps">
              {PASOS_OB.map((_, i) => (
                <div key={i} className={`login-ob-dot${i <= pasoActual ? ' login-ob-dot--activo' : ''}`} />
              ))}
            </div>
          )}

          <img src="/img/SoyPiloto2.png" alt="SoyPiloto" className="login-logo" />

          {/* ── Paso: email ── */}
          {etapa === 'email' && (
            <>
              <h2 className="login-titulo">{esRegistro ? '¡Creá tu cuenta!' : '¡Hola de nuevo!'}</h2>
              <h3 className="login-subtitulo">{esRegistro ? 'Unite a SoyPiloto' : 'Bienvenido a bordo'}</h3>
              <form onSubmit={handleEnviar}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Correo electrónico" required autoFocus />
                {error && <p className="login-error">{error}</p>}
                <button className="login-btn" type="submit" disabled={cargando}>
                  {cargando ? 'Enviando...' : esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
                </button>
              </form>
              <p className="login-toggle-text">
                {esRegistro ? '¿Ya tenés cuenta? ' : '¿No tenés cuenta? '}
                <button className="login-toggle-link" onClick={cambiarModo}>
                  {esRegistro ? 'Iniciá sesión' : 'Crear cuenta'}
                </button>
              </p>
              {TEST_MODE && (
                <button type="button" className="login-btn-test" disabled={cargando}
                  onClick={handleSaltearLogin}>
                  🧪 Saltear login (modo prueba)
                </button>
              )}
            </>
          )}

          {/* ── Paso: código OTP ── */}
          {etapa === 'codigo' && (
            <>
              <h2 className="login-titulo">Revisá tu email</h2>
              <h3 className="login-subtitulo">
                Enviamos un mail a <strong>{email}</strong>
              </h3>
              <p className="login-link-aviso">
                Ingresá el código de 8 dígitos que enviamos a tu email.
              </p>
              <form onSubmit={handleVerificar}>
                <input type="text" inputMode="numeric" maxLength={8} value={codigo}
                  onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
                  placeholder="12345678" autoFocus className="login-input-codigo" />
                {error && <p className="login-error">{error}</p>}
                <button className="login-btn" type="submit" disabled={cargando || codigo.length < 6}>
                  {cargando ? 'Verificando...' : 'Ingresar con código'}
                </button>
              </form>
              <p className="login-toggle-text">
                <button className="login-toggle-link" onClick={() => transicion('email')}>
                  ← Usar otro email
                </button>
              </p>
            </>
          )}

          {/* ── Paso onboarding 1: nombre ── */}
          {etapa === 'nombre' && (
            <>
              <h2 className="login-titulo">¡Bienvenido!</h2>
              <h3 className="login-subtitulo">¿Cuál es tu nombre completo?</h3>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Nombre y apellido" autoFocus
                onKeyDown={e => e.key === 'Enter' && nombre.trim() && transicion('licencias')} />
              <button className="login-btn" style={{ marginTop: '8px' }}
                onClick={() => transicion('licencias')} disabled={!nombre.trim()}>
                Continuar →
              </button>
            </>
          )}

          {/* ── Paso onboarding 2: licencias + CMA ── */}
          {etapa === 'licencias' && (
            <>
              <h2 className="login-titulo">¿Qué querés practicar?</h2>
              <h3 className="login-subtitulo">Seleccioná las licencias que te interesan</h3>
              <div className="perfil-lic-checks login-lic-checks">
                {TODAS_LICENCIAS.map(l => (
                  <div key={l.id}
                    className={`perfil-lic-check${licencias.includes(l.id) ? ' perfil-lic-check--activa' : ''}`}
                    onClick={() => toggleLicencia(l.id)}>
                    <input type="checkbox" readOnly checked={licencias.includes(l.id)} />
                    <span>{l.icon} {l.titulo}</span>
                  </div>
                ))}
              </div>
              <div className="perfil-campo" style={{ marginTop: '12px', marginBottom: 0 }}>
                <label>Vencimiento de CMA (opcional)</label>
                <input type="date" value={vencCMA} onChange={e => setVencCMA(e.target.value)} />
              </div>
              <div className="login-nav">
                <button className="login-btn-sec" onClick={() => transicion('nombre')}>← Atrás</button>
                <button className="login-btn login-btn--inline" onClick={() => transicion('tutorial')}>
                  Continuar →
                </button>
              </div>
            </>
          )}

          {/* ── Paso onboarding 3: tutorial ── */}
          {etapa === 'tutorial' && (
            <>
              <h2 className="login-titulo">¿Cómo funciona?</h2>
              <h3 className="login-subtitulo">Dos modos para llegar preparado al ANAC</h3>
              <div className="login-tour-grid">
                <div className="login-tour-card">
                  <div className="login-tour-icon">📝</div>
                  <h4>Modo Estudio</h4>
                  <p>Feedback inmediato en cada respuesta. Marcá tus dudas y repasalas.</p>
                </div>
                <div className="login-tour-card">
                  <div className="login-tour-icon">⏱️</div>
                  <h4>Modo Examen</h4>
                  <p>Simulá el examen real con tiempo. Preguntas aleatorias, igual que el ANAC.</p>
                </div>
              </div>
              <div className="login-nav">
                <button className="login-btn-sec" onClick={() => transicion('licencias')}>← Atrás</button>
                <button className="login-btn login-btn--inline" onClick={handleFinalizar} disabled={guardando}>
                  {guardando ? 'Guardando...' : '¡Empecemos! →'}
                </button>
              </div>
            </>
          )}

        </div>

        {/* ── Imagen ── */}
        <div className="login-img-panel">
          <img src="/img/Imagen portada.png" alt="SoyPiloto" />
        </div>
      </div>
    </div>
  )
}
