import { supabase } from './supabase'

// ── Perfil ────────────────────────────────────────────────────────

export async function getPerfil(userId) {
  const { data } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single()
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
