// ================================================================
//  ppa.js — Quiz "Piloto Privado de Avión"
// ================================================================

// ── PREGUNTAS ────────────────────────────────────────────────────
// Cada pregunta es un objeto con:
//   - pregunta: el texto de la pregunta
//   - imagen: ruta a una imagen (opcional, si no hay se borra esta línea)
//   - opciones: array con las 3 opciones
//   - correcta: número de la opción correcta (0 = primera, 1 = segunda, 2 = tercera)

const PREGUNTAS = [
  {
    pregunta: "¿Cuál es el rango de velocidades para volar con máximo flaps extendido?",
    imagen: "../../assets/img/Velocimetro.webp",
    imagenAncho: 300,
    opciones: ["60 a 100 MPH", "60 a 208 MPH", "208 MPH"],
    correcta: 0,
  },
  {
    pregunta: "¿Qué sucederá si a medida que se incrementa la altitud de vuelo no se realiza el empobrecimiento en el control de la mezcla?",
    opciones: [
      "Tanto el volumen del aire que ingresa al carburador como la cantidad de combustible disminuirán.",
      "La densidad del aire que ingresa al carburador disminuirá y la cantidad de combustible se incrementará.",
      "La densidad del aire que ingresa al carburador disminuirá y la cantidad de combustible permanecerá constante.",
    ],
    correcta: 2,
  },
  {
    pregunta: "¿Pasados cuántos días sin actividad de vuelo, un Piloto Privado de Avión debe ser readaptado por un Instructor?",
    opciones: ["30", "45", "60"],
    correcta: 0,
  },
  {
    pregunta: "Si se mantiene una GS de 130 nudos, ¿qué distancia se recorre en 1 h 30 min?",
    opciones: ["206 millas náuticas", "195 millas náuticas", "95 KM"],
    correcta: 1,
  },
  {
    pregunta: "Las nubes, la niebla y el rocío siempre se forman cuando:",
    opciones: ["El vapor de agua se condensa.", "Cuando el vapor de agua está presente.", "Cuando la humedad relativa alcanza el 100%."],
    correcta: 0,
  },
  {
    pregunta:
      "(Figura 29, ilustración 1) El receptor VOR tiene la indicación que se muestra. ¿Cuál es la posición relativa del avión respecto a la estación transmisora?",
    imagen: "../../assets/img/Figura-29.png",
    imagenAncho: 1000,
    opciones: ["Norte.", "Este", "Sur"],
    correcta: 2,
  },
  {
    pregunta: "Si se desconecta el cable a masa ubicado entre el magneto y el interruptor de la ignición, el motor:",
    opciones: [
      "No operara con un solo magneto.",
      "No se puede poner en marcha con el interruptor en la posición BOTH.",
      "Podría ponerse en marcha accidentalmente si la hélice es movida habiendo combustible en el cilindro.",
    ],
    correcta: 2,
  },
];

// ── ESTADO DEL QUIZ ──────────────────────────────────────────────
// Acá guardamos todo lo que está pasando en el quiz mientras el
// usuario lo usa. Es como la "memoria" del quiz.

let preguntaActual = 0; // número de la pregunta que se está viendo ahora

// Arrays paralelos: cada posición corresponde a una pregunta.
// Ejemplo: respuestas[2] es la respuesta del usuario a la pregunta 3.
let respuestas = []; // "correcta", "incorrecta", "duda" o undefined
let opcionElegida = []; // qué opción eligió el usuario en cada pregunta (0, 1 o 2)
let preguntasMal = []; // lista de índices de preguntas respondidas mal
let preguntasDuda = []; // lista de índices de preguntas marcadas como duda

// ── MOSTRAR UNA PREGUNTA ─────────────────────────────────────────
// Esta función dibuja en pantalla la pregunta del número que le pasemos.

