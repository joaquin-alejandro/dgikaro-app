// ========================================
// D'gikaro — Mock Data Store
// Temporary in-memory data for development
// Will be replaced with Supabase queries
// ========================================

import type {
    Alumno,
    Tutor,
    User,
    Taller,
    Maestro,
    Grupo,
    Inscripcion,
    BecaDescuento,
    Pago,
    Gasto,
    CategoriaGasto,
    ConceptoPago,
    SesionProgramada,
    ConfirmacionAsistencia,
    Solicitud,
    Reembolso,
    ResumenDiario,
} from '@/lib/types/database';

// ---- Users ----
export const mockUsers: User[] = [
    {
        id: '1',
        email: 'admin@dgikaro.com',
        password_hash: '',
        role: 'superadmin',
        nombre_completo: 'Director General',
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: '2',
        email: 'gerencia@dgikaro.com',
        password_hash: '',
        role: 'admin',
        nombre_completo: 'María García López',
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: '3',
        email: 'coord@dgikaro.com',
        password_hash: '',
        role: 'coordinacion',
        nombre_completo: 'Carlos Mendoza',
        created_at: '2026-01-15T00:00:00Z',
    },
    {
        id: '4',
        email: 'maestro1@dgikaro.com',
        password_hash: '',
        role: 'maestro',
        nombre_completo: 'Ana Torres Rivera',
        created_at: '2026-02-01T00:00:00Z',
    },
    {
        id: '5',
        email: 'recepcion@dgikaro.com',
        password_hash: '',
        role: 'recepcion',
        nombre_completo: 'Laura Sánchez',
        created_at: '2026-02-01T00:00:00Z',
    },
];

// ---- Tutors ----
export const mockTutores: Tutor[] = [
    {
        id: '1',
        nombre_padre: 'Roberto Hernández',
        nombre_madre: 'Elena Martínez',
        whatsapp: '5551234567',
        tel_secundario: '5559876543',
        cp: '06600',
        colonia: 'Condesa',
        id_oficial_url: null,
        created_at: '2026-01-10T00:00:00Z',
    },
    {
        id: '2',
        nombre_padre: 'José Ramírez',
        nombre_madre: 'Patricia López',
        whatsapp: '5552345678',
        tel_secundario: null,
        cp: '03100',
        colonia: 'Del Valle',
        id_oficial_url: null,
        created_at: '2026-01-15T00:00:00Z',
    },
    {
        id: '3',
        nombre_padre: 'Fernando Díaz',
        nombre_madre: null,
        whatsapp: '5553456789',
        tel_secundario: null,
        cp: '11560',
        colonia: 'Polanco',
        id_oficial_url: null,
        created_at: '2026-02-01T00:00:00Z',
    },
];

// ---- Students ----
export const mockAlumnos: Alumno[] = [
    {
        id: '1',
        tutor_id: '1',
        nombre: 'Sofía',
        apellido_paterno: 'Hernández',
        apellido_materno: 'Martínez',
        fecha_nacimiento: '2018-05-15',
        grado_escolar: '2do Primaria',
        condicion_medica: null,
        status: 'activo',
        created_at: '2026-01-10T00:00:00Z',
    },
    {
        id: '2',
        tutor_id: '1',
        nombre: 'Diego',
        apellido_paterno: 'Hernández',
        apellido_materno: 'Martínez',
        fecha_nacimiento: '2015-08-20',
        grado_escolar: '5to Primaria',
        condicion_medica: null,
        status: 'activo',
        created_at: '2026-01-10T00:00:00Z',
    },
    {
        id: '3',
        tutor_id: '2',
        nombre: 'Valentina',
        apellido_paterno: 'Ramírez',
        apellido_materno: 'López',
        fecha_nacimiento: '2020-03-10',
        grado_escolar: 'Kinder 2',
        condicion_medica: 'Asma leve',
        status: 'activo',
        created_at: '2026-01-20T00:00:00Z',
    },
    {
        id: '4',
        tutor_id: '3',
        nombre: 'Mateo',
        apellido_paterno: 'Díaz',
        apellido_materno: null,
        fecha_nacimiento: '2012-11-03',
        grado_escolar: '1ro Secundaria',
        condicion_medica: null,
        status: 'irregular',
        created_at: '2026-02-05T00:00:00Z',
    },
    {
        id: '5',
        tutor_id: null,
        nombre: 'Camila',
        apellido_paterno: 'Morales',
        apellido_materno: 'Vega',
        fecha_nacimiento: '2000-07-22',
        grado_escolar: 'Universidad',
        condicion_medica: null,
        status: 'activo',
        created_at: '2026-02-10T00:00:00Z',
    },
];

