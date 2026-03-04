# Documentación Técnica: Plataforma de Tamizaje Digital
## Detección Temprana y Fortalecimiento Cognitivo mediante IA

**Equipo:** Mind Patch
**Fecha de actualización:** 03 de marzo 2026

---

## Tabla de Contenidos

- [Introducción](#introducción)
    - [Contexto del Problema](#contexto-del-problema)
    - [Necesidad Identificada](#necesidad-identificada)
    - [Enfoque de la Solución](#enfoque-de-la-solución)
    - [Limitación Importante](#limitación-importante)
- [Propuesta de Valor](#propuesta-de-valor)
    - [Detección Temprana Accesible](#detección-temprana-accesible)
    - [Lenguaje Empático y No Alarmista](#lenguaje-empático-y-no-alarmista)
    - [IA Estructurada y Responsable](#ia-estructurada-y-responsable)
    - [Acompañamiento Activo](#acompañamiento-activo)
- [Arquitectura Técnica General](#arquitectura-técnica-general)
    - [Capas del Sistema](#capas-del-sistema)
    - [Principios de Diseño](#principios-de-diseño)
- [Frontend: Experiencia de Usuario](#frontend-experiencia-de-usuario)
    - [Tecnologías](#tecnologías)
    - [Módulo Infantil (Gamificación)](#módulo-infantil-gamificación)
    - [Módulo Adulto](#módulo-adulto)
- [Backend: Procesamiento y Lógica](#backend-procesamiento-y-lógica)
    - [Tecnologías](#tecnologías-1)
    - [API REST - Endpoints Principales](#api-rest---endpoints-principales)
    - [Motor de Perfil Cognitivo](#motor-de-perfil-cognitivo)
- [Motor de Estimulación Adaptativa](#motor-de-estimulación-adaptativa)
    - [Objetivo](#objetivo)
    - [Estructura del Plan](#estructura-del-plan)
    - [Adaptación Dinámica](#adaptación-dinámica)
- [Servicio de IA Responsable](#servicio-de-ia-responsable)
    - [Función](#función)
    - [Arquitectura de IA](#arquitectura-de-ia)
    - [Ejemplo de Respuesta JSON](#ejemplo-de-respuesta-json)
- [Canalización a Especialistas](#canalización-a-especialistas)
- [Consideraciones Éticas y de Seguridad](#consideraciones-éticas-y-de-seguridad)
    - [Protección de Datos](#protección-de-datos)
    - [Transparencia](#transparencia)
    - [Control de Acceso](#control-de-acceso)
- [Flujo Completo del Sistema](#flujo-completo-del-sistema)
- [Conclusión Técnica](#conclusión-técnica)

---

## Introducción

### Contexto del Problema
En México, el acceso tardío a evaluaciones especializadas en áreas como atención, memoria y regulación cognitiva limita la posibilidad de actuar preventivamente. La falta de herramientas accesibles que orienten a familias y adultos de manera temprana retrasa la búsqueda de acompañamiento profesional.

### Necesidad Identificada
Se requiere una plataforma digital que permita:
- Explorar indicadores cognitivos de forma accesible.
- Ofrecer orientación estructurada y comprensible.
- Sugerir cuándo podría ser conveniente acudir con un especialista.
- Proponer actividades digitales de fortalecimiento cognitivo.

### Enfoque de la Solución
Aplicación web basada en IA que combina: exploración digital temprana, generación de un perfil cognitivo orientativo, recomendación profesional responsable y actividades digitales adaptativas de fortalecimiento. Diseñada para población infantil y adulta.

### Limitación Importante
La plataforma **no realiza diagnósticos clínicos**. Su función es orientar, describir tendencias observadas y sugerir áreas que podrían beneficiarse de acompañamiento profesional. El diagnóstico formal corresponde exclusivamente a profesionales de la salud.

## Propuesta de Valor

### Detección Temprana Accesible
Identificación de indicadores conductuales y cognitivos mediante dinámicas digitales estructuradas y juegos.

### Lenguaje Empático y No Alarmista
Los resultados no etiquetan, no usan términos clínicos y se centran en fortalezas y áreas a fortalecer.

### IA Estructurada y Responsable
La IA no diagnostica ni reemplaza especialistas. Funciona como apoyo descriptivo, operando bajo reglas predefinidas y con salida controlada en formato JSON.

### Acompañamiento Activo
Además de la orientación inicial, el sistema ofrece actividades digitales adaptativas que ayudan a fortalecer habilidades mientras el usuario gestiona atención profesional.

## Arquitectura Técnica General

### Capas del Sistema
1.  **Capa de Presentación (Frontend):** Interfaz de usuario, experiencias gamificadas y captura de métricas.
2.  **Capa de Lógica de Negocio (Backend):** API REST, procesamiento y validación.
3.  **Motor de Perfil Cognitivo:** Cálculo de indicadores estadísticos a partir de métricas.
4.  **Motor de Estimulación Adaptativa:** Generación y ajuste de planes de actividades personalizados.
5.  **Servicio de IA Responsable:** Análisis estructurado y generación de descripciones en lenguaje natural.
6.  **Capa de Datos:** Persistencia y trazabilidad (PostgreSQL).

### Principios de Diseño
- Separación clara entre evaluación y fortalecimiento.
- Minimización de datos personales.
- IA como apoyo, no como decisor clínico.
- Enfoque ético y transparente.

## Frontend: Experiencia de Usuario

### Tecnologías
- **HTML5:** Estructura semántica.
- **CSS3:** Diseño responsivo.
- **JavaScript/TypeScript:** Lógica de interacción.
- **Phaser:** Motor para dinámicas gamificadas en 2D.
- **Three.js:** Entornos visuales interactivos 3D.

### Módulo Infantil (Gamificación)
- **Objetivo:** Explorar patrones de respuesta mediante juegos no clínicos.
- **Actividades:** Juegos de atención selectiva, dinámicas go/no-go, secuencias de memoria de trabajo, discriminación auditiva/visual.
- **Métricas Capturadas:**
    - **Tiempo promedio de respuesta:**  
  `<t> = (1/N) * Σ(t_i)`

- **Variabilidad (desviación estándar):**  
  `σ_t = √[ (1/N) * Σ(t_i - <t>)² ]`

- **Tasa de aciertos:**  
  `TA = (A_totales / N_total) × 100%`

- **Tasa de impulsividad:**  
  `TI = (E_impulsivos / N_total) × 100%`

### Módulo Adulto
- Cuestionarios estructurados y microtareas cognitivas.
- Reportes visuales con lenguaje claro y empático.

## Backend: Procesamiento y Lógica

### Tecnologías
- **Node.js + Express:** Entorno y framework para API REST.
- **JWT:** Autenticación segura.
- **PostgreSQL:** Base de datos con soporte JSONB.

### API REST - Endpoints Principales
- `POST /api/auth/login` - Autenticación de usuarios
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/evaluaciones` - Registrar nueva evaluación
- `POST /api/eventos` - Enviar eventos agregados
- `GET /api/resultados/:id` - Consultar resultado final
- `GET /api/especialistas` - Consultar directorio
- `POST /api/actividades/plan` - Generar plan de actividades
- `GET /api/actividades/:id` - Obtener actividad específica

### Motor de Perfil Cognitivo
Recibe métricas agregadas y calcula indicadores estadísticos para áreas como enfoque, memoria de trabajo y regulación. Organiza los resultados en un perfil descriptivo estructurado.

## Motor de Estimulación Adaptativa

### Objetivo
Traducir el perfil orientativo en un plan de actividades digitales personalizadas. **No constituye tratamiento clínico.**

### Estructura del Plan
El motor genera planes en formato JSON con actividades, frecuencia, duración y parámetros iniciales.

### Adaptación Dinámica
Ajusta parámetros (velocidad, distractores, complejidad) según reglas predefinidas en función del desempeño del usuario (ej. Si la tasa de aciertos < 50%, disminuir dificultad).

## Servicio de IA Responsable

### Función
La IA recibe métricas anonimizadas y genera descripciones en lenguaje natural, sugiriendo parámetros dentro de límites predefinidos. Nunca emite diagnósticos.

### Arquitectura de IA
- **LangChain:** Orquestador que construye prompts estructurados y aplica reglas de salida (JSON).
- **Google AI Studio (Gemini):** Motor de análisis que identifica patrones y genera descripciones cualitativas.

### Ejemplo de Respuesta JSON
```json
{
  "tipo_usuario": "infantil",
  "perfil_observado": {
    "fortalezas": ["Buena capacidad de seguimiento de instrucciones"],
    "areas_para_fortalecer": ["Mantenimiento de atención con distractores"]
  },
  "tendencias_identificadas": {
    "atencion": "Variabilidad moderada en presencia de distractores"
  },
  "nota_etica": "Este análisis es un perfil orientativo y no constituye un diagnóstico clínico."
}
