/**
 * Rangos de edad por módulo (deben coincidir con el perfil elegido en el paso 2).
 * - Niño: 4–11
 * - Adolescente: 11–17
 * - Adulto: 18+
 */
export const AGE_RANGES = {
  child: { min: 4, max: 11, label: '4 y 11' },
  adolescent: { min: 11, max: 17, label: '11 y 17' },
  adult: { min: 18, max: 120, label: '18 o más' },
}

/**
 * @param {'adult' | 'adolescent' | 'child' | ''} userType
 * @param {string | number} ageRaw
 * @returns {string} Mensaje de error vacío si es válido
 */
export function getAgeMismatchMessage(userType, ageRaw) {
  if (!userType) return 'Selecciona un perfil en el paso anterior.'

  const age = typeof ageRaw === 'number' ? ageRaw : Number(String(ageRaw).trim())

  if (ageRaw === '' || ageRaw == null || Number.isNaN(age) || age < 1) {
    return 'Indica una edad válida.'
  }

  const r = AGE_RANGES[userType]
  if (!r) return 'Perfil no reconocido.'

  if (age < r.min || age > r.max) {
    if (userType === 'child') {
      return `Para el módulo Niño, la edad debe estar entre ${r.min} y ${r.max} años.`
    }
    if (userType === 'adolescent') {
      return `Para el módulo Adolescente, la edad debe estar entre ${r.min} y ${r.max} años.`
    }
    return `Para el módulo Adulto, la edad debe ser de ${r.min} años en adelante.`
  }

  return ''
}

/**
 * @param {'adult' | 'adolescent' | 'child' | ''} userType
 * @param {string | number} ageRaw
 */
export function ageMatchesModule(userType, ageRaw) {
  return getAgeMismatchMessage(userType, ageRaw) === ''
}
