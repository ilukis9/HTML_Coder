// ================================================================
//  perfil.js — Muestra los resultados guardados en la página de perfil
// ================================================================

// ── CARGAR DATOS ─────────────────────────────────────────────────
// Leemos lo que ppa.js guardó en el localStorage del navegador.

function cargarDatos() {
  const texto = localStorage.getItem("soypiloto_perfil");

  // Si nunca se jugó, no hay nada guardado
  if (!texto) return {};

  // Convertimos el texto guardado en un objeto de JavaScript
  return JSON.parse(texto);
}

// ── FORMATEAR FECHA ───────────────────────────────────────────────
// Convierte una fecha técnica como "2025-04-26T15:30:00Z"
// en algo legible como "26/04/2025"

function formatearFecha(fechaISO) {
  if (!fechaISO) return "—";

  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── BARRA DE PROGRESO ─────────────────────────────────────────────
// Genera la barra verde/roja/amarilla que muestra el resultado.

function crearBarra(datos) {
  // Si no hay datos, mostramos un mensaje
  if (!datos) {
    return "<p class='text-muted small'>Sin actividad aún.</p>";
  }

  const total = datos.total;
  const correctas = datos.correctas;
  const incorrectas = datos.incorrectas;
  const dudas = datos.dudas || 0;

  // Calculamos el porcentaje de cada segmento
  const pctVerde = ((correctas / total) * 100).toFixed(1);
  const pctRojo = ((incorrectas / total) * 100).toFixed(1);
  const pctAmarillo = ((dudas / total) * 100).toFixed(1);

  return `
    <div class="progress-stacked">
      <div class="progress" role="progressbar"
          aria-valuenow="${correctas}" aria-valuemin="0" aria-valuemax="${total}"
          style="width: ${pctVerde}%">
      <div class="progress-bar colorv" title="Correctas: ${correctas}"></div>
    </div>
    <div class="progress" role="progressbar"
          aria-valuenow="${incorrectas}" aria-valuemin="0" aria-valuemax="${total}"
          style="width: ${pctRojo}%">
      <div class="progress-bar colorf" title="Incorrectas: ${incorrectas}"></div>
    </div>
    <div class="progress" role="progressbar"
          aria-valuenow="${dudas}" aria-valuemin="0" aria-valuemax="${total}"
          style="width: ${pctAmarillo}%">
      <div class="progress-bar colorp" title="Dudas: ${dudas}"></div>
    </div>
  </div>

  <p>
    Correctas: <strong>${correctas}</strong><br>
    Incorrectas: <strong>${incorrectas}</strong><br>
    Dudas: <strong>${dudas}</strong>
  </p>

  <p class="text-muted small mb-0">Última práctica: ${formatearFecha(datos.fecha)}</p>`;
}

// ── LISTAS DE REPASO ──────────────────────────────────────────────
// Genera los <details> con las preguntas incorrectas y las dudas.

function crearRepaso(datos) {
  if (!datos) return "";

  let html = "";

  // -- Preguntas incorrectas --
  if (datos.preguntasIncorrectas && datos.preguntasIncorrectas.length > 0) {
    html += `<details class="mt-2">
      <summary class="small fw-bold text-danger" style="cursor:pointer">
        ✗ Incorrectas para repasar (${datos.preguntasIncorrectas.length})
      </summary>
      <ul class="list-group mt-1">`;

    for (let p of datos.preguntasIncorrectas) {
      html += `<li class="list-group-item list-group-item-danger py-1 small">
          <strong>P${p.index + 1}:</strong> ${p.pregunta}
        </li>`;
    }

    html += `  </ul>
          </details>`;
  }

  // -- Preguntas marcadas como duda --
  if (datos.preguntasDuda && datos.preguntasDuda.length > 0) {
    html += `<details class="mt-2">
          <summary class="small fw-bold text-warning" style="cursor:pointer">
            🤔 Dudas para repasar (${datos.preguntasDuda.length})
          </summary>
          <ul class="list-group mt-1">`;

    for (let p of datos.preguntasDuda) {
      html += `<li class="list-group-item list-group-item-warning py-1 small">
            <strong>P${p.index + 1}:</strong> ${p.pregunta}
          </li>`;
    }

    html += `  </ul>
        </details>`;
  }

  return html;
}

// ── ACTUALIZAR EL BLOQUE DE UNA LICENCIA ─────────────────────────
// Busca los elementos del HTML por ID y les pone el contenido correcto.

function actualizarLicencia(idElemento, datos) {
  const bloque = document.getElementById(idElemento);
  if (!bloque) return; // Si no existe el elemento, no hacemos nada

  bloque.querySelector(".licencia-barra").innerHTML = crearBarra(datos);
  bloque.querySelector(".licencia-repaso").innerHTML = crearRepaso(datos);
}

// ── ARRANCAR TODO ────────────────────────────────────────────────
// Esto se ejecuta cuando la página termina de cargar.

document.addEventListener("DOMContentLoaded", function () {
  const perfil = cargarDatos();

  // Por cada licencia que tengamos, actualizamos su bloque en el perfil.
  // Para agregar más licencias en el futuro, repetir esta línea
  // con el id del elemento HTML y la clave del localStorage.
  actualizarLicencia("licencia-ppa", perfil["ppa"]);
});
