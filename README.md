# Documentación Técnica: Plataforma de Tamizaje Digital
## Detección Temprana y Fortalecimiento Cognitivo mediante IA

**Equipo:** Mind Patch
**Fecha de actualización:** 18 de marzo 2026

---

## Tabla de Contenidos

- [Introducción](#introducción)
- [Propuesta de Valor](#propuesta-de-valor)
- [Estado Actual (MVP Implementado)](#estado-actual-mvp-implementado)
- [Arquitectura Técnica General](#arquitectura-técnica-general)
- [Frontend: Experiencia de Usuario](#frontend-experiencia-de-usuario)
- [Backend: Procesamiento y Lógica](#backend-procesamiento-y-lógica)
- [Motor de Estimulación Adaptativa](#motor-de-estimulación-adaptativa)
- [Servicio de IA Responsable](#servicio-de-ia-responsable)
- [Consideraciones Éticas y de Seguridad](#consideraciones-éticas-y-de-seguridad)
- [Guía de Instalación y Ejecución](#guía-de-instalación-y-ejecución)

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

---

## Propuesta de Valor

### Detección Temprana Accesible
Identificación de indicadores conductuales y cognitivos mediante dinámicas digitales estructuradas y juegos.

### Lenguaje Empático y No Alarmista
Los resultados no etiquetan, no usan términos clínicos y se centran en fortalezas y áreas a fortalecer.

### IA Estructurada y Responsable
La IA no diagnostica ni reemplaza especialistas. Funciona como apoyo descriptivo, operando bajo reglas predefinidas y con salida controlada en formato JSON.

### Acompañamiento Activo
Además de la orientación inicial, el sistema ofrece actividades digitales adaptativas que ayudan a fortalecer habilidades mientras el usuario gestiona atención profesional.

---

## Estado Actual (MVP Implementado)

Actualmente, el sistema cuenta con un **Módulo de Inteligencia Artificial y Control (Backend)** 100% funcional y una **Interfaz de Tutor (Frontend)**. Los logros técnicos integrados son:

- **Motor de IA:** Integración directa con Google Gemini 2.5 Flash para el análisis de perfiles neurodivergentes.
- **Base de Datos:** Estructura completa en PostgreSQL utilizando el tipo de dato flexible `JSONB` para guardar métricas dinámicas de los minijuegos.
- **Seguridad:** Autenticación robusta y cifrada mediante JSON Web Tokens (JWT) almacenados en el LocalStorage del navegador.
- **Frontend Administrativo:** Panel de control web desarrollado con enfoque *Mobile-First* (diseño responsivo) para que los tutores visualicen perfiles cognitivos y aciertos desde cualquier dispositivo.

---

## Arquitectura Técnica General

### Capas del Sistema
1. **Capa de Presentación (Frontend):** Interfaz de usuario, experiencias gamificadas y captura de métricas.
2. **Capa de Lógica de Negocio (Backend):** API REST, procesamiento y validación.
3. **Motor de Perfil Cognitivo:** Cálculo de indicadores estadísticos a partir de métricas.
4. **Motor de Estimulación Adaptativa:** Generación y ajuste de planes de actividades personalizados.
5. **Servicio de IA Responsable:** Análisis estructurado y generación de descripciones en lenguaje natural.
6. **Capa de Datos:** Persistencia y trazabilidad (PostgreSQL).

### Principios de Diseño
- Separación clara entre evaluación y fortalecimiento.
- Minimización de datos personales (anonimización antes de enviar a la IA).
- IA como apoyo descriptivo, no como decisor clínico.
- Enfoque ético y transparente.

---

## Frontend: Experiencia de Usuario

### Tecnologías
- **HTML5:** Estructura semántica con metaetiquetas `viewport` para escalado en dispositivos móviles.
- **CSS3:** Diseño responsivo (Media Queries) y accesibilidad cross-browser.
- **JavaScript Vanilla:** Lógica de interacción asíncrona (`fetch`) y manejo de estado (`LocalStorage`).
- **Phaser:** Motor para dinámicas gamificadas en 2D (Fase en desarrollo).

### Módulo Infantil (Gamificación)
- **Objetivo:** Explorar patrones de respuesta mediante juegos no clínicos.
- **Actividades:** Juegos de atención selectiva, dinámicas go/no-go, secuencias de memoria de trabajo, discriminación auditiva/visual.

**Métricas Capturadas:**

- **Tiempo promedio de respuesta:**

$$\langle t \rangle = \frac{1}{N} \sum_{i=1}^{N} t_i$$

- **Variabilidad (desviación estándar):**

$$\sigma_t = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (t_i - \langle t \rangle)^2}$$

- **Tasa de aciertos:**

$$TA = \left(\frac{A_{totales}}{N_{total}}\right) \times 100\%$$

- **Tasa de impulsividad:**

$$TI = \left(\frac{E_{impulsivos}}{N_{total}}\right) \times 100\%$$

### Módulo Adulto / Tutor
- Interfaces de Login (`index.html`) y Dashboard (`panel.html`) totalmente responsivas.
- Tablas deslizables (`overflow-x: auto`) para la correcta visualización de reportes médicos en teléfonos celulares.

---

## Backend: Procesamiento y Lógica

### Tecnologías
- **Node.js + Express:** Entorno y framework para API REST.
- **CORS & JWT:** Configuración de cabeceras para permitir peticiones web seguras.
- **PostgreSQL:** Base de datos relacional para usuarios y directorio, con soporte NoSQL (`JSONB`) para métricas de juego complejas.

### API REST - Endpoints Principales Construidos

- `POST /api/auth/login` — Autenticación y generación del gafete de seguridad JWT.
- `GET /api/evaluaciones/:id` — Recuperación de datos anonimizados.
- `POST /api/evaluaciones/:id/analizar` — Comunicación directa con el SDK de Google Gemini para estructurar el perfil.
- `POST /api/actividades/plan` — Generador algorítmico del plan de adaptación cognitiva.
- `GET /api/especialistas` — Despliegue del directorio médico neutral y sin sesgos de algoritmo.

---

## Motor de Estimulación Adaptativa

### Objetivo
Traducir el perfil orientativo en un plan de actividades digitales personalizadas. **No constituye tratamiento clínico.**

### Estructura del Plan
El motor genera planes en formato JSON con actividades, frecuencia, duración y parámetros iniciales (ej. cantidad de distractores, velocidad de los estímulos).

### Adaptación Dinámica
Ajusta parámetros según reglas predefinidas en función del desempeño del usuario (ej. Si la tasa de aciertos es menor al 50%, el backend ordena disminuir la dificultad visual).

---

## Servicio de IA Responsable

### Función
La IA recibe métricas anonimizadas (exclusivamente tiempos y aciertos, sin datos personales) y genera descripciones en lenguaje natural, sugiriendo parámetros dentro de límites predefinidos. Nunca emite diagnósticos.

### Arquitectura de IA
- **SDK `@google/generative-ai`:** Conexión segura con el motor principal.
- **Google Gemini 2.5 Flash:** Modelo de última generación seleccionado por su alta velocidad de respuesta y precisión en la estructuración de objetos de datos.
- **Prompt Engineering:** Reglas estrictas inyectadas en el backend para forzar que la salida sea exclusivamente un formato JSON válido y procesable.

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
```

---

## Consideraciones Éticas y de Seguridad

### Protección de Datos
Garantizamos la confidencialidad de la información aislando los módulos: la base de datos almacena la información relacional, pero el puente de conexión hacia Gemini filtra nombres y correos antes del análisis. El archivo `.env` protege las credenciales y llaves maestras fuera del repositorio público.

### Transparencia
El sistema detalla claramente el propósito de las evaluaciones y el alcance del uso de la Inteligencia Artificial, incluyendo un descargo de responsabilidad obligatorio en la respuesta de cada endpoint evaluativo.

### Control de Acceso
Implementación de roles (Tutor, Especialista, Menor) con accesos restringidos mediante el middleware de verificación de tokens.

---

## Guía de Instalación y Ejecución

Para que el equipo de desarrollo despliegue el prototipo localmente:

1. Clonar el repositorio.
2. Navegar a la carpeta `mind-patch-api` y ejecutar `npm install`.
3. Crear un archivo `.env` en esa misma carpeta e incluir las credenciales de PostgreSQL y la variable `GEMINI_API_KEY`.
4. Ejecutar los scripts de creación de base de datos (`node crearTablas.js` y `node crearDirectorio.js`).
5. Iniciar el servidor backend con `node server.js`.
6. Navegar a la carpeta del frontend y abrir `index.html` utilizando la extensión *Live Server* de Visual Studio Code.