function mostrarPregunta(numero) {
  const pregunta = PREGUNTAS[numero];
  const totalPreguntas = PREGUNTAS.length;
  const letras = ["A", "B", "C", "D"];

  // ¿Ya respondió esta pregunta? (bien o mal)
  const yaRespondio = respuestas[numero] === "correcta" || respuestas[numero] === "incorrecta";
  // ¿La marcó como duda?
  const esDuda = respuestas[numero] === "duda";

  // -- Imagen (solo si la pregunta tiene una) --
  let htmlImagen = "";
  if (pregunta.imagen) {
    const ancho = pregunta.imagenAncho || 250; // si no tiene imagenAncho, usa 250 por defecto
    htmlImagen = `<div class="text-center mb-3">
                <img src="${pregunta.imagen}" class="img-fluid rounded" width="${ancho}">
              </div>`;
  }

  // -- Opciones de respuesta --
  // Recorremos las opciones y armamos el HTML de cada una
  let htmlOpciones = "";

  for (let i = 0; i < pregunta.opciones.length; i++) {
    let claseExtra = "";
    let icono = "";

    // Si ya respondió, colorear las opciones
    if (yaRespondio) {
      if (i === pregunta.correcta) {
        // Esta es la correcta → verde
        claseExtra = "opcion-correcta";
        icono = "✔ ";
      } else if (i === opcionElegida[numero]) {
        // Esta es la que eligió el usuario y era incorrecta → roja
        claseExtra = "opcion-incorrecta";
        icono = "✗ ";
      }
    }

    // Si ya respondió, bloqueamos los clicks
    const bloqueada = yaRespondio ? "bloqueada" : "";

    htmlOpciones += `
      <label class="preguntas-opciones ${claseExtra} ${bloqueada}" data-indice="${i}">
        <input type="radio" name="pregunta${numero}" value="${i}" ${yaRespondio ? "disabled" : ""}>
        <span>${icono}${letras[i]}: ${pregunta.opciones[i]}</span>
      </label>`;
  }

  // -- Mensaje de feedback (aparece después de responder) --
  let htmlFeedback = "";

  if (yaRespondio && respuestas[numero] === "correcta") {
    htmlFeedback = `<div class="feedback-msg feedback-ok mt-3">✔ ¡Correcto!</div>`;
  } else if (yaRespondio && respuestas[numero] === "incorrecta") {
    const respuestaCorrecta = pregunta.opciones[pregunta.correcta];
    htmlFeedback = `<div class="feedback-msg feedback-err mt-3">✗ Incorrecto. La correcta era: <strong>${letras[pregunta.correcta]}: ${respuestaCorrecta}</strong></div>`;
  } else if (esDuda) {
    htmlFeedback = `<div class="feedback-msg feedback-duda mt-3">🤔 Marcada como duda. La vas a ver al final.</div>`;
  }

  // -- Botones de navegación --
  // Anterior: solo si no estamos en la primera pregunta
  let htmlAnterior = "<span></span>"; // span vacío para mantener el layout
  if (numero > 0) {
    htmlAnterior = `<button class="btn btn-outline-secondary" id="btnAnterior">← Anterior</button>`;
  }

  // Duda: solo si todavía no respondió
  let htmlDuda = "<span></span>";
  if (!yaRespondio) {
    htmlDuda = `<button class="btn btn-warning" id="btnDuda">🤔 Duda</button>`;
  }

  // Siguiente o Finalizar (dependiendo si es la última pregunta)
  let htmlSiguiente = "";
  if (numero === totalPreguntas - 1) {
    htmlSiguiente = `<button class="btn btn-success" id="btnFinalizar">Ver resultados ✓</button>`;
  } else {
    htmlSiguiente = `<button class="btn btn-primary" id="btnSiguiente">Siguiente →</button>`;
  }

  // -- Badge de duda en el título --
  let badgeDuda = "";
  if (esDuda) {
    badgeDuda = `<span class="badge bg-warning text-dark">🤔 Duda</span>`;
  }

  // -- Armar el HTML completo de la carta --
  document.getElementById("quiz-container").innerHTML = `
    <div class="carta-pregunta shadow-sm p-4 mb-4">

      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="fw-bold mb-0">Pregunta ${numero + 1} / ${totalPreguntas}</h5>
        ${badgeDuda}
      </div>

      <p class="pregunta-texto">${pregunta.pregunta}</p>

      ${htmlImagen}

      <div id="opciones-container">
        ${htmlOpciones}
      </div>

      ${htmlFeedback}

      <div class="d-flex justify-content-between align-items-center mt-4 gap-2">
        ${htmlAnterior}
        ${htmlDuda}
        ${htmlSiguiente}
      </div>

    </div>`;

  // -- Asignar eventos a los botones --
  // Solo escuchamos clicks en las opciones si la pregunta no fue respondida
  if (!yaRespondio) {
    const labels = document.querySelectorAll(".preguntas-opciones");
    for (let label of labels) {
      label.addEventListener("click", function () {
        const indiceElegido = parseInt(this.dataset.indice);
        responderPregunta(numero, indiceElegido);
      });
    }
  }

  // Botón Anterior
  const botonAnterior = document.getElementById("btnAnterior");
  if (botonAnterior) {
    botonAnterior.addEventListener("click", function () {
      preguntaActual--;
      mostrarPregunta(preguntaActual);
      actualizarSlots();
    });
  }

  // Botón Duda
  const botonDuda = document.getElementById("btnDuda");
  if (botonDuda) {
    botonDuda.addEventListener("click", function () {
      marcarDuda(numero);
    });
  }

  // Botón Siguiente
  const botonSiguiente = document.getElementById("btnSiguiente");
  if (botonSiguiente) {
    botonSiguiente.addEventListener("click", function () {
      preguntaActual++;
      mostrarPregunta(preguntaActual);
      actualizarSlots();
    });
  }

  // Botón Finalizar
  const botonFinalizar = document.getElementById("btnFinalizar");
  if (botonFinalizar) {
    botonFinalizar.addEventListener("click", function () {
      guardarEnStorage();
      mostrarResultado();
    });
  }
}

