export const API             = 'http://localhost:3000'
export const DAILY_LIMIT     = 5
export const STORAGE_KEY     = 'mp_ia_uses'
export const METRICS_STORAGE = 'mp_game_metrics'

export const ADULT_TASK_DEFS = [
  { id: 'asrs',     name: 'Cuestionario ASRS', duration: '5 min', difficulty: 'Fácil',   color: '#10b981', componentKey: 'AdultAsrs' },
  { id: 'dyslexia', name: 'Lista de Dislexia',  duration: '4 min', difficulty: 'Fácil',   color: '#3b82f6', componentKey: 'AdultDyslexiaChecklist' },
  { id: 'stroop',   name: 'Tarea Stroop',       duration: '3 min', difficulty: 'Media',   color: '#f59e0b', componentKey: 'AdultStroop' },
  { id: 'subit',    name: 'Subitización',       duration: '5 min', difficulty: 'Media',   color: '#BE7D57', componentKey: 'AdultSubitizing' },
  { id: 'lexical',  name: 'Decisión Léxica',    duration: '4 min', difficulty: 'Difícil', color: '#ef4444', componentKey: 'AdultLexicalDecision' },
]

export const MINOR_TASKS = [
  {
    id: 'juego-astrid',
    name: 'Juego Astrid',
    duration: 'Discalculia',
    difficulty: 'Menores',
    color: '#BE7D57',
    href: '/juego-astrid/',
    desc: 'Evaluación de habilidades numéricas y matemáticas básicas.',
  },
  {
    id: 'academia-magia',
    name: 'Academia de la Magia',
    duration: 'Lectura',
    difficulty: 'Menores',
    color: '#3b82f6',
    href: '/academia-magia/juego.html',
    desc: 'Evaluación de lectura de letras, palabras y oraciones (PROLEC-R).',
  },
  {
    id: 'nova-drive',
    name: 'Nova Drive',
    duration: 'Atención',
    difficulty: 'Menores',
    color: '#10b981',
    href: '/nova-drive/',
    desc: 'Evaluación de atención sostenida e impulsividad.',
  },
]

export const suggestions = [
  'Cómo mejorar mi memoria',
  'Técnicas para reducir ansiedad',
  'Cómo concentrarme mejor',
  'Qué evaluación hacer primero',
]

export const GAME_LABELS = {
  'juego-astrid':   'Juego Astrid — Habilidades numéricas',
  'academia-magia': 'Academia de la Magia — Lectura PROLEC-R',
  'nova-drive':     'Nova Drive — Atención sostenida',
}
