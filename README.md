# Documentación Técnica: Plataforma de Tamizaje Digital
## Detección Temprana de Neurodivergencias mediante IA

**Equipo:** [Nombre del equipo]
**Fecha:** 17 de febrero de 2026

---

## Tabla de Contenidos

- [Introducción](#introducción)
  - [Contexto del Problema](#contexto-del-problema)
  - [Necesidad Identificada](#necesidad-identificada)
  - [Enfoque de la Solución](#enfoque-de-la-solución)
  - [Limitación Importante](#limitación-importante)
- [Propuesta de Valor](#propuesta-de-valor)
  - [Inteligencia Artificial Estructurada y Responsable](#inteligencia-artificial-estructurada-y-responsable)
  - [Experiencias Gamificadas para Niños](#experiencias-gamificadas-para-niños)
  - [Interfaz Empática para Adultos](#interfaz-empática-para-adultos)
  - [Resultados Estructurados y Comprensibles](#resultados-estructurados-y-comprensibles)
  - [Canalización Informada](#canalización-informada)
- [Arquitectura Técnica General](#arquitectura-técnica-general)
  - [Capas del Sistema](#capas-del-sistema)
  - [Principios de Diseño](#principios-de-diseño)
- [Frontend: Experiencia de Usuario](#frontend-experiencia-de-usuario)
  - [Tecnologías Utilizadas](#tecnologías-utilizadas)
  - [Módulo Infantil - Gamificación](#módulo-infantil---gamificación)
  - [Módulo Adulto - Interfaz Empática](#módulo-adulto---interfaz-empática)
- [Backend: Procesamiento y Lógica de Negocio](#backend-procesamiento-y-lógica-de-negocio)
  - [Tecnologías Implementadas](#tecnologías-implementadas)
  - [API REST - Endpoints Principales](#api-rest---endpoints-principales)
  - [Funciones del Backend](#funciones-del-backend)
- [Servicio de IA Responsable](#servicio-de-ia-responsable)
  - [Arquitectura de IA](#arquitectura-de-ia)
  - [Flujo de Procesamiento](#flujo-de-procesamiento)
  - [Estructura de Respuesta JSON](#estructura-de-respuesta-json)
  - [Restricciones del Modelo](#restricciones-del-modelo)
- [Entrega de Resultados](#entrega-de-resultados)
  - [Procesamiento de Resultados](#procesamiento-de-resultados)
  - [Presentación en Frontend](#presentación-en-frontend)
- [Canalización a Especialistas](#canalización-a-especialistas)
  - [Enfoque Responsable](#enfoque-responsable)
  - [Fuentes de Datos](#fuentes-de-datos)
  - [Proceso de Canalización](#proceso-de-canalización)
- [Consideraciones Éticas y de Seguridad](#consideraciones-éticas-y-de-seguridad)
  - [Protección de Datos](#protección-de-datos)
  - [Transparencia](#transparencia)
  - [Control de Acceso](#control-de-acceso)
- [Flujo Completo de Interacción](#flujo-completo-de-interacción)
  - [Paso a Paso del Sistema](#paso-a-paso-del-sistema)
- [Conclusión Técnica](#conclusión-técnica)
  - [Resumen de la Solución](#resumen-de-la-solución)
  - [Logros del Sistema](#logros-del-sistema)
  - [Limitaciones Importantes](#limitaciones-importantes)
  - [Impacto Esperado](#impacto-esperado)

---

## Introducción

### Contexto del Problema

En México, la falta de concientización y acceso oportuno a herramientas de detección temprana de neurodivergencias y problemas de salud mental en menores y adultos provoca diagnósticos tardíos. Esta situación genera estigmatización y limitaciones significativas en el desarrollo académico, social y profesional de las personas.

### Necesidad Identificada

Existe una necesidad clara de soluciones tecnológicas accesibles que permitan realizar tamizajes digitales tempranos. Estas herramientas deben facilitar la canalización adecuada hacia especialistas y, al mismo tiempo, promover la cultura de la salud mental en la población mexicana.

### Enfoque de la Solución

Desarrollar una aplicación web basada en Inteligencia Artificial orientada al tamizaje digital de neurodivergencias. La plataforma está diseñada específicamente para:

- Detectar indicadores tempranos en niños mediante dinámicas gamificadas que resulten atractivas y no intrusivas.
- Concientizar a adultos sobre posibles señales relacionadas con atención, memoria y espectro autista.
- Facilitar la canalización oportuna con especialistas cuando sea necesario.

### Limitación Importante

Es fundamental destacar que la plataforma **no realiza diagnósticos clínicos**. Funciona exclusivamente como una herramienta de orientación y concientización basada en evidencia, dejando siempre el diagnóstico final a profesionales de la salud.

---

## Propuesta de Valor

La propuesta combina múltiples elementos innovadores:

### Inteligencia Artificial Estructurada y Responsable

La IA implementada sigue principios éticos estrictos, con algoritmos diseñados para ser transparentes, explicables y libres de sesgos. No se toman decisiones autónomas sin supervisión.

### Experiencias Gamificadas para Niños

El módulo infantil transforma la evaluación en una experiencia lúdica. Los niños interactúan con juegos diseñados específicamente para registrar métricas conductuales sin que perciban el proceso como una evaluación médica.

### Interfaz Empática para Adultos

El módulo adulto utiliza un lenguaje cuidadosamente diseñado para reducir el estigma. La interfaz es profesional pero cálida, con mensajes que transmiten comprensión y apoyo.

### Resultados Estructurados y Comprensibles

Los reportes generados son claros y accesibles, evitando tecnicismos innecesarios. Se presentan en formatos visuales fáciles de interpretar.

### Canalización Informada

La derivación a especialistas se basa en información verificada, no en sugerencias aleatorias. Se mantiene un directorio actualizado de profesionales.

---

## Arquitectura Técnica General

La solución se implementa como una aplicación web con arquitectura modular que separa claramente:

### Capas del Sistema

1. **Capa de Presentación**: Frontend que maneja la experiencia de usuario.
2. **Capa de Lógica de Negocio**: Backend que procesa y valida datos.
3. **Capa de IA**: Servicios de inteligencia artificial para análisis de patrones.
4. **Capa de Datos**: Base de datos para persistencia y trazabilidad.

### Principios de Diseño

- Separación clara de responsabilidades.
- Comunicación estructurada entre capas.
- Minimización de datos sensibles.
- Trazabilidad completa de evaluaciones.

---

## Frontend: Experiencia de Usuario

### Tecnologías Utilizadas

El frontend está desarrollado con tecnologías web estándar:

- **HTML5**: Estructura semántica y accesible.
- **CSS3**: Diseño responsivo y temas visuales.
- **JavaScript/TypeScript**: Lógica de interacción y captura de métricas.
- **Phaser/Canvas**: Para el módulo infantil y dinámicas gamificadas.

### Módulo Infantil - Gamificación

#### Objetivo

Crear una experiencia de tipo juego donde el menor no perciba el proceso como una evaluación médica. Las dinámicas se presentan como misiones o minijuegos atractivos.

#### Actividades Implementadas

- **Reconocimiento de patrones**: El niño identifica secuencias y elementos repetitivos.
- **Tareas go/no-go disfrazadas**: Evalúan atención e inhibición mediante juegos de "haz clic cuando veas X, ignora cuando veas Y".
- **Secuencias para memoria de trabajo**: Recordar y reproducir secuencias crecientes.
- **Ejercicios fonológicos**: Identificar sonidos similares o diferentes.

#### Métricas Capturadas

Cada interacción genera eventos específicos:

- Tiempo de reacción por estímulo: $t_{reacción}$.
- Errores por impulsividad (respuestas anticipadas): $E_{impulsivos}$.
- Omisiones (falta de respuesta cuando era requerida): $O_{totales}$.
- Variabilidad entre respuestas: $\sigma_{respuestas} = \sqrt{\frac{1}{N}\sum_{i=1}^{N}(t_i - \bar{t})^2}$.
- Patrones de error por nivel de dificultad.

#### Procesamiento en Navegador

El frontend acumula eventos durante la sesión y genera métricas agregadas como el tiempo promedio de reacción $\bar{t} = \frac{1}{N}\sum_{i=1}^{N} t_i$ y la tasa de error $E_{tasa} = \frac{E_{totales}}{N_{estímulos}}$ para enviar al servidor. Esto evita transferir datos crudos innecesarios y optimiza el rendimiento.

### Módulo Adulto - Interfaz Empática

#### Diseño de Interfaz

Interfaz clara y profesional diseñada para reducir el estigma:

- Lenguaje no alarmista y validante.
- Control del ritmo de interacción (pausar y continuar).
- Indicadores de progreso visuales.
- Mensajes empáticos durante todo el proceso.

#### Actividades para Adultos

- Formularios progresivos y autoevaluaciones estructuradas.
- Microtareas cognitivas breves.
- Cuestionarios de auto-reporte.

#### Elementos UX Clave

- Barra de progreso visible.
- Confirmaciones claras después de cada sección.
- Opción de guardar y continuar después.
- Reporte final comprensible y visual.

---

## Backend: Procesamiento y Lógica de Negocio

### Tecnologías Implementadas

- **Node.js**: Entorno de ejecución JavaScript.
- **Express**: Framework para API REST.
- **JWT**: Autenticación segura.
- **Base de datos relacional**: PostgreSQL/MySQL para persistencia.

### API REST - Endpoints Principales

```http
POST /api/auth/login        - Autenticación de usuarios
POST /api/auth/register     - Registro de nuevos usuarios
POST /api/evaluaciones      - Registrar nueva evaluación
POST /api/eventos           - Enviar eventos agregados
GET  /api/resultados/:id    - Consultar resultado final
GET  /api/especialistas     - Consultar directorio de especialistas
