import { Link, useLocation, useNavigate } from "react-router-dom";
import { REGISTRY, PROXIMAS } from "../data/licencias-registry";

export default function LicenciasPage() {
  const activas = Object.entries(REGISTRY).map(([id, lic]) => ({ id, ...lic, activa: true }));
  const lista = [...activas, ...PROXIMAS.map(l => ({ ...l, activa: false }))];

  const location = useLocation();
  const navigate = useNavigate();
  const modalEstudioId = location.state?.modalEstudio ?? null;

  const cerrarModal = () => navigate('/licencias', { replace: true });

  return (
    <>
      <div className="licencias-header">
        <h2>Licencias</h2>
        <p className="licencias-subtitulo">Elegí tu licencia y practicá con preguntas reales del examen ANAC.</p>
      </div>

      <div className="licencias-grid">
        {lista.map((lic, index) => (
          <article
            key={lic.id}
            className={`licencia-card${lic.activa ? " licencia-card-activa" : ""}`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="licencia-card-icon">{lic.icon}</div>
            <h3 className="licencia-card-titulo">{lic.titulo}</h3>
            <p className="licencia-card-detalle">{lic.detalle}</p>
            <div className="licencia-card-footer">
              {lic.activa ? (
                <>
                  <Link to={`/licencias/${lic.id}/estudio`} className="btn-licencia">
                    Modo Estudio
                  </Link>
                  <Link to={`/licencias/${lic.id}/examen`} className="btn-licencia btn-licencia-examen">
                    Modo Examen
                  </Link>
                </>
              ) : (
                <span className="btn-licencia btn-licencia-pronto">Próximamente</span>
              )}
            </div>
          </article>
        ))}
      </div>

      {modalEstudioId && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-box" style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔒</div>
            <h3 className="modal-titulo">El Modo Estudio requiere una cuenta</h3>
            <p style={{ opacity: 0.7, margin: '12px 0 1.5rem' }}>
              Creá tu perfil gratis para acceder al modo estudio
              y guardar tu historial de intentos.
            </p>
            <div className="modal-acciones" style={{ justifyContent: 'center' }}>
              <Link to={`/licencias/${modalEstudioId}/examen`} className="modal-btn-cancelar" onClick={cerrarModal}>
                Ir al Modo Examen
              </Link>
              <Link to="/login" className="modal-btn-guardar">
                Crear cuenta / Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
