import { PPA_PREGUNTAS } from "./ppa-preguntas";
import { PPA_PREGUNTAS as PPL_PREGUNTAS } from "./ppl-preguntas";

// Licencias con preguntas — aparecen con botones Estudio y Examen
export const REGISTRY = {
  ppa: {
    icon: "🛩️",
    titulo: "Piloto Privado de Avión",
    detalle: "Preguntas del programa oficial ANAC. Material habilitado para instructores y alumnos con bibliografía sugerida.",
    preguntas: PPA_PREGUNTAS,
  },
  ppl: {
    icon: "🍃",
    titulo: "Piloto Privado de Planeador",
    detalle: "Publicación de Preguntas Resolución Nº 306/2014. El cuestionario será ampliado periódicamente.",
    preguntas: PPL_PREGUNTAS,
  },
};

// Licencias sin preguntas todavía — aparecen como "Próximamente"
export const PROXIMAS = [
  {
    id: "comercial",
    icon: "🏆",
    titulo: "Piloto Comercial de Primera",
    detalle: "Preguntas del programa de instrucción reconocida del curso teórico de Piloto Comercial de Primera clase.",
  },
  {
    id: "cta",
    icon: "📡",
    titulo: "Controlador de Tránsito Aéreo",
    detalle: "Preguntas del programa de instrucción reconocida del curso teórico de CTA. Cuestionario en expansión.",
  },
  {
    id: "instructor",
    icon: "👨‍✈️",
    titulo: "Instructor de Vuelo Avión",
    detalle: "Preguntas del curso teórico de Instructor de Vuelo avión, conjuntamente con PPA y habilitación IFR.",
  },
  {
    id: "incendios",
    icon: "🔥",
    titulo: "Piloto Combate de Incendios Forestales",
    detalle: "Publicación de Preguntas Resolución Nº 306/2014. El cuestionario será ampliado periódicamente.",
  },
];
