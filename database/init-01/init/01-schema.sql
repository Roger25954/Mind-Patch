-- =========================
-- MIND PATCH - ESQUEMA BASE
-- =========================

-- =========================
-- TABLA: roles
-- =========================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- =========================
-- TABLA: usuarios
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    rol_id INTEGER NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150),
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    estado_cuenta VARCHAR(30) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    CONSTRAINT fk_usuarios_rol
        FOREIGN KEY (rol_id) REFERENCES roles(id)
        ON DELETE RESTRICT
);

-- =========================
-- TABLA: perfiles
-- =========================
CREATE TABLE IF NOT EXISTS perfiles (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL,
    fecha_nacimiento DATE,
    edad INTEGER CHECK (edad >= 0),
    region VARCHAR(100),
    preferencias JSONB,
    CONSTRAINT fk_perfiles_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =========================
-- TABLA: tutores
-- =========================
CREATE TABLE IF NOT EXISTS tutores (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL,
    parentesco VARCHAR(50),
    telefono VARCHAR(30),
    correo_contacto VARCHAR(150),
    CONSTRAINT fk_tutores_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =========================
-- TABLA: usuario_tutor
-- =========================
CREATE TABLE IF NOT EXISTS usuario_tutor (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    tutor_id INTEGER NOT NULL,
    CONSTRAINT fk_usuario_tutor_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_usuario_tutor_tutor
        FOREIGN KEY (tutor_id) REFERENCES tutores(id)
        ON DELETE CASCADE,
    CONSTRAINT uq_usuario_tutor UNIQUE (usuario_id, tutor_id)
);

-- =========================
-- TABLA: evaluaciones
-- =========================
CREATE TABLE IF NOT EXISTS evaluaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    tipo_evaluacion VARCHAR(100) NOT NULL,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    estado VARCHAR(30) DEFAULT 'pendiente',
    puntaje_total NUMERIC(10,2),
    observaciones_generales TEXT,
    CONSTRAINT fk_evaluaciones_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =========================
-- TABLA: resultados_evaluacion
-- =========================
CREATE TABLE IF NOT EXISTS resultados_evaluacion (
    id SERIAL PRIMARY KEY,
    evaluacion_id INTEGER NOT NULL,
    dimension_evaluada VARCHAR(100) NOT NULL,
    puntaje NUMERIC(10,2),
    nivel_resultado VARCHAR(50),
    interpretacion TEXT,
    CONSTRAINT fk_resultados_evaluacion
        FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id)
        ON DELETE CASCADE
);

-- =========================
-- TABLA: respuestas_evaluacion
-- =========================
CREATE TABLE IF NOT EXISTS respuestas_evaluacion (
    id SERIAL PRIMARY KEY,
    evaluacion_id INTEGER NOT NULL,
    reactivo_id VARCHAR(100),
    respuesta TEXT,
    tiempo_respuesta_segundos NUMERIC(10,2),
    es_correcta BOOLEAN,
    puntaje_obtenido NUMERIC(10,2),
    CONSTRAINT fk_respuestas_evaluacion
        FOREIGN KEY (evaluacion_id) REFERENCES evaluaciones(id)
        ON DELETE CASCADE
);

-- =========================
-- TABLA: actividades
-- =========================
CREATE TABLE IF NOT EXISTS actividades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    dificultad VARCHAR(50),
    edad_recomendada VARCHAR(50),
    estado VARCHAR(30) DEFAULT 'activa',
    version VARCHAR(30)
);

-- =========================
-- TABLA: sesiones_actividad
-- =========================
CREATE TABLE IF NOT EXISTS sesiones_actividad (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    actividad_id INTEGER NOT NULL,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    duracion_segundos INTEGER CHECK (duracion_segundos >= 0),
    puntaje NUMERIC(10,2),
    nivel_alcanzado VARCHAR(50),
    errores INTEGER DEFAULT 0 CHECK (errores >= 0),
    aciertos INTEGER DEFAULT 0 CHECK (aciertos >= 0),
    metricas_extra JSONB,
    CONSTRAINT fk_sesiones_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_sesiones_actividad
        FOREIGN KEY (actividad_id) REFERENCES actividades(id)
        ON DELETE CASCADE
);

-- =========================
-- TABLA: eventos_sesion
-- =========================
CREATE TABLE IF NOT EXISTS eventos_sesion (
    id SERIAL PRIMARY KEY,
    sesion_actividad_id INTEGER NOT NULL,
    tipo_evento VARCHAR(100) NOT NULL,
    valor TEXT,
    timestamp_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eventos_sesion
        FOREIGN KEY (sesion_actividad_id) REFERENCES sesiones_actividad(id)
        ON DELETE CASCADE
);

-- =========================
-- TABLA: progreso_usuario
-- =========================
CREATE TABLE IF NOT EXISTS progreso_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    area VARCHAR(100) NOT NULL,
    nivel_actual VARCHAR(50),
    porcentaje_avance NUMERIC(5,2) DEFAULT 0 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_progreso_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =========================
-- TABLA: recomendaciones
-- =========================
CREATE TABLE IF NOT EXISTS recomendaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    actividad_id INTEGER,
    motivo_recomendacion TEXT,
    prioridad VARCHAR(30),
    fecha_generada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atendida BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_recomendaciones_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_recomendaciones_actividad
        FOREIGN KEY (actividad_id) REFERENCES actividades(id)
        ON DELETE SET NULL
);

-- =========================
-- TABLA: consentimientos
-- =========================
CREATE TABLE IF NOT EXISTS consentimientos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    tipo_consentimiento VARCHAR(100) NOT NULL,
    aceptado BOOLEAN NOT NULL,
    fecha_aceptacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version_documento VARCHAR(50),
    CONSTRAINT fk_consentimientos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =========================
-- TABLA: auditoria
-- =========================
CREATE TABLE IF NOT EXISTS auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    registro_id INTEGER,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(50),
    user_agent TEXT,
    CONSTRAINT fk_auditoria_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL
);

-- =========================
-- ÍNDICES
-- =========================
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_usuario_id ON evaluaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_resultados_evaluacion_id ON resultados_evaluacion(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_evaluacion_id ON respuestas_evaluacion(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON sesiones_actividad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_actividad_id ON sesiones_actividad(actividad_id);
CREATE INDEX IF NOT EXISTS idx_eventos_sesion_id ON eventos_sesion(sesion_actividad_id);
CREATE INDEX IF NOT EXISTS idx_progreso_usuario_id ON progreso_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_recomendaciones_usuario_id ON recomendaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_consentimientos_usuario_id ON consentimientos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria(usuario_id);

-- =========================
-- DATOS INICIALES
-- =========================
INSERT INTO roles (nombre, descripcion)
VALUES
('admin', 'Administrador del sistema'),
('tutor', 'Responsable o supervisor'),
('usuario', 'Usuario principal del sistema'),
('especialista', 'Perfil profesional externo')
ON CONFLICT (nombre) DO NOTHING;