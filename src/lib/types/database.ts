// ========================================
// D'gikaro — Database Types
// ========================================

// ---------- Enums ----------

export type UserRole = 'superadmin' | 'admin' | 'coordinacion' | 'maestro' | 'recepcion';

export type AlumnoStatus = 'activo' | 'inactivo' | 'irregular';

export type GrupoTipo = 'individual' | 'grupal' | 'grupal_especial' | 'duo' | 'familiar';

export type NivelGrupo = 'basico' | 'intermedio' | 'avanzado';

export type SesionEstatus = 'programada' | 'completada' | 'cancelada';

export type InscripcionModalidad = 'presencial' | 'online';

export type PeriodoPago = 'mensual' | 'quincenal';

export type InscripcionEstatus = 'activa' | 'baja' | 'suspendida';

export type AsistenciaEstatus = 'asistio' | 'falta' | 'cancelacion_valida';

export type PagoEstatus = 'pendiente' | 'validado' | 'rechazado';

export type BecaTipo = 'beca' | 'descuento';

export type ReembolsoEstatus = 'solicitado' | 'autorizado' | 'rechazado';

export type SolicitudTipo = 'permiso_ausencia' | 'aviso' | 'otro';

export type SolicitudEstatus = 'pendiente' | 'aprobada' | 'rechazada';

// ---------- Tables ----------

export interface User {
    id: string;
    email: string;
    password_hash: string;
    role: UserRole;
    nombre_completo: string;
    created_at: string;
}

export interface Tutor {
    id: string;
    nombre_padre: string;
    nombre_madre: string | null;
    whatsapp: string;
    tel_secundario: string | null;
    cp: string | null;
    colonia: string | null;
    id_oficial_url: string | null;
    created_at: string;
}

export interface Alumno {
    id: string;
    tutor_id: string | null;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    fecha_nacimiento: string; // ISO date
    grado_escolar: string | null;
    condicion_medica: string | null;
    status: AlumnoStatus;
    created_at: string;
    // Relations
    tutor?: Tutor;
}

export interface Taller {
    id: string;
    nombre: string;
    descripcion: string | null;
    edad_minima: number; // default 5
    activo: boolean;
}

export interface Maestro {
    id: string;
    user_id: string;
    nombre_completo: string;
    especialidad: string;
    contrato_url: string | null;
    semblanza: string | null;
    curriculum_url: string | null;
    created_at: string;
    // Relations
    user?: User;
}

export interface DisponibilidadMaestro {
    id: string;
    maestro_id: string;
    dia_semana: number; // 0=Dom..6=Sab
    hora_inicio: string; // HH:MM
    hora_fin: string; // HH:MM
}

export interface Grupo {
    id: string;
    taller_id: string;
    maestro_id: string;
    tipo: GrupoTipo;
    nivel: NivelGrupo;
    cupo_minimo: number;
    cupo_maximo: number;
    activo: boolean;
    // Relations
    taller?: Taller;
    maestro?: Maestro;
}

export interface SesionProgramada {
    id: string;
    grupo_id: string;
    fecha: string; // ISO date
    hora_inicio: string; // HH:MM
    hora_fin: string; // HH:MM
    cupo_actual: number;
    estatus: SesionEstatus;
    // Relations
    grupo?: Grupo;
}

export interface Inscripcion {
    id: string;
    alumno_id: string;
    grupo_id: string;
    modalidad: InscripcionModalidad;
    periodo_pago: PeriodoPago;
    fecha_inscripcion: string; // ISO date
    estatus: InscripcionEstatus;
    // Relations
    alumno?: Alumno;
    grupo?: Grupo;
}

export interface ConfirmacionAsistencia {
    id: string;
    sesion_id: string;
    alumno_id: string;
    estatus: AsistenciaEstatus;
    nota: string | null;
    created_at: string;
    // Relations
    sesion?: SesionProgramada;
    alumno?: Alumno;
}

export interface ConceptoPago {
    id: string;
    nombre: string;
    monto_default: number; // centavos
}

export interface Pago {
    id: string;
    inscripcion_id: string;
    concepto_id: string;
    monto: number; // centavos
    comprobante_url: string | null;
    estatus: PagoEstatus;
    fecha_pago: string; // ISO date
    registrado_por: string;
    // Relations
    inscripcion?: Inscripcion;
    concepto?: ConceptoPago;
    registrador?: User;
}

export interface BecaDescuento {
    id: string;
    alumno_id: string;
    tipo: BecaTipo;
    nombre: string;
    porcentaje: number; // 0-100
    motivo: string | null;
    vigencia_inicio: string; // ISO date
    vigencia_fin: string; // ISO date
    activo: boolean;
    creado_por: string;
    // Relations
    alumno?: Alumno;
}

export interface Reembolso {
    id: string;
    pago_id: string;
    monto: number; // centavos
    motivo: string;
    estatus: ReembolsoEstatus;
    solicitado_por: string;
    autorizado_por: string | null;
    fecha_solicitud: string;
    fecha_resolucion: string | null;
    // Relations
    pago?: Pago;
}

export interface Solicitud {
    id: string;
    solicitante_id: string;
    tipo: SolicitudTipo;
    descripcion: string;
    fecha_referencia: string; // ISO date
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    estatus: SolicitudEstatus;
    resuelta_por: string | null;
    created_at: string;
    // Relations
    solicitante?: User;
}

export interface CategoriaGasto {
    id: string;
    nombre: string;
}

export interface Gasto {
    id: string;
    monto: number; // centavos
    descripcion: string;
    fecha: string; // ISO date
    categoria_id: string;
    comprobante_url: string | null;
    registrado_por: string;
    // Relations
    categoria?: CategoriaGasto;
    registrador?: User;
}

export interface ResumenDiario {
    id: string;
    fecha: string; // ISO date
    total_ingresos: number; // centavos
    total_egresos: number; // centavos
    balance: number; // centavos
    cerrado_por: string;
    created_at: string;
}

// ---------- Utility Types ----------

export type InsertType<T> = Omit<T, 'id' | 'created_at'>;
export type UpdateType<T> = Partial<Omit<T, 'id' | 'created_at'>>;

// ---------- Auth Types ----------

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    nombre_completo: string;
}

// ---------- UI Helpers ----------

export interface NavItem {
    label: string;
    href: string;
    icon: string;
    roles: UserRole[];
    children?: NavItem[];
}
