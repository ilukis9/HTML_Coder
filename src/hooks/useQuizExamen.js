import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { guardarIntento } from '../lib/db'

const TIEMPO_TOTAL = 15 * 60
const UMBRAL_APROBACION = 75

function mezclarIndices(total) {
  const indices = Array.from({ length: total }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

export function useQuizExamen(preguntas, storageKey) {
  const [ordenPreguntas] = useState(() => mezclarIndices(preguntas.length))
  const [respuestasExamen, setRespuestasExamen] = useState(
    () => new Array(preguntas.length).fill(undefined)
  )
  const [posicion, setPosicion] = useState(0)
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_TOTAL)
  const [finalizado, setFinalizado] = useState(false)
  const intervaloRef = useRef(null)

  useEffect(() => {
    if (finalizado) return
    intervaloRef.current = setInterval(() => {
      setTiempoRestante(t => {
        if (t <= 1) {
          clearInterval(intervaloRef.current)
          setFinalizado(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervaloRef.current)
  }, [finalizado])

  const seleccionarRespuesta = useCallback((pos, indice) => {
    setRespuestasExamen(prev => {
      const nuevo = [...prev]
      nuevo[pos] = indice
      return nuevo
    })
  }, [])

  const finalizar = useCallback(async (respuestasActuales) => {
    clearInterval(intervaloRef.current)

    let correctas = 0
    for (let i = 0; i < preguntas.length; i++) {
      if (respuestasActuales[i] === preguntas[ordenPreguntas[i]].correcta) correctas++
    }
    const total       = preguntas.length
    const incorrectas = total - correctas
    const porcentaje  = Math.round((correctas / total) * 100)

    // localStorage (fallback sin sesión)
    const perfil = JSON.parse(localStorage.getItem('soypiloto_perfil')) || {}
    const prevIntentos = perfil[storageKey]?.intentos || []
    perfil[storageKey] = {
      intentos: [...prevIntentos, {
        total, correctas, incorrectas, porcentaje,
        aprobado: porcentaje >= UMBRAL_APROBACION,
        fecha: new Date().toISOString(),
      }],
    }
    localStorage.setItem('soypiloto_perfil', JSON.stringify(perfil))

    // Supabase (si hay sesión activa)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await guardarIntento(session.user.id, storageKey, 'examen', { correctas, incorrectas, dudas: 0, total })
      localStorage.removeItem('soypiloto_pending_intento')
    } else {
      // Sin sesión: guardar para sincronizar después del login
      localStorage.setItem('soypiloto_pending_intento', JSON.stringify({
        licenciaId: storageKey,
        modo: 'examen',
        stats: { correctas, incorrectas, dudas: 0, total },
      }))
    }

    setFinalizado(true)
  }, [preguntas, ordenPreguntas, storageKey])

  const formatearTiempo = (seg) => {
    const m = Math.floor(seg / 60).toString().padStart(2, '0')
    const s = (seg % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return {
    ordenPreguntas,
    respuestasExamen,
    posicion,
    setPosicion,
    tiempoRestante,
    finalizado,
    seleccionarRespuesta,
    finalizar,
    formatearTiempo,
    UMBRAL_APROBACION,
  }
}
