// ========================================
// D'gikaro — Business Rules Helpers
// ========================================

import { differenceInYears, differenceInDays, format } from 'date-fns';

/**
 * Calculate age from date of birth
 */
export function calcularEdad(fechaNacimiento: string | Date): number {
    const fecha = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;
    return differenceInYears(new Date(), fecha);
}

/**
 * Rule 1: Validate enrollment age restrictions
 * - Under 3: Cannot enroll
 * - 3-4: Only Pintura or Iniciación Musical
 * - 5+: Any workshop
 */
export function validarEdadInscripcion(fechaNacimiento: string, tallerNombre?: string): {
    valido: boolean;
    mensaje?: string;
} {
    const edad = calcularEdad(fechaNacimiento);

    if (edad < 3) {
        return {
            valido: false,
            mensaje: `El alumno tiene ${edad} año(s). La edad mínima para inscripción es 3 años cumplidos.`,
        };
    }

    if (edad < 5 && tallerNombre) {
        const talleresPermitidos = ['pintura', 'iniciación musical', 'iniciacion musical'];
        if (!talleresPermitidos.includes(tallerNombre.toLowerCase())) {
            return {
                valido: false,
                mensaje: `Los alumnos de ${edad} años solo pueden inscribirse a Pintura o Iniciación Musical.`,
            };
        }
    }

    return { valido: true };
}

/**
 * Rule 2: Check if tutor is required (minors under 18)
 */
export function requiereTutor(fechaNacimiento: string): boolean {
    return calcularEdad(fechaNacimiento) < 18;
}

/**
 * Rule 3: Check if re-enrollment fee applies (gap > 60 days)
 */
export function requiereReinscripcion(ultimoPago: string | null): boolean {
    if (!ultimoPago) return true;
    const dias = differenceInDays(new Date(), new Date(ultimoPago));
    return dias > 60;
}

/**
 * Rule 10: Calculate late payment fee (10%)
 */
export function calcularMulta(montoAdeudado: number): number {
    return Math.round(montoAdeudado * 0.10);
}

/**
 * Format amount from centavos to MXN display
 */
export function formatMonto(centavos: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(centavos / 100);
}

/**
 * Format date for display
 */
export function formatFecha(fecha: string): string {
    return format(new Date(fecha), 'dd/MM/yyyy');
}

/**
 * Get student full name
 */
export function nombreCompleto(nombre: string, apellidoPaterno: string, apellidoMaterno?: string | null): string {
    return [nombre, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ');
}

/**
 * Group type labels
 */
export const GRUPO_TIPO_LABELS: Record<string, string> = {
    individual: 'Individual',
    grupal: 'Grupal',
    grupal_especial: 'Grupal Especial',
    duo: 'Duo',
    familiar: 'Familiar',
};

/**
 * Role labels
 */
export const ROLE_LABELS: Record<string, string> = {
    superadmin: 'Dirección',
    admin: 'Gerencia',
    coordinacion: 'Coordinación',
    maestro: 'Maestro',
    recepcion: 'Recepción',
};

/**
 * Status badge class mapping
 */
export const STATUS_BADGE: Record<string, string> = {
    activo: 'badge-success',
    inactivo: 'badge-neutral',
    irregular: 'badge-warning',
    activa: 'badge-success',
    baja: 'badge-danger',
    suspendida: 'badge-warning',
    pendiente: 'badge-warning',
    validado: 'badge-success',
    rechazado: 'badge-danger',
    solicitado: 'badge-info',
    autorizado: 'badge-success',
    aprobada: 'badge-success',
    rechazada: 'badge-danger',
    programada: 'badge-info',
    completada: 'badge-success',
    cancelada: 'badge-neutral',
    asistio: 'badge-success',
    falta: 'badge-danger',
    cancelacion_valida: 'badge-warning',
};

/**
 * Status label translations
 */
export const STATUS_LABELS: Record<string, string> = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    irregular: 'Irregular',
    activa: 'Activa',
    baja: 'Baja',
    suspendida: 'Suspendida',
    pendiente: 'Pendiente',
    validado: 'Validado',
    rechazado: 'Rechazado',
    solicitado: 'Solicitado',
    autorizado: 'Autorizado',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada',
    programada: 'Programada',
    completada: 'Completada',
    cancelada: 'Cancelada',
    asistio: 'Asistió',
    falta: 'Falta',
    cancelacion_valida: 'Cancelación válida',
};
