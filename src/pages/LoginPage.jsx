import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { guardarIntento, getPerfil } from '../lib/db'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [codigo, setCodigo]     = useState('')
  const [enviado, setEnviado]   = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState(null)
  const navigate = useNavigate()

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
      setEnviado(true)
    }
  }

  const handleVerificar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError(null)

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: codigo,
      type: 'email',
    })

    setCargando(false)
    if (error) {
      setError('Código incorrecto o vencido. Revisá el mail e intentá de nuevo.')
      return
    }

    // Sincronizar intento pendiente si existía
    const pendingRaw = localStorage.getItem('soypiloto_pending_intento')
    if (pendingRaw && data.session) {
      try {
        const pending = JSON.parse(pendingRaw)
        await guardarIntento(data.session.user.id, pending.licenciaId, pending.modo, pending.stats)
        localStorage.removeItem('soypiloto_pending_intento')
      } catch (_) {}
    }

    // Usuario nuevo → onboarding; recurrente → perfil
    const perfil = await getPerfil(data.session.user.id)
    navigate(perfil ? '/perfil' : '/onboarding')
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h3 className="login-titulo">Iniciar sesión</h3>

        {!enviado ? (
          <>
            <p className="login-subtitulo">Te mandamos un código de 6 dígitos a tu email.</p>
            <form onSubmit={handleEnviar}>
              <div className="perfil-campo">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  autoFocus
                />
              </div>
              {error && <p className="login-error">{error}</p>}
              <button className="login-btn" type="submit" disabled={cargando}>
                {cargando ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="login-subtitulo">
              Ingresá el código de 6 dígitos que enviamos a <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerificar}>
              <div className="perfil-campo">
                <label>Código</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="login-input-codigo"
                />
              </div>
              {error && <p className="login-error">{error}</p>}
              <button className="login-btn" type="submit" disabled={cargando || codigo.length < 6}>
                {cargando ? 'Verificando...' : 'Ingresar'}
              </button>
            </form>
            <button className="login-btn-secondary" style={{ marginTop: '12px', width: '100%' }} onClick={() => { setEnviado(false); setError(null); setCodigo('') }}>
              Usar otro email
            </button>
          </>
        )}
      </div>
    </div>
  )
}