// ── RESPONDER UNA PREGUNTA ───────────────────────────────────────
// Se llama cuando el usuario hace click en una opción.

function responderPregunta(numero, indice) {
  const pregunta = PREGUNTAS[numero];

  // Guardamos qué opción eligió
  opcionElegida[numero] = indice;

  // ¿Acertó?
  if (indice === pregunta.correcta) {
    respuestas[numero] = "correcta";
    // Si antes la tenía como incorrecta (volvió con Anterior y la corrigió),
    // la sacamos de la lista de preguntas mal respondidas
    preguntasMal = preguntasMal.filter(function (i) {
      return i !== numero;
    });
  } else {
    respuestas[numero] = "incorrecta";
    // La agregamos a la lista de incorrectas (si no estaba ya)
    if (!preguntasMal.includes(numero)) {
      preguntasMal.push(numero);
    }
  }

  // Si estaba marcada como duda, la sacamos de dudas
  preguntasDuda = preguntasDuda.filter(function (i) {
    return i !== numero;
  });

  actualizarSlots();
  mostrarPregunta(numero);
}

// ── MARCAR COMO DUDA ────────────────────────────────────────────
// Alterna entre "duda" y sin marcar.

function marcarDuda(numero) {
  if (respuestas[numero] === "duda") {
    // Ya era duda → la desmarcamos
    respuestas[numero] = undefined;
    preguntasDuda = preguntasDuda.filter(function (i) {
      return i !== numero;
    });
  } else {
    // No era duda → la marcamos
    respuestas[numero] = "duda";
    if (!preguntasDuda.includes(numero)) {
      preguntasDuda.push(numero);
    }
  }

  actualizarSlots();
  mostrarPregunta(numero);
}

// ── SLOTS DE PROGRESO ────────────────────────────────────────────
// Los cuadraditos de colores que aparecen arriba del quiz.

function crearSlots() {
  const contenedor = document.getElementById("barra-slots");
  if (!contenedor) return;

  let html = "";
  for (let i = 0; i < PREGUNTAS.length; i++) {
    html += `<div class="slot" id="slot-${i}" title="Pregunta ${i + 1}"></div>`;
  }
  contenedor.innerHTML = html;
}

function actualizarSlots() {
  for (let i = 0; i < PREGUNTAS.length; i++) {
    const slot = document.getElementById("slot-" + i);
    if (!slot) continue;

    // Resetear clases
    slot.className = "slot";

    // Colorear según el estado
    if (respuestas[i] === "correcta") {
      slot.classList.add("slot-ok"); // verde
    } else if (respuestas[i] === "incorrecta") {
      slot.classList.add("slot-err"); // rojo
    } else if (respuestas[i] === "duda") {
      slot.classList.add("slot-duda"); // amarillo
    } else if (i === preguntaActual) {
      slot.classList.add("slot-actual"); // azul (pregunta que se ve ahora)
    }
  }
}

// ── GUARDAR EN LOCALSTORAGE ──────────────────────────────────────
// localStorage es como un "bloc de notas" del navegador.
// Lo que guardamos acá persiste aunque cierres la pestaña.

