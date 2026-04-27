/* ══════════════════════════════════════════════
   data.js · Ítems PROLEC-R
   ══════════════════════════════════════════════ */

const DATA = {

  /* ── Subprueba 1: Igual-Diferente (20 pares) ── */
  letras: [
    { a: 'bpal',  b: 'bpal',  igual: true  },
    { a: 'dqpb',  b: 'dqpb',  igual: true  },
    { a: 'mano',  b: 'mamo',  igual: false },
    { a: 'tren',  b: 'tren',  igual: true  },
    { a: 'plaf',  b: 'plat',  igual: false },
    { a: 'boda',  b: 'boda',  igual: true  },
    { a: 'casa',  b: 'cana',  igual: false },
    { a: 'qdup',  b: 'qdup',  igual: true  },
    { a: 'frob',  b: 'frob',  igual: true  },
    { a: 'seta',  b: 'zeta',  igual: false },
    { a: 'dlmn',  b: 'dlmn',  igual: true  },
    { a: 'pqbd',  b: 'pqdb',  igual: false },
    { a: 'ruta',  b: 'ruta',  igual: true  },
    { a: 'blim',  b: 'blin',  igual: false },
    { a: 'gota',  b: 'gota',  igual: true  },
    { a: 'vino',  b: 'vina',  igual: false },
    { a: 'crep',  b: 'crep',  igual: true  },
    { a: 'fluq',  b: 'fkuq',  igual: false },
    { a: 'miel',  b: 'miel',  igual: true  },
    { a: 'zopa',  b: 'zopa',  igual: true  },
  ],

  /* ── Subprueba 2: Palabras (20) + Pseudopalabras (20) ── */
  palabras: [
    // Palabras reales — alta frecuencia
    { texto: 'mesa',     tipo: 'real',   frecuencia: 'alta' },
    { texto: 'luna',     tipo: 'real',   frecuencia: 'alta' },
    { texto: 'árbol',    tipo: 'real',   frecuencia: 'alta' },
    { texto: 'zapato',   tipo: 'real',   frecuencia: 'alta' },
    { texto: 'ciudad',   tipo: 'real',   frecuencia: 'alta' },
    { texto: 'ventana',  tipo: 'real',   frecuencia: 'alta' },
    { texto: 'piedra',   tipo: 'real',   frecuencia: 'alta' },
    { texto: 'montaña',  tipo: 'real',   frecuencia: 'alta' },
    { texto: 'camino',   tipo: 'real',   frecuencia: 'alta' },
    { texto: 'estrella', tipo: 'real',   frecuencia: 'alta' },
    // Palabras reales — baja frecuencia
    { texto: 'hechizo',  tipo: 'real',   frecuencia: 'baja' },
    { texto: 'grieta',   tipo: 'real',   frecuencia: 'baja' },
    { texto: 'cóncavo',  tipo: 'real',   frecuencia: 'baja' },
    { texto: 'ámbar',    tipo: 'real',   frecuencia: 'baja' },
    { texto: 'umbral',   tipo: 'real',   frecuencia: 'baja' },
    { texto: 'crisol',   tipo: 'real',   frecuencia: 'baja' },
    { texto: 'arcano',   tipo: 'real',   frecuencia: 'baja' },
    { texto: 'cénit',    tipo: 'real',   frecuencia: 'baja' },
    { texto: 'vórtice',  tipo: 'real',   frecuencia: 'baja' },
    { texto: 'efigie',   tipo: 'real',   frecuencia: 'baja' },
    // Pseudopalabras — similares a reales
    { texto: 'firco',    tipo: 'pseudo', frecuencia: null },
    { texto: 'bloma',    tipo: 'pseudo', frecuencia: null },
    { texto: 'trufa',    tipo: 'pseudo', frecuencia: null },
    { texto: 'pluvia',   tipo: 'pseudo', frecuencia: null },
    { texto: 'gremio',   tipo: 'pseudo', frecuencia: null },
    { texto: 'calbo',    tipo: 'pseudo', frecuencia: null },
    { texto: 'drema',    tipo: 'pseudo', frecuencia: null },
    { texto: 'flisco',   tipo: 'pseudo', frecuencia: null },
    { texto: 'tronlo',   tipo: 'pseudo', frecuencia: null },
    { texto: 'bruck',    tipo: 'pseudo', frecuencia: null },
    { texto: 'plonk',    tipo: 'pseudo', frecuencia: null },
    { texto: 'grumbo',   tipo: 'pseudo', frecuencia: null },
    { texto: 'frazlo',   tipo: 'pseudo', frecuencia: null },
    { texto: 'snork',    tipo: 'pseudo', frecuencia: null },
    { texto: 'crumba',   tipo: 'pseudo', frecuencia: null },
    { texto: 'plimco',   tipo: 'pseudo', frecuencia: null },
    { texto: 'truvio',   tipo: 'pseudo', frecuencia: null },
    { texto: 'glorb',    tipo: 'pseudo', frecuencia: null },
    { texto: 'fincho',   tipo: 'pseudo', frecuencia: null },
    { texto: 'zelbra',   tipo: 'pseudo', frecuencia: null },
  ],

  /* ── Subprueba 3: Comprensión de Oraciones (8 ítems) ── */
  oraciones: [
    {
      id: 1,
      instruccion: 'Toca el sombrero azul antes que la varita roja',
      objetos: [
        { id: 'sombrero', label: 'Sombrero', color: 0x2255cc, glyph: 'hat' },
        { id: 'varita',   label: 'Varita',   color: 0xcc2244, glyph: 'wand' },
      ],
      secuencia: ['sombrero'],
      tipo: 'orden_simple',
    },
    {
      id: 2,
      instruccion: 'Toca la estrella dorada y después la luna plateada',
      objetos: [
        { id: 'estrella', label: 'Estrella', color: 0xccaa00, glyph: 'star' },
        { id: 'luna',     label: 'Luna',     color: 0x8899cc, glyph: 'moon' },
      ],
      secuencia: ['estrella', 'luna'],
      tipo: 'secuencia',
    },
    {
      id: 3,
      instruccion: 'Toca primero el libro verde y luego el cristal rojo',
      objetos: [
        { id: 'libro',   label: 'Libro',   color: 0x338844, glyph: 'book' },
        { id: 'cristal', label: 'Cristal', color: 0xcc3333, glyph: 'gem' },
      ],
      secuencia: ['libro', 'cristal'],
      tipo: 'secuencia',
    },
    {
      id: 4,
      instruccion: 'Toca solo el pergamino amarillo, no toques la poción',
      objetos: [
        { id: 'pergamino', label: 'Pergamino', color: 0xddaa22, glyph: 'scroll' },
        { id: 'pocion',    label: 'Poción',    color: 0x9933aa, glyph: 'potion' },
      ],
      secuencia: ['pergamino'],
      tipo: 'seleccion',
    },
    {
      id: 5,
      instruccion: 'Toca la poción morada y después el sombrero verde',
      objetos: [
        { id: 'pocion',   label: 'Poción',   color: 0x9933aa, glyph: 'potion' },
        { id: 'sombrero', label: 'Sombrero', color: 0x337733, glyph: 'hat' },
      ],
      secuencia: ['pocion', 'sombrero'],
      tipo: 'secuencia',
    },
    {
      id: 6,
      instruccion: 'Toca el cristal azul antes que la estrella naranja',
      objetos: [
        { id: 'cristal',  label: 'Cristal',  color: 0x2277cc, glyph: 'gem' },
        { id: 'estrella', label: 'Estrella', color: 0xcc6600, glyph: 'star' },
      ],
      secuencia: ['cristal'],
      tipo: 'orden_simple',
    },
    {
      id: 7,
      instruccion: 'Toca la varita roja y después el libro azul oscuro',
      objetos: [
        { id: 'varita', label: 'Varita', color: 0xcc2233, glyph: 'wand' },
        { id: 'libro',  label: 'Libro',  color: 0x224488, glyph: 'book' },
      ],
      secuencia: ['varita', 'libro'],
      tipo: 'secuencia',
    },
    {
      id: 8,
      instruccion: 'Toca únicamente la luna plateada, ignora el pergamino',
      objetos: [
        { id: 'sombrero', label: 'Pergamino', color: 0xbb8822, glyph: 'scroll' },
        { id: 'luna',     label: 'Luna',      color: 0xaabbdd, glyph: 'moon' },
      ],
      secuencia: ['luna'],
      tipo: 'seleccion',
    },
  ],

  /* ── Constantes de dificultad ── */
  config: {
    tiempoPalabra_ms:  4500,   // tiempo por ítem en pociones
    tiempoAdvertencia: 1500,   // cuando la barra se pone roja
    feedbackDuracion:  900,    // ms que se muestra el feedback
    transicionDuracion: 400,   // ms de fade entre pantallas
  },
};