// ---- Workshops ----
export const mockTalleres: Taller[] = [
    { id: '1', nombre: 'Pintura', descripcion: 'Técnicas de pintura acrílica y óleo', edad_minima: 3, activo: true },
    { id: '2', nombre: 'Iniciación Musical', descripcion: 'Introducción a la música y ritmo', edad_minima: 3, activo: true },
    { id: '3', nombre: 'Canto', descripcion: 'Técnica vocal y repertorio', edad_minima: 5, activo: true },
    { id: '4', nombre: 'Guitarra', descripcion: 'Guitarra clásica y popular', edad_minima: 5, activo: true },
    { id: '5', nombre: 'Piano', descripcion: 'Piano clásico y moderno', edad_minima: 5, activo: true },
    { id: '6', nombre: 'Dibujo', descripcion: 'Dibujo artístico y técnico', edad_minima: 5, activo: true },
    { id: '7', nombre: 'Inglés', descripcion: 'Idioma inglés todos los niveles', edad_minima: 5, activo: true },
    { id: '8', nombre: 'Francés', descripcion: 'Idioma francés todos los niveles', edad_minima: 5, activo: true },
    { id: '9', nombre: 'Danza', descripcion: 'Danza contemporánea y folclórica', edad_minima: 5, activo: true },
    { id: '10', nombre: 'Teatro', descripcion: 'Actuación y expresión corporal', edad_minima: 5, activo: true },
];

// ---- Teachers ----
export const mockMaestros: Maestro[] = [
    {
        id: '1',
        user_id: '4',
        nombre_completo: 'Ana Torres Rivera',
        especialidad: 'Pintura y Dibujo',
        contrato_url: null,
        semblanza: 'Artista plástica con 10 años de experiencia docente',
        curriculum_url: null,
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: '2',
        user_id: '',
        nombre_completo: 'Roberto Castillo',
        especialidad: 'Música (Piano, Guitarra)',
        contrato_url: null,
        semblanza: 'Músico profesional egresado del Conservatorio',
        curriculum_url: null,
        created_at: '2026-01-01T00:00:00Z',
    },
    {
        id: '3',
        user_id: '',
        nombre_completo: 'Isabel Moreno',
        especialidad: 'Canto e Iniciación Musical',
        contrato_url: null,
        semblanza: 'Soprano con experiencia en enseñanza infantil',
        curriculum_url: null,
        created_at: '2026-01-15T00:00:00Z',
    },
];

// ---- Groups ----
export const mockGrupos: Grupo[] = [
    {
        id: '1',
        taller_id: '1',
        maestro_id: '1',
        tipo: 'grupal',
        nivel: 'basico',
        cupo_minimo: 2,
        cupo_maximo: 5,
        activo: true,
    },
    {
        id: '2',
        taller_id: '3',
        maestro_id: '3',
        tipo: 'individual',
        nivel: 'basico',
        cupo_minimo: 1,
        cupo_maximo: 1,
        activo: true,
    },
    {
        id: '3',
        taller_id: '5',
        maestro_id: '2',
        tipo: 'duo',
        nivel: 'intermedio',
        cupo_minimo: 2,
        cupo_maximo: 2,
        activo: true,
    },
];

// ---- Payment concepts ----
export const mockConceptosPago: ConceptoPago[] = [
    { id: '1', nombre: 'inscripcion_anual', monto_default: 25000 },
    { id: '2', nombre: 'mensualidad', monto_default: 0 },
    { id: '3', nombre: 'reinscripcion', monto_default: 25000 },
    { id: '4', nombre: 'multa', monto_default: 0 },
    { id: '5', nombre: 'material', monto_default: 0 },
];

// ---- Expense categories ----
export const mockCategoriasGastos: CategoriaGasto[] = [
    { id: '1', nombre: 'Materiales' },
    { id: '2', nombre: 'Servicios' },
    { id: '3', nombre: 'Nómina' },
    { id: '4', nombre: 'Mantenimiento' },
    { id: '5', nombre: 'Marketing' },
    { id: '6', nombre: 'Otros' },
];

// Empty arrays for modules not yet populated
export const mockInscripciones: Inscripcion[] = [];
export const mockPagos: Pago[] = [];
export const mockGastos: Gasto[] = [];
export const mockBecasDescuentos: BecaDescuento[] = [];
export const mockSesiones: SesionProgramada[] = [];
export const mockAsistencias: ConfirmacionAsistencia[] = [];
export const mockSolicitudes: Solicitud[] = [];
export const mockReembolsos: Reembolso[] = [];
export const mockResumenesDiarios: ResumenDiario[] = [];
