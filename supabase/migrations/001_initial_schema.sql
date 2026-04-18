-- ========================================
-- D'gikaro — Full Database Schema
-- Run this migration in your Supabase SQL Editor
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- A. Módulo de Personas
-- ========================================

-- Users (managed via Supabase Auth + custom profile)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'coordinacion', 'maestro', 'recepcion')) DEFAULT 'recepcion',
  nombre_completo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tutores
CREATE TABLE IF NOT EXISTS tutores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_padre TEXT NOT NULL,
  nombre_madre TEXT,
  whatsapp TEXT NOT NULL,
  tel_secundario TEXT,
  cp TEXT,
  colonia TEXT,
  id_oficial_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Alumnos
CREATE TABLE IF NOT EXISTS alumnos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES tutores(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  apellido_paterno TEXT NOT NULL,
  apellido_materno TEXT,
  fecha_nacimiento DATE NOT NULL,
  grado_escolar TEXT,
  condicion_medica TEXT,
  status TEXT NOT NULL CHECK (status IN ('activo', 'inactivo', 'irregular')) DEFAULT 'activo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alumnos_tutor ON alumnos(tutor_id);
CREATE INDEX idx_alumnos_status ON alumnos(status);

-- ========================================
-- B. Módulo Académico
-- ========================================

-- Talleres (catálogo)
CREATE TABLE IF NOT EXISTS talleres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  edad_minima INT NOT NULL DEFAULT 5,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Maestros
CREATE TABLE IF NOT EXISTS maestros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  nombre_completo TEXT NOT NULL,
  especialidad TEXT NOT NULL,
  contrato_url TEXT,
  semblanza TEXT,
  curriculum_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maestros_user ON maestros(user_id);

-- Disponibilidad de maestros
CREATE TABLE IF NOT EXISTS disponibilidad_maestros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maestro_id UUID NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  dia_semana INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  CONSTRAINT check_horario CHECK (hora_fin > hora_inicio)
);

CREATE INDEX idx_disponibilidad_maestro ON disponibilidad_maestros(maestro_id);

-- Grupos
CREATE TABLE IF NOT EXISTS grupos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  taller_id UUID NOT NULL REFERENCES talleres(id) ON DELETE CASCADE,
  maestro_id UUID NOT NULL REFERENCES maestros(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('individual', 'grupal', 'grupal_especial', 'duo', 'familiar')) DEFAULT 'grupal',
  nivel TEXT NOT NULL CHECK (nivel IN ('basico', 'intermedio', 'avanzado')) DEFAULT 'basico',
  cupo_minimo INT NOT NULL DEFAULT 1,
  cupo_maximo INT NOT NULL DEFAULT 5,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_grupos_taller ON grupos(taller_id);
CREATE INDEX idx_grupos_maestro ON grupos(maestro_id);

-- Sesiones programadas (calendario)
CREATE TABLE IF NOT EXISTS sesiones_programadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  cupo_actual INT NOT NULL DEFAULT 0,
  estatus TEXT NOT NULL CHECK (estatus IN ('programada', 'completada', 'cancelada')) DEFAULT 'programada'
);

CREATE INDEX idx_sesiones_grupo ON sesiones_programadas(grupo_id);
CREATE INDEX idx_sesiones_fecha ON sesiones_programadas(fecha);

-- ========================================
-- C. Módulo Operativo
-- ========================================

-- Inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  modalidad TEXT NOT NULL CHECK (modalidad IN ('presencial', 'online')) DEFAULT 'presencial',
  periodo_pago TEXT NOT NULL CHECK (periodo_pago IN ('mensual', 'quincenal')) DEFAULT 'mensual',
  fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
  estatus TEXT NOT NULL CHECK (estatus IN ('activa', 'baja', 'suspendida')) DEFAULT 'activa',
  UNIQUE(alumno_id, grupo_id)
);

CREATE INDEX idx_inscripciones_alumno ON inscripciones(alumno_id);
CREATE INDEX idx_inscripciones_grupo ON inscripciones(grupo_id);

-- Confirmaciones de asistencia
CREATE TABLE IF NOT EXISTS confirmaciones_asistencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sesion_id UUID NOT NULL REFERENCES sesiones_programadas(id) ON DELETE CASCADE,
  alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  estatus TEXT NOT NULL CHECK (estatus IN ('asistio', 'falta', 'cancelacion_valida')) DEFAULT 'asistio',
  nota TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(sesion_id, alumno_id)
);

CREATE INDEX idx_asistencia_sesion ON confirmaciones_asistencia(sesion_id);
CREATE INDEX idx_asistencia_alumno ON confirmaciones_asistencia(alumno_id);

