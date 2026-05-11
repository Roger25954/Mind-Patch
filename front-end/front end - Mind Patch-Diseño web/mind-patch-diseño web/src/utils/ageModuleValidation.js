// Valida que la edad ingresada sea consistente con el tipo de usuario seleccionado.
// Devuelve un mensaje de error si hay discrepancia, o cadena vacía si todo está bien.

export function getAgeMismatchMessage(userType, age) {
  const n = parseInt(age, 10)
  if (!userType || isNaN(n)) return ''

  if (userType === 'child' && n >= 13)
    return 'La edad no corresponde al perfil de Niño/Niña (menores de 13 años).'

  if (userType === 'adolescent' && (n < 13 || n > 17))
    return 'La edad no corresponde al perfil de Adolescente (13 a 17 años).'

  if (userType === 'adult' && n < 18)
    return 'La edad no corresponde al perfil de Adulto (18 años o más).'

  return ''
}
