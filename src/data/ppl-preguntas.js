// Banco de preguntas PPA — Piloto Privado de Avión
// Imágenes en /public/img/ → se referencian como /img/...

export const PPA_PREGUNTAS = [
  {
    pregunta: "¿Cuál es el rango de velocidades para volar con máximo flaps extendido?",
    imagen: "/img/Velocimetro.webp",
    imagenAncho: 200,
    opciones: ["60 a 100 MPH", "60 a 208 MPH", "208 MPH"],
    correcta: 0,
    tema: "Performance y Planificación de Vuelo",
  },
  {
    pregunta: "¿Qué sucederá si a medida que se incrementa la altitud de vuelo no se realiza el empobrecimiento en el control de la mezcla?",
    opciones: [
      "Tanto el volumen del aire que ingresa al carburador como la cantidad de combustible disminuirán.",
      "La densidad del aire que ingresa al carburador disminuirá y la cantidad de combustible se incrementará.",
      "La densidad del aire que ingresa al carburador disminuirá y la cantidad de combustible permanecerá constante.",
    ],
    correcta: 2,
    tema: "Conocimientos Generales de la Aeronave",
  },
  {
    pregunta: "¿Pasados cuántos días sin actividad de vuelo, un Piloto Privado de Avión debe ser readaptado por un Instructor?",
    opciones: ["30", "45", "60"],
    correcta: 0,
    tema: "Legislación y Reglamentación Aeronáutica",
  },
  {
    pregunta: "Si se mantiene una GS de 130 nudos, ¿qué distancia se recorre en 1 h 30 min?",
    opciones: ["206 millas náuticas", "195 millas náuticas", "95 KM"],
    correcta: 1,
    tema: "Aeronavegación",
  },
  {
    pregunta: "Las nubes, la niebla y el rocío siempre se forman cuando:",
    opciones: ["El vapor de agua se condensa.", "Cuando el vapor de agua está presente.", "Cuando la humedad relativa alcanza el 100%."],
    correcta: 0,
    tema: "Meteorología",
  },
  {
    pregunta:
      "(Figura 29, ilustración 1) El receptor VOR tiene la indicación que se muestra. ¿Cuál es la posición relativa del avión respecto a la estación transmisora?",
    imagen: "/img/Figura-29.png",
    imagenAncho: 600,
    opciones: ["Norte.", "Este", "Sur"],
    correcta: 2,
    tema: "Aeronavegación",
  },
  {
    pregunta: "Si se desconecta el cable a masa ubicado entre el magneto y el interruptor de la ignición, el motor:",
    opciones: [
      "No operara con un solo magneto.",
      "No se puede poner en marcha con el interruptor en la posición BOTH.",
      "Podría ponerse en marcha accidentalmente si la hélice es movida habiendo combustible en el cilindro.",
    ],
    correcta: 2,
    tema: "Conocimientos Generales de la Aeronave",
  },
];