function guardarEnStorage() {
  // Contamos resultados
  let cantCorrectas = 0;
  let cantIncorrectas = 0;
  let cantDudas = 0;

  for (let r of respuestas) {
    if (r === "correcta") cantCorrectas++;
    if (r === "incorrecta") cantIncorrectas++;
    if (r === "duda") cantDudas++;
  }

  // Armamos el objeto con todo lo que queremos guardar
  const datos = {
    total: PREGUNTAS.length,
    correctas: cantCorrectas,
    incorrectas: cantIncorrectas,
    dudas: cantDudas,
    preguntasIncorrectas: preguntasMal.map(function (i) {
      return { index: i, pregunta: PREGUNTAS[i].pregunta };
    }),
    preguntasDuda: preguntasDuda.map(function (i) {
      return { index: i, pregunta: PREGUNTAS[i].pregunta };
    }),
    fecha: new Date().toISOString(),
  };

  // Lo guardamos dentro del objeto general del perfil
  // (así cada licencia tiene su propia sección)
  const perfil = JSON.parse(localStorage.getItem("soypiloto_perfil")) || {};
  perfil["ppa"] = datos;
  localStorage.setItem("soypiloto_perfil", JSON.stringify(perfil));
}

// ── PANTALLA DE RESULTADO FINAL ──────────────────────────────────

function mostrarResultado() {
  let cantCorrectas = 0;
  for (let r of respuestas) {
    if (r === "correcta") cantCorrectas++;
  }

  const total = PREGUNTAS.length;
  const porcentaje = Math.round((cantCorrectas / total) * 100);
  const colorBarra = porcentaje >= 75 ? "bg-success" : "bg-danger";

  // Lista de incorrectas
  let htmlIncorrectas = "<p class='text-success'>¡Sin errores!</p>";
  if (preguntasMal.length > 0) {
    htmlIncorrectas = "<ul class='list-group mt-2'>";
    for (let i of preguntasMal) {
      htmlIncorrectas += `<li class="list-group-item list-group-item-danger">
      <strong>P${i + 1}:</strong> ${PREGUNTAS[i].pregunta}</li>`;
    }
    htmlIncorrectas += "</ul>";
  }

  // Lista de dudas
  let htmlDudas = "";
  if (preguntasDuda.length > 0) {
    htmlDudas = "<h5 class='text-start fw-bold mt-4'>🤔 Dudas para repasar:</h5><ul class='list-group mt-2'>";
    for (let i of preguntasDuda) {
      htmlDudas += `<li class="list-group-item list-group-item-warning">
        <strong>P${i + 1}:</strong> ${PREGUNTAS[i].pregunta}</li>`;
    }
    htmlDudas += "</ul>";
  }

  document.getElementById("quiz-container").innerHTML = `
    <div class="carta-pregunta shadow-sm p-4 mb-4 text-center">
      <h3 class="fw-bold mb-3">🎯 Resultado final</h3>
      <p class="fs-4">
        ${cantCorrectas} / ${total} correctas
        <span class="badge ${colorBarra}">${porcentaje}%</span>
      </p>
      <div class="progress mb-4" style="height: 24px">
        <div class="progress-bar ${colorBarra}" style="width: ${porcentaje}%">${porcentaje}%</div>
      </div>
      <h5 class="text-start fw-bold mt-4">✗ Preguntas incorrectas:</h5>
      ${htmlIncorrectas}
      ${htmlDudas}
      <div class="mt-4 d-flex justify-content-center gap-2">
        <button class="btn btn-primary" id="btnReiniciar">Volver a intentar</button>
        <a href="../perfil.html" class="btn btn-outline-secondary">Ver mi perfil</a>
      </div>
    </div>`;

  document.getElementById("btnReiniciar").addEventListener("click", reiniciarQuiz);
}

// ── REINICIAR EL QUIZ ────────────────────────────────────────────

function reiniciarQuiz() {
  // Reseteamos todas las variables de estado
  preguntaActual = 0;
  respuestas = [];
  opcionElegida = [];
  preguntasMal = [];
  preguntasDuda = [];

  crearSlots();
  actualizarSlots();
  mostrarPregunta(0);
}

// ── ARRANCAR TODO ────────────────────────────────────────────────
// Esto se ejecuta cuando la página termina de cargar.

document.addEventListener("DOMContentLoaded", function () {
  crearSlots();
  actualizarSlots();
  mostrarPregunta(0);
});
