import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { REGISTRY } from '../data/licencias-registry'
import { useAuth } from '../hooks/useAuth'
import { getPerfil, upsertPerfil, getIntentos } from '../lib/db'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

function getTrofeo(completadas) {
  if (completadas === 0) return { icono: '🎓', nivel: 'Estudiante' }
  if (completadas === 1) return { icono: '🥉', nivel: 'Piloto en formación' }
  if (completadas < 6)   return { icono: '🥈', nivel: 'Piloto experimentado' }
  if (completadas < 10)  return { icono: '🥇', nivel: 'Piloto avanzado' }
  return { icono: '🏆', nivel: 'Piloto élite' }
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return '—'
  return new Date(fechaISO).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ── Modal: editar perfil ──────────────────────────────────────────

function ModalEditarPerfil({ usuario, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre:      usuario.nombre      || '',
    email:       usuario.email       || '',
    vencCMA:     usuario.vencCMA     || '',
    licencias:   usuario.licencias   || [],
  })

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const toggleLicencia = (id) => {
    setForm(prev => ({
      ...prev,
      licencias: prev.licencias.includes(id)
        ? prev.licencias.filter(l => l !== id)
        : [...prev.licencias, id],
    }))
  }

  const handleSubmit = e => { e.preventDefault(); onGuardar(form) }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-titulo">Editar perfil</h3>
          <button className="modal-cerrar" onClick={onCerrar}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="perfil-campo">
            <label>Nombre y Apellido</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Tu nombre completo" />
          </div>
          <div className="perfil-campo">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@email.com" />
          </div>
          <div className="perfil-campo">
            <label>Vencimiento CMA</label>
            <input name="vencCMA" type="date" value={form.vencCMA} onChange={handleChange} />
          </div>
          <div className="perfil-campo">
            <label>Licencias obtenidas</label>
            <div className="perfil-lic-checks">
              {Object.entries(REGISTRY).map(([id, lic]) => (
                <label key={id} className={`perfil-lic-check${form.licencias.includes(id) ? ' perfil-lic-check--activa' : ''}`}>
                  <input
                    type="checkbox"
                    checked={form.licencias.includes(id)}
                    onChange={() => toggleLicencia(id)}
                  />
                  {lic.icon} {lic.titulo}
                </label>
              ))}
            </div>
          </div>
          <div className="modal-acciones">
            <button type="button" className="modal-btn-cancelar" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="modal-btn-guardar">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal: historial de intentos ──────────────────────────────────

function FilaIntento({ intento, tipo }) {
  const pct = intento.porcentaje ?? Math.round((intento.correctas / intento.total) * 100)
  const aprobado = intento.aprobado ?? pct >= 75

  return (
    <div className="historial-fila">
      <div className="historial-fila-top">
        <span className="historial-tipo">{tipo}</span>
        <span className={`historial-badge ${aprobado ? 'historial-badge--ok' : 'historial-badge--err'}`}>
          {aprobado ? '✔ Aprobado' : '✗ Desaprobado'}
        </span>
        <span className="historial-pct">{pct}%</span>
      </div>
      <div className="historial-fila-stats">
        <span>✔ {intento.correctas}</span>
        <span>✗ {intento.incorrectas}</span>
        {intento.dudas > 0 && <span>🤔 {intento.dudas}</span>}
        <span className="historial-fecha">{formatearFecha(intento.fecha)}</span>
      </div>
    </div>
  )
}

function ModalHistorial({ licenciaId, licencia, datosEstudio, datosExamen, onCerrar }) {
  const tieneRespuestas = (i) => (i.correctas ?? 0) + (i.incorrectas ?? 0) + (i.dudas ?? 0) > 0
  const intentosEstudio = [...(datosEstudio?.intentos ?? [])].filter(tieneRespuestas).reverse()
  const intentosExamen  = [...(datosExamen?.intentos  ?? [])].filter(tieneRespuestas).reverse()
  const totalIntentos   = intentosEstudio.length + intentosExamen.length

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-box modal-box--wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-titulo">{licencia.icon} {licencia.titulo}</h3>
          <button className="modal-cerrar" onClick={onCerrar}>✕</button>
        </div>

        {totalIntentos === 0 ? (
          <p className="historial-vacio">Sin intentos registrados aún.</p>
        ) : (
          <>
            {intentosEstudio.length > 0 && (
              <section className="historial-seccion">
                <h4 className="historial-seccion-titulo">Modo Estudio ({intentosEstudio.length})</h4>
                {intentosEstudio.map((int, i) => (
                  <FilaIntento key={i} intento={int} tipo="Estudio" />
                ))}
              </section>
            )}
            {intentosExamen.length > 0 && (
              <section className="historial-seccion">
                <h4 className="historial-seccion-titulo">Modo Examen ({intentosExamen.length})</h4>
                {intentosExamen.map((int, i) => (
                  <FilaIntento key={i} intento={int} tipo="Examen" />
                ))}
              </section>
            )}
          </>
        )}

        <div className="modal-acciones">
          <Link to={`/licencias/${licenciaId}/estudio`} className="modal-btn-guardar" onClick={onCerrar}>
            Ir a practicar →
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Card de licencia ──────────────────────────────────────────────

function LicenciaCard({ id, licencia, datos, datosExamen, onVerHistorial }) {
  const ultimoIntento   = datos?.intentos?.at(-1) ?? null
  const cantEstudio     = datos?.intentos?.length ?? 0
  const cantExamen      = datosExamen?.intentos?.length ?? 0
  const totalIntentos   = cantEstudio + cantExamen
  const porcentaje      = ultimoIntento
    ? Math.round((ultimoIntento.correctas / ultimoIntento.total) * 100)
    : 0
  const colorBarra      = porcentaje >= 75 ? '#4CAF50' : '#af4c4c'

  return (
    <div className={`perfil-lic-card${ultimoIntento ? ' perfil-lic-card--activa' : ''}`}>
      <div className="perfil-lic-icon">{licencia.icon}</div>
      <h4 className="perfil-lic-titulo">{licencia.titulo}</h4>

      {ultimoIntento ? (
        <>
          <div className="perfil-lic-stats">
            <span className="perfil-lic-stat perfil-lic-stat--ok">✔ {ultimoIntento.correctas}</span>
            <span className="perfil-lic-stat perfil-lic-stat--err">✗ {ultimoIntento.incorrectas}</span>
            {ultimoIntento.dudas > 0 && (
              <span className="perfil-lic-stat perfil-lic-stat--duda">🤔 {ultimoIntento.dudas}</span>
            )}
          </div>
          <div className="perfil-lic-barra-wrap">
            <div className="perfil-lic-barra" style={{ width: `${porcentaje}%`, background: colorBarra }} />
          </div>
          <p className="perfil-lic-pct">{porcentaje}% último intento</p>
          <p className="perfil-lic-fecha">Última práctica: {formatearFecha(ultimoIntento.fecha)}</p>
        </>
      ) : (
        <p className="perfil-lic-sinact">Sin actividad aún</p>
      )}

      <div className="perfil-lic-acciones">
        <Link to={`/licencias/${id}/estudio`} className="perfil-lic-btn">
          {ultimoIntento ? 'Practicar' : 'Comenzar →'}
        </Link>
        {totalIntentos > 0 && (
          <button className="perfil-lic-btn perfil-lic-btn--historial" onClick={onVerHistorial}>
            Historial ({totalIntentos})
          </button>
        )}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────

export default function PerfilPage() {
  const { usuario: authUser } = useAuth()
  const navigate = useNavigate()
  const [perfil, setPerfil]       = useState({})
  const [usuario, setUsuario]     = useState({})
  const [intentos, setIntentos]   = useState([])
  const [modalEdit, setModalEdit] = useState(false)
  const [modalLic, setModalLic]   = useState(null)

  useEffect(() => {
    if (!authUser) return
    getPerfil(authUser.id).then(data => {
      if (data) setUsuario({
        nombre:            data.nombre ?? '',
        email:             data.email ?? authUser.email,
        vencCMA:           data.venc_cma ?? '',
        licencias:         data.licencias_obtenidas ?? [],
      })
      else setUsuario({ email: authUser.email, licencias: [] })
    })
    getIntentos(authUser.id).then(rows => {
      // Convierte el array plano de Supabase al formato { [licenciaId]: { intentos: [...] } }
      const agrupado = {}
      rows.forEach(r => {
        const key = r.modo === 'examen' ? `${r.licencia_id}_examen` : r.licencia_id
        if (!agrupado[key]) agrupado[key] = { intentos: [] }
        agrupado[key].intentos.push({
          correctas:   r.correctas,
          incorrectas: r.incorrectas,
          dudas:       r.dudas,
          total:       r.total,
          porcentaje:  r.porcentaje,
          fecha:       r.fecha,
        })
      })
      setPerfil(agrupado)
    })
  }, [authUser])

  const guardarUsuario = async (nuevoUsuario) => {
    setUsuario(nuevoUsuario)
    setModalEdit(false)
    if (authUser) {
      await upsertPerfil(authUser.id, {
        nombre:               nuevoUsuario.nombre,
        email:                nuevoUsuario.email,
        venc_cma:             nuevoUsuario.vencCMA || null,
        licencias_obtenidas:  nuevoUsuario.licencias ?? [],
      })
    }
  }

  const licenciasCompletadas = Object.keys(REGISTRY).filter(id => perfil[id]?.intentos?.length > 0).length
  const trofeo = getTrofeo(licenciasCompletadas)

  return (
    <div className="perfil-page">

      {/* Header de usuario */}
      <div className="perfil-header">
        <div className="perfil-avatar">
          <span className="perfil-trofeo-principal">{trofeo.icono}</span>
          <div className="perfil-trofeos-mini">
            {Object.entries(REGISTRY).map(([id, lic]) => (
              <span
                key={id}
                className={`perfil-trofeo-mini${perfil[id]?.intentos?.length > 0 ? ' perfil-trofeo-mini--ganado' : ''}`}
                title={lic.titulo}
              >
                {lic.icon}
              </span>
            ))}
          </div>
        </div>

        <div className="perfil-user-info">
          <h2 className="perfil-user-nombre">{usuario.nombre || 'Estudiante'}</h2>
          <p className="perfil-user-email">{usuario.email || 'Sin email registrado'}</p>
          {usuario.telefono && <p className="perfil-user-email">{usuario.telefono}</p>}
          <span className="perfil-user-nivel">{trofeo.icono} {trofeo.nivel}</span>
          <p className="perfil-user-sub">
            {licenciasCompletadas} licencia{licenciasCompletadas !== 1 ? 's' : ''} practicada{licenciasCompletadas !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="perfil-btn-grupo">
          <button className="perfil-btn-editar" onClick={() => setModalEdit(true)}>
            ✏️ Editar perfil
          </button>
          {authUser && (
            <button className="perfil-btn-salir" onClick={async () => { await supabase.auth.signOut(); navigate('/') }}>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      {/* Grid de licencias */}
      <h3 className="perfil-seccion-titulo">Mis licencias</h3>
      <div className="perfil-licencias-grid">
        {Object.entries(REGISTRY)
          .filter(([id]) =>
            (perfil[id]?.intentos?.length ?? 0) > 0 ||
            (perfil[`${id}_examen`]?.intentos?.length ?? 0) > 0
          )
          .map(([id, lic]) => (
            <LicenciaCard
              key={id}
              id={id}
              licencia={lic}
              datos={perfil[id]}
              datosExamen={perfil[`${id}_examen`]}
              onVerHistorial={() => setModalLic(id)}
            />
          ))}
      </div>

      {/* Modales */}
      {modalEdit && (
        <ModalEditarPerfil
          usuario={usuario}
          onGuardar={guardarUsuario}
          onCerrar={() => setModalEdit(false)}
        />
      )}
      {modalLic && (
        <ModalHistorial
          licenciaId={modalLic}
          licencia={REGISTRY[modalLic]}
          datosEstudio={perfil[modalLic]}
          datosExamen={perfil[`${modalLic}_examen`]}
          onCerrar={() => setModalLic(null)}
        />
      )}

    </div>
  )
}
