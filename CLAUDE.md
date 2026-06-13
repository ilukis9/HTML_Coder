# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SoyPiloto is a React + Vite SPA for Argentine aviation students to practice ANAC pilot license exams.
Planned features: auth (email + OTP via Supabase), subscriptions (Mercado Pago), full question bank (~300–700 questions per license, 18 licenses).

**Stack:** React 18, React Router v6, Bootstrap 5 (npm), SCSS, Vite.

## Commands

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Architecture

### Routing (`src/App.jsx`)

All pages share `Layout` (Header + Footer). Two generic quiz pages handle all licenses via `:id` param.

```
/                        → HomePage
/licencias               → LicenciasPage
/licencias/:id/estudio   → EstudioPage  (Modo Estudio — genérico)
/licencias/:id/examen    → ExamenPage   (Modo Examen  — genérico)
/mision               → MisionPage
/perfil               → PerfilPage
/login                → LoginPage    (Supabase OTP — pendiente)
```

### Quiz architecture

Two generic pages (`EstudioPage`, `ExamenPage`) read `:id` from the URL, look up the license in `src/data/licencias-registry.js`, and redirect to `/licencias` if the ID is unknown.

Two reusable components fed by two hooks:

| Hook | Component | Behaviour |
|---|---|---|
| `useQuizEstudio` | `QuizEstudio` | Feedback inmediato, marca duda, guarda en localStorage |
| `useQuizExamen` | `QuizExamen` | Preguntas aleatorias, timer 15 min, sin feedback hasta el final |

**Agregar una nueva licencia:**
1. Crear `src/data/<id>-preguntas.js` — export named array
2. Agregar entrada en `src/data/licencias-registry.js` → `{ titulo, preguntas }`
3. Agregar entrada en el array `LICENCIAS` de `src/pages/LicenciasPage.jsx` con `activa: true` y `rutaEstudio: '/licencias/<id>'`

### Data & state

- **Preguntas:** hardcodeadas en `src/data/` por ahora. Cada objeto: `{ pregunta, imagen?, imagenAncho?, opciones[], correcta }`.
- **Resultados:** `localStorage` bajo clave `soypiloto_perfil` → `{ ppa: {...}, ppa_examen: {...} }`. Se migra a Supabase en la próxima etapa.
- **Imágenes:** en `public/img/`, referenciadas como `/img/nombre.webp` (Vite las sirve en la raíz).

### Styles

SCSS en `src/styles/`, importado globalmente en `main.jsx` junto con Bootstrap.
Variables de color en `src/styles/util/_variables.scss`. No usar CSS Modules — todo es global por diseño.

Estructura de carpetas:
- `layout/` — header, body, footer
- `pages/` — home, licencias, mision, perfil, quiz, login
- `util/` — variables, animations, responsive, extend, mixin

## Próximas etapas

1. **Supabase** — reemplazar localStorage, agregar auth email+OTP, tabla de preguntas y historial de intentos
2. **Mercado Pago** — suscripción para remover publicidad
3. **Analytics de errores** — historial de intentos con preguntas más fallidas (`GROUP BY question_id`)
