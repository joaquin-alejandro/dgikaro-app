import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(), // Clerk's user ID
    nombre_completo: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("superadmin"),
      v.literal("admin"),
      v.literal("coordinacion"),
      v.literal("maestro"),
      v.literal("recepcion")
    ),
  }).index("by_token", ["tokenIdentifier"]),

  tutores: defineTable({
    nombre_padre: v.string(),
    nombre_madre: v.optional(v.string()),
    whatsapp: v.string(),
    tel_secundario: v.optional(v.string()),
    cp: v.optional(v.string()),
    colonia: v.optional(v.string()),
    id_oficial_url: v.optional(v.string()),
  }),

  alumnos: defineTable({
    tutor_id: v.optional(v.id("tutores")),
    nombre: v.string(),
    apellido_paterno: v.string(),
    apellido_materno: v.optional(v.string()),
    fecha_nacimiento: v.string(),
    grado_escolar: v.optional(v.string()),
    condicion_medica: v.optional(v.string()),
    status: v.union(v.literal("activo"), v.literal("inactivo"), v.literal("irregular")),
  }).index("by_status", ["status"]),

  talleres: defineTable({
    nombre: v.string(),
    descripcion: v.optional(v.string()),
    edad_minima: v.number(),
    activo: v.boolean(),
  }),

  maestros: defineTable({
    userId: v.id("users"),
    nombre_completo: v.string(),
    especialidad: v.string(),
    contrato_url: v.optional(v.string()),
    semblanza: v.optional(v.string()),
    curriculum_url: v.optional(v.string()),
  }),

  grupos: defineTable({
    taller_id: v.id("talleres"),
    maestro_id: v.id("maestros"),
    tipo: v.union(
      v.literal("individual"),
      v.literal("grupal"),
      v.literal("grupal_especial"),
      v.literal("duo"),
      v.literal("familiar")
    ),
    nivel: v.union(v.literal("basico"), v.literal("intermedio"), v.literal("avanzado")),
    cupo_minimo: v.number(),
    cupo_maximo: v.number(),
    activo: v.boolean(),
  }),

  sesiones_programadas: defineTable({
    grupo_id: v.id("grupos"),
    fecha: v.string(),
    hora_inicio: v.string(),
    hora_fin: v.string(),
    cupo_actual: v.number(),
    estatus: v.union(v.literal("programada"), v.literal("completada"), v.literal("cancelada")),
  }).index("by_fecha", ["fecha"]),

  inscripciones: defineTable({
    alumno_id: v.id("alumnos"),
    grupo_id: v.id("grupos"),
    modalidad: v.union(v.literal("presencial"), v.literal("online")),
    periodo_pago: v.union(v.literal("mensual"), v.literal("quincenal")),
    fecha_inscripcion: v.string(),
    estatus: v.union(v.literal("activa"), v.literal("baja"), v.literal("suspendida")),
  }),

  confirmaciones_asistencia: defineTable({
    sesion_id: v.id("sesiones_programadas"),
    alumno_id: v.id("alumnos"),
    estatus: v.union(v.literal("asistio"), v.literal("falta"), v.literal("cancelacion_valida")),
    nota: v.optional(v.string()),
  }),

  conceptos_pago: defineTable({
    nombre: v.string(),
    monto_default: v.number(),
  }),

  pagos: defineTable({
    inscripcion_id: v.optional(v.id("inscripciones")),
    concepto_id: v.id("conceptos_pago"),
    monto: v.number(),
    comprobante_url: v.optional(v.string()),
    estatus: v.union(v.literal("pendiente"), v.literal("validado"), v.literal("rechazado")),
    fecha_pago: v.string(),
    registrado_por: v.id("users"),
  }),

  becas_descuentos: defineTable({
    alumno_id: v.id("alumnos"),
    tipo: v.union(v.literal("beca"), v.literal("descuento")),
    nombre: v.string(),
    porcentaje: v.number(),
    motivo: v.optional(v.string()),
    vigencia_inicio: v.string(),
    vigencia_fin: v.string(),
    activo: v.boolean(),
    creado_por: v.id("users"),
  }),

  reembolsos: defineTable({
    pago_id: v.id("pagos"),
    monto: v.number(),
    motivo: v.string(),
    estatus: v.union(v.literal("solicitado"), v.literal("autorizado"), v.literal("rechazado")),
    solicitado_por: v.id("users"),
    autorizado_por: v.optional(v.id("users")),
    fecha_solicitud: v.string(),
    fecha_resolucion: v.optional(v.string()),
  }),

  solicitudes: defineTable({
    solicitante_id: v.id("users"),
    tipo: v.union(v.literal("permiso_ausencia"), v.literal("aviso"), v.literal("otro")),
    descripcion: v.string(),
    fecha_referencia: v.string(),
    fecha_inicio: v.optional(v.string()),
    fecha_fin: v.optional(v.string()),
    estatus: v.union(v.literal("pendiente"), v.literal("aprobada"), v.literal("rechazada")),
    resuelta_por: v.optional(v.id("users")),
  }),

  gastos: defineTable({
    monto: v.number(),
    descripcion: v.string(),
    fecha: v.string(),
    categoria_id: v.string(), // o v.id("categorias") si decides crear tabla
    comprobante_url: v.optional(v.string()),
    registrado_por: v.id("users"),
  }),
});
