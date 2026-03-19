-- =========================
-- MIND PATCH - ESQUEMA BASE MINIMO
-- =========================

-- =========================
-- TABLA: usuarios
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(150),
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'usuario',
    estado_cuenta VARCHAR(30) NOT NULL DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
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
    resultado_detallado JSONB,
    resultado_ia TEXT,
    recomendaciones_ia TEXT,
    salida_ia_json JSONB,
    modelo_ia VARCHAR(100),
    fecha_generacion_ia TIMESTAMP,
    CONSTRAINT fk_evaluaciones_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
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
-- INDICES
-- =========================
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_usuario_id ON evaluaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario_id ON sesiones_actividad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_actividad_id ON sesiones_actividad(actividad_id);
CREATE INDEX IF NOT EXISTS idx_consentimientos_usuario_id ON consentimientos(usuario_id);