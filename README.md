# Mind-Patch 🧠🎮

Plataforma gamificada de evaluación, seguimiento y apoyo cognitivo/terapéutico impulsada por Inteligencia Artificial Generativa (Google Gemini & LangChain), construida sobre una arquitectura de contenedores con Node.js/Express, PostgreSQL y múltiples módulos interactivos y minijuegos web.

---

## 🎯 Objetivo del Proyecto

**Mind-Patch** integra videojuegos cognitivos interactivos con un ecosistema de servicios backend e inteligencia artificial para evaluar métricas de desempeño cognitivo, atención, memoria y toma de decisiones, ofreciendo retroalimentación asistida por IA, geolocalización de especialistas y paneles de resultados para usuarios y profesionales de la salud mental.

---

## 🏛️ Estructura del Proyecto

```text
Mind-Patch/
├── Backend/                                  # API principal en Node.js + Express + Sequelize + Google OAuth2
│   ├── controllers/                          # Controladores de IA, Mapas, Resultados y Autenticación
│   ├── db/                                   # Configuración de conexión a PostgreSQL
│   ├── middleware/                           # Middlewares de autenticación JWT y validación
│   ├── modules/Auth/                         # Integración con Passport Google OAuth 2.0
│   ├── routes/                               # Rutas (/api/auth, /api/ia, /api/maps, /api/res)
│   ├── app.js                                # Configuración de Express y CORS
│   ├── server.js                             # Punto de entrada del servidor (Puerto 3000)
│   └── Dockerfile                            # Contenedor del servicio Backend
├── api-backend/                              # Servicio API complementario (Especialistas, Citas y Gemini AI)
│   ├── config/                               # Configuración de conexión PostgreSQL
│   ├── controllers/                          # Controladores de especialistas y servicios clínicos
│   ├── middlewares/                          # Validación de sesiones y tokens JWT
│   ├── routes/                               # Definición de endpoints REST
│   ├── crearTablas.js                        # Script de inicialización de tablas
│   └── server.js                             # Servidor Express API
├── langchain/                                # Módulo de experimentación e integración conversacional con LangChain y Gemini
│   ├── index.js                              # Agente conversacional con @google/genai (gemini-3-flash-preview)
│   ├── documentosn.js                        # Procesamiento contextual de documentos con LangChain
│   └── package.json                          # Dependencias de LangChain (@langchain/google-genai, @langchain/openai)
├── db/                                       # Infraestructura de Base de Datos Relacional (PostgreSQL 16)
│   ├── init-01/                              # Scripts SQL de inicialización de esquema y datos semilla
│   └── docker-compose.yml                    # Orquestación aislada de la base de datos
├── front-end/                                # Aplicaciones cliente y ecosistema de minijuegos cognitivos
│   ├── front end - Mind Patch-Diseño web/    # Portal web principal de Mind-Patch (React + Vite)
│   ├── nova-drive/                           # Minijuego de reflejos, atención visomotora y conducción espacial
│   ├── Juego_Academia_de_la_magia/           # Minijuego cognitivo de memoria, secuencias y resolución lógica
│   ├── juego-astrid/                         # Minijuego interactivo de agilidad mental y toma de decisiones
│   └── Juego_Jesus_1_Archivo/                # Minijuego autocontenido de destreza y enfoque cognitivo
├── diagrams/                                       # Definiciones PlantUML (.puml) de arquitectura C4 (Nivel 1 y Nivel 2)
├── diagrams/                                 # Diagramas arquitectónicos C4 (Niveles 1-3), UML, Bloques, Flujo de Usuario y Tech Stack (.drawio, .png, .svg, .jpeg)
├── docs/                                     # Documentación funcional, planteamiento del problema, propuestas de minijuegos y especificaciones C4 (.pdf, .docx)
├── docker-compose.yml                        # Orquestación integral (PostgreSQL 16 + Backend + Frontend)
├── DOCUMENTACION_TECNICA.md                  # Especificación técnica detallada del sistema y arquitectura C4
├── requirements.txt                          # Especificación de dependencias del ecosistema y comandos de instalación
├── LICENSE                                   # Licencia MIT
└── package.json                              # Configuración raíz del proyecto Node.js
```

---

## 🎮 Módulos Frontend y Minijuegos Cognitivos

1. **Portal Principal (`front-end/front end - Mind Patch-Diseño web/`)**: Interfaz central del paciente/usuario para autenticación, visualización de progreso terapéutico, chat asistido por IA y búsqueda de especialistas.
2. **Nova Drive (`front-end/nova-drive/`)**: Minijuego enfocado en coordinación visomotora, velocidad de reacción e inhibición de estímulos distractores.
3. **Academia de la Magia (`front-end/Juego_Academia_de_la_magia/`)**: Entorno gamificado orientado a memoria de trabajo, reconocimiento de patrones y atención sostenida.
4. **Juego Astrid (`front-end/juego-astrid/`)**: Módulo interactivo en React/Vite para evaluación de flexibilidad cognitiva y resolución de tareas bajo presión temporal.
5. **Juego Jesús (`front-end/Juego_Jesus_1_Archivo/`)**: Prototipo ligero de evaluación rápida integrable en navegador.

---

## 🚀 Requisitos e Instalación

### Prerrequisitos
- **Docker** y **Docker Compose** (para despliegue contenedorizado completo)
- **Node.js** `>= 18.x` y **npm** (para ejecución local por servicio)
- **PostgreSQL** `16` (si se ejecuta sin Docker)
- Clave de API de Google Gemini (`GEMINI_API_KEY`) configurada en archivo `.env`

### Opción 1: Despliegue con Docker Compose (Recomendado)

```bash
docker compose up --build -d
```
- **Frontend Web:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000`
- **PostgreSQL 16:** Puerto `5432` (usuario/contraseña/base por defecto: `mindpatch`)

### Opción 2: Instalación Manual por Módulo

```bash
# 1. Dependencias en la raíz
npm install

# 2. Servicio Backend Principal
cd Backend
npm install
npm run dev

# 3. Servicio API Backend Secundario
cd ../api-backend
npm install
node server.js

# 4. Módulo de IA Conversacional (LangChain / Gemini)
cd ../langchain
npm install
node index.js

# 5. Portal Frontend Principal
cd "../front-end/front end - Mind Patch-Diseño web/mind-patch-diseño web"
npm install
npm run dev
```

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Consulta el archivo [`LICENSE`](file:///g:/Mi%20unidad/Drive.alumno.udg.mx/Proyectos/Mind-Patch/LICENSE) para más detalles.
