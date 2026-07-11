import { supabase } from './supabase'

// ── Perfil ────────────────────────────────────────────────────────

export async function getPerfil(userId) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) console.error('getPerfil error:', error.message, error.code)
  return data
}

export async function upsertPerfil(userId, campos) {
  await supabase
    .from('perfiles')
    .upsert({ id: userId, ...campos })
}

// ── Intentos ──────────────────────────────────────────────────────

export async function getIntentos(userId) {
  const { data } = await supabase
    .from('intentos')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: true })
  return data ?? []
}

export async function guardarIntento(userId, licenciaId, modo, stats) {
  await supabase.from('intentos').insert({
    user_id:     userId,
    licencia_id: licenciaId,
    modo,
    correctas:   stats.correctas,
    incorrectas: stats.incorrectas,
    dudas:       stats.dudas ?? 0,
    total:       stats.total,
    porcentaje:  Math.round((stats.correctas / stats.total) * 100),
  })
}

// ── Preguntas (favorita / prioridad) ─────────────────────────────────

export async function getPreguntasEstado(userId, licenciaId) {
  const { data, error } = await supabase
    .from('preguntas_estado')
    .select('*')
    .eq('user_id', userId)
    .eq('licencia_id', licenciaId)
  if (error) console.error('getPreguntasEstado error:', error.message, error.code)
  return data ?? []
}

export async function upsertPreguntaEstado(userId, licenciaId, index, { favorita, prioridad }) {
  const { error } = await supabase.from('preguntas_estado').upsert(
    {
      user_id:        userId,
      licencia_id:    licenciaId,
      pregunta_index: index,
      favorita,
      prioridad,
    },
    { onConflict: 'user_id,licencia_id,pregunta_index' }
  )
  if (error) console.error('upsertPreguntaEstado error:', error.message, error.code)
}