-- Solicitudes (permisos de falta, avisos)
CREATE TABLE IF NOT EXISTS solicitudes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solicitante_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('permiso_ausencia', 'aviso', 'otro')),
  descripcion TEXT NOT NULL,
  fecha_referencia DATE NOT NULL,
  estatus TEXT NOT NULL CHECK (estatus IN ('pendiente', 'aprobada', 'rechazada')) DEFAULT 'pendiente',
  resuelta_por UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_solicitudes_solicitante ON solicitudes(solicitante_id);
CREATE INDEX idx_solicitudes_estatus ON solicitudes(estatus);

-- ========================================
-- D. Módulo Financiero
-- ========================================

-- Conceptos de pago
CREATE TABLE IF NOT EXISTS conceptos_pago (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  monto_default INT NOT NULL DEFAULT 0 -- centavos
);

-- Pagos (ingresos)
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inscripcion_id UUID REFERENCES inscripciones(id) ON DELETE SET NULL,
  concepto_id UUID NOT NULL REFERENCES conceptos_pago(id),
  monto INT NOT NULL, -- centavos
  comprobante_url TEXT,
  estatus TEXT NOT NULL CHECK (estatus IN ('pendiente', 'validado', 'rechazado')) DEFAULT 'pendiente',
  fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
  registrado_por UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_pagos_inscripcion ON pagos(inscripcion_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);

-- Becas y descuentos
CREATE TABLE IF NOT EXISTS becas_descuentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('beca', 'descuento')),
  nombre TEXT NOT NULL,
  porcentaje INT NOT NULL CHECK (porcentaje BETWEEN 0 AND 100),
  motivo TEXT,
  vigencia_inicio DATE NOT NULL,
  vigencia_fin DATE NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_por UUID NOT NULL REFERENCES users(id),
  CONSTRAINT check_vigencia CHECK (vigencia_fin >= vigencia_inicio)
);

CREATE INDEX idx_becas_alumno ON becas_descuentos(alumno_id);

-- Reembolsos
CREATE TABLE IF NOT EXISTS reembolsos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pago_id UUID NOT NULL REFERENCES pagos(id) ON DELETE CASCADE,
  monto INT NOT NULL, -- centavos
  motivo TEXT NOT NULL,
  estatus TEXT NOT NULL CHECK (estatus IN ('solicitado', 'autorizado', 'rechazado')) DEFAULT 'solicitado',
  solicitado_por UUID NOT NULL REFERENCES users(id),
  autorizado_por UUID REFERENCES users(id),
  fecha_solicitud TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_resolucion TIMESTAMPTZ
);

CREATE INDEX idx_reembolsos_pago ON reembolsos(pago_id);
CREATE INDEX idx_reembolsos_estatus ON reembolsos(estatus);

-- Categorías de gastos
CREATE TABLE IF NOT EXISTS categorias_gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL
);

-- Gastos (egresos)
CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monto INT NOT NULL, -- centavos
  descripcion TEXT NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria_id UUID NOT NULL REFERENCES categorias_gastos(id),
  comprobante_url TEXT,
  registrado_por UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_gastos_fecha ON gastos(fecha);
CREATE INDEX idx_gastos_categoria ON gastos(categoria_id);

-- Resumen diario (cierre de caja)
CREATE TABLE IF NOT EXISTS resumen_diario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE UNIQUE NOT NULL,
  total_ingresos INT NOT NULL DEFAULT 0, -- centavos
  total_egresos INT NOT NULL DEFAULT 0, -- centavos
  balance INT NOT NULL DEFAULT 0, -- centavos
  cerrado_por UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resumen_fecha ON resumen_diario(fecha);

-- ========================================
-- E. Seed Data
-- ========================================

-- Default payment concepts
INSERT INTO conceptos_pago (nombre, monto_default) VALUES
  ('inscripcion_anual', 25000),     -- $250.00
  ('mensualidad', 0),               -- Variable by group type
  ('reinscripcion', 25000),         -- $250.00
  ('multa', 0),                     -- 10% calculated
  ('material', 0)                   -- Variable
ON CONFLICT (nombre) DO NOTHING;

-- Default expense categories
INSERT INTO categorias_gastos (nombre) VALUES
  ('Materiales'),
  ('Servicios'),
  ('Nómina'),
  ('Mantenimiento'),
  ('Marketing'),
  ('Otros')
ON CONFLICT (nombre) DO NOTHING;

-- Default superadmin user (change password after first login!)
INSERT INTO users (email, role, nombre_completo) VALUES
  ('admin@dgikaro.com', 'superadmin', 'Administrador D''gikaro')
ON CONFLICT (email) DO NOTHING;
