import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getPreguntasEstado, upsertPreguntaEstado } from '../lib/db'

const MAX_FAVORITAS = 5

export function usePreguntasEstado(licenciaId) {
  const [estado, setEstado] = useState({}) // { [index]: { favorita, prioridad } }
  const [cargando, setCargando] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    let cancelado = false
    setCargando(true)

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        if (!cancelado) { setEstado({}); setUserId(null); setCargando(false) }
        return
      }
      const filas = await getPreguntasEstado(session.user.id, licenciaId)
      if (cancelado) return
      const mapa = {}
      filas.forEach(f => {
        mapa[f.pregunta_index] = { favorita: f.favorita, prioridad: f.prioridad }
      })
      setUserId(session.user.id)
      setEstado(mapa)
      setCargando(false)
    })

    return () => { cancelado = true }
  }, [licenciaId])

  const totalFavoritas = Object.values(estado).filter(e => e.favorita).length
  const limiteFavoritasAlcanzado = totalFavoritas >= MAX_FAVORITAS

  const toggle = useCallback((index, campo) => {
    if (!userId) return

    setEstado(prev => {
      const actual = prev[index] ?? { favorita: false, prioridad: false }
      const nuevoValor = !actual[campo]

      if (campo === 'favorita' && nuevoValor) {
        const yaHayMax = Object.values(prev).filter(e => e.favorita).length >= MAX_FAVORITAS
        if (yaHayMax) return prev
      }

      const nuevo = { ...actual, [campo]: nuevoValor }
      upsertPreguntaEstado(userId, licenciaId, index, nuevo)
      return { ...prev, [index]: nuevo }
    })
  }, [userId, licenciaId])

  const toggleFavorita  = useCallback(index => toggle(index, 'favorita'), [toggle])
  const togglePrioridad = useCallback(index => toggle(index, 'prioridad'), [toggle])

  return {
    estado,
    cargando,
    limiteFavoritasAlcanzado,
    totalFavoritas,
    maxFavoritas: MAX_FAVORITAS,
    toggleFavorita,
    togglePrioridad,
  }
}
