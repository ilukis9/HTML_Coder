import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useQuizHeader } from "../context/QuizHeaderContext";
import { supabase } from "../lib/supabase";

const NAV_BASE = [
  { to: "/", label: "Home" },
  { to: "/mision", label: "Nuestra misión" },
  { to: "/licencias", label: "Licencias" },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sesion, setSesion] = useState(null);
  const location = useLocation();
  const ctx = useQuizHeader();
  const quizHeader = ctx?.quizHeader ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSesion(session))
    return () => subscription.unsubscribe()
  }, [])

  const accountLink = sesion
    ? { to: "/perfil", label: "Perfil" }
    : { to: "/login", label: "Iniciar sesión" }

  const mainLinks = sesion
    ? [...NAV_BASE, { to: "/preguntas", label: "Preguntas" }]
    : NAV_BASE

  const navLinks = [...mainLinks, accountLink]

  // Cierra el drawer al navegar
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Bloquea el scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      <header className="header-custom">
        {quizHeader ? (
          <nav className="header-nav header-nav--quiz">
            <NavLink to="/licencias" className="quiz-header-brand">SoyPiloto</NavLink>
            {quizHeader.timerEl ?? <span />}
            <span className="quiz-header-titulo">{quizHeader.titulo}</span>
          </nav>
        ) : (
          <nav className="header-nav">
            <NavLink className="navbar-brand" to="/">
              <span className="brand-text">SoyPiloto</span>
            </NavLink>

            {/* Nav desktop */}
            <ul className="nav-desktop">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) => `nav-link-item${isActive ? " active" : ""}`} end={to === "/"}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Hamburger */}
            <button className={`hamburger${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(true)} aria-label="Abrir menú">
              <span />
              <span />
              <span />
            </button>
          </nav>
        )}
      </header>

      {/* Overlay */}
      <div className={`nav-overlay${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(false)} aria-hidden="true" />

      {/* Drawer lateral */}
      <nav className={`nav-drawer${drawerOpen ? " open" : ""}`} aria-label="Menú principal">
        <div className="drawer-header">
          <span className="brand-text">SoyPiloto 🧑🏼‍✈️</span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        <ul>
          {mainLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => (isActive ? "active" : "")} end={to === "/"}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <ul className="nav-drawer-bottom">
          <li>
            <NavLink to={accountLink.to} className={({ isActive }) => (isActive ? "active" : "")}>
              {accountLink.label}
            </NavLink>
          </li>
        </ul>
      </nav>
    </>
  );
}
