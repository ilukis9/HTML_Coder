import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { guardarIntento } from '../lib/db'

export function useQuizEstudio(preguntas, storageKey) {
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState([])      // 'correcta' | 'incorrecta' | 'duda' | undefined
  const [opcionElegida, setOpcionElegida] = useState([]) // índice elegido por pregunta
  const [finalizado, setFinalizado] = useState(false)

  const responder = useCallback((numero, indice) => {
    const esCorrecta = indice === preguntas[numero].correcta

    setOpcionElegida(prev => {
      const nuevo = [...prev]
      nuevo[numero] = indice
      return nuevo
    })

    setRespuestas(prev => {
      const nuevo = [...prev]
      nuevo[numero] = esCorrecta ? 'correcta' : 'incorrecta'
      return nuevo
    })
  }, [preguntas])

  const marcarDuda = useCallback((numero) => {
    setRespuestas(prev => {
      const nuevo = [...prev]
      nuevo[numero] = prev[numero] === 'duda' ? undefined : 'duda'
      return nuevo
    })
  }, [])

  const guardarEnStorage = useCallback(async (respuestasActuales) => {
    const correctas   = respuestasActuales.filter(r => r === 'correcta').length
    const incorrectas = respuestasActuales.filter(r => r === 'incorrecta').length
    const dudas       = respuestasActuales.filter(r => r === 'duda').length
    const total       = preguntas.length

    // localStorage (fallback sin sesión)
    const perfil = JSON.parse(localStorage.getItem('soypiloto_perfil')) || {}
    const prevIntentos = perfil[storageKey]?.intentos || []
    perfil[storageKey] = {
      intentos: [...prevIntentos, { total, correctas, incorrectas, dudas, fecha: new Date().toISOString() }],
    }
    localStorage.setItem('soypiloto_perfil', JSON.stringify(perfil))

    // Supabase (si hay sesión activa)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await guardarIntento(session.user.id, storageKey, 'estudio', { correctas, incorrectas, dudas, total })
    }
  }, [preguntas, storageKey])

  const finalizar = useCallback(() => {
    guardarEnStorage(respuestas)
    setFinalizado(true)
  }, [guardarEnStorage, respuestas])

  const reiniciar = useCallback(() => {
    setPreguntaActual(0)
    setRespuestas([])
    setOpcionElegida([])
    setFinalizado(false)
  }, [])

  return {
    preguntaActual,
    setPreguntaActual,
    respuestas,
    opcionElegida,
    finalizado,
    responder,
    marcarDuda,
    finalizar,
    reiniciar,
  }
}
