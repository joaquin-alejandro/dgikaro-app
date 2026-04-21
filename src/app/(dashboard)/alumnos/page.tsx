'use client';

import { useState, useMemo } from 'react';
import { mockAlumnos, mockTutores } from '@/lib/data/mock-data';
import { calcularEdad, nombreCompleto, formatFecha, STATUS_BADGE, STATUS_LABELS } from '@/lib/utils/business-rules';
import type { Alumno, AlumnoStatus } from '@/lib/types/database';
import '../shared.css';

export default function AlumnosPage() {
    const [alumnos, setAlumnos] = useState<Alumno[]>(mockAlumnos);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<AlumnoStatus | 'todos'>('todos');
    const [showModal, setShowModal] = useState(false);
    const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        fecha_nacimiento: '',
        grado_escolar: '',
        condicion_medica: '',
        tutor_id: '',
        status: 'activo' as AlumnoStatus,
    });
    const [formError, setFormError] = useState('');

    // Filtered students
    const filtered = useMemo(() => {
        return alumnos.filter(a => {
            const name = nombreCompleto(a.nombre, a.apellido_paterno, a.apellido_materno).toLowerCase();
            const matchSearch = name.includes(search.toLowerCase());
            const matchStatus = statusFilter === 'todos' || a.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [alumnos, search, statusFilter]);

    const openCreate = () => {
        setEditingAlumno(null);
        setFormData({
            nombre: '',
            apellido_paterno: '',
            apellido_materno: '',
            fecha_nacimiento: '',
            grado_escolar: '',
            condicion_medica: '',
            tutor_id: '',
            status: 'activo',
        });
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (alumno: Alumno) => {
        setEditingAlumno(alumno);
        setFormData({
            nombre: alumno.nombre,
            apellido_paterno: alumno.apellido_paterno,
            apellido_materno: alumno.apellido_materno || '',
            fecha_nacimiento: alumno.fecha_nacimiento,
            grado_escolar: alumno.grado_escolar || '',
            condicion_medica: alumno.condicion_medica || '',
            tutor_id: alumno.tutor_id || '',
            status: alumno.status,
        });
        setFormError('');
        setShowModal(true);
    };

    const handleSave = () => {
        // Validate required fields
        if (!formData.nombre || !formData.apellido_paterno || !formData.fecha_nacimiento) {
            setFormError('Nombre, apellido paterno y fecha de nacimiento son obligatorios.');
            return;
        }

        // Rule 1: Age >= 3
        const edad = calcularEdad(formData.fecha_nacimiento);
        if (edad < 3) {
            setFormError(`El alumno tiene ${edad} año(s). La edad mínima para registro es 3 años cumplidos.`);
            return;
        }

        // Rule 2: Tutor required for minors
        if (edad < 18 && !formData.tutor_id) {
            setFormError('Los alumnos menores de 18 años requieren un tutor asociado.');
            return;
        }

        if (editingAlumno) {
            // Update
            setAlumnos(prev => prev.map(a =>
                a.id === editingAlumno.id
                    ? {
                        ...a,
                        nombre: formData.nombre,
                        apellido_paterno: formData.apellido_paterno,
                        apellido_materno: formData.apellido_materno || null,
                        fecha_nacimiento: formData.fecha_nacimiento,
                        grado_escolar: formData.grado_escolar || null,
                        condicion_medica: formData.condicion_medica || null,
                        tutor_id: formData.tutor_id || null,
                        status: formData.status,
                    }
                    : a
            ));
        } else {
            // Create
            const newAlumno: Alumno = {
                id: String(Date.now()),
                nombre: formData.nombre,
                apellido_paterno: formData.apellido_paterno,
                apellido_materno: formData.apellido_materno || null,
                fecha_nacimiento: formData.fecha_nacimiento,
                grado_escolar: formData.grado_escolar || null,
                condicion_medica: formData.condicion_medica || null,
                tutor_id: formData.tutor_id || null,
                status: formData.status,
                created_at: new Date().toISOString(),
            };
            setAlumnos(prev => [...prev, newAlumno]);
        }

        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este alumno?')) {
            setAlumnos(prev => prev.filter(a => a.id !== id));
        }
    };

    const getTutorName = (tutorId: string | null) => {
        if (!tutorId) return '—';
        const tutor = mockTutores.find(t => t.id === tutorId);
        return tutor ? tutor.nombre_padre : '—';
    };

    const countByStatus = (status: AlumnoStatus) => alumnos.filter(a => a.status === status).length;

    return (
        <>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Alumnos</h1>
                    <p className="page-subtitle">Gestión de alumnos registrados</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    + Nuevo Alumno
                </button>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card">
                    <div className="stat-value">{alumnos.length}</div>
                    <div className="stat-label">Total</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>{countByStatus('activo')}</div>
                    <div className="stat-label">Activos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{countByStatus('irregular')}</div>
                    <div className="stat-label">Irregulares</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-text-muted)' }}>{countByStatus('inactivo')}</div>
                    <div className="stat-label">Inactivos</div>
                </div>
            </div>

            {/* Filters */}
            <div className="alumnos-filters">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="alumnos-search"
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value as AlumnoStatus | 'todos')}
                >
                    <option value="todos">Todos los estatus</option>
                    <option value="activo">Activos</option>
                    <option value="irregular">Irregulares</option>
                    <option value="inactivo">Inactivos</option>
                </select>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Alumno</th>
                            <th>Edad</th>
                            <th>Tutor</th>
                            <th>Grado</th>
                            <th>Estatus</th>
                            <th>Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                        <div className="empty-icon">🎓</div>
                                        <div className="empty-title">Sin alumnos encontrados</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(alumno => (
                                <tr key={alumno.id}>
                                    <td>
                                        <div className="student-name-cell">
                                            <span className="student-name">
                                                {nombreCompleto(alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno)}
                                            </span>
                                            {alumno.condicion_medica && (
                                                <span className="student-meta">⚕️ {alumno.condicion_medica}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{calcularEdad(alumno.fecha_nacimiento)} años</td>
                                    <td>{getTutorName(alumno.tutor_id)}</td>
                                    <td>{alumno.grado_escolar || '—'}</td>
                                    <td>
                                        <span className={`badge ${STATUS_BADGE[alumno.status]}`}>
                                            {STATUS_LABELS[alumno.status]}
                                        </span>
                                    </td>
                                    <td>{formatFecha(alumno.created_at)}</td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(alumno)}>
                                                ✏️
                                            </button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(alumno.id)}>
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingAlumno ? 'Editar Alumno' : 'Nuevo Alumno'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {formError && (
                            <div className="form-alert form-alert-danger">⚠️ {formError}</div>
                        )}

                        {/* Age warning */}
                        {formData.fecha_nacimiento && calcularEdad(formData.fecha_nacimiento) < 5 && calcularEdad(formData.fecha_nacimiento) >= 3 && (
                            <div className="form-alert form-alert-warning">
                                ℹ️ Alumno de {calcularEdad(formData.fecha_nacimiento)} años — solo puede inscribirse a Pintura o Iniciación Musical.
                            </div>
                        )}

                        {/* Tutor warning */}
                        {formData.fecha_nacimiento && calcularEdad(formData.fecha_nacimiento) < 18 && !formData.tutor_id && (
                            <div className="form-alert form-alert-info">
                                👨‍👩‍👧 Alumno menor de edad — se requiere tutor.
                            </div>
                        )}

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Nombre *</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={formData.nombre}
                                    onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))}
                                    placeholder="Nombre"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Apellido Paterno *</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={formData.apellido_paterno}
                                    onChange={e => setFormData(p => ({ ...p, apellido_paterno: e.target.value }))}
                                    placeholder="Apellido Paterno"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Apellido Materno</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={formData.apellido_materno}
                                    onChange={e => setFormData(p => ({ ...p, apellido_materno: e.target.value }))}
                                    placeholder="Apellido Materno"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Fecha de Nacimiento *</label>
                                <input
                                    className="form-input"
                                    type="date"
                                    value={formData.fecha_nacimiento}
                                    onChange={e => setFormData(p => ({ ...p, fecha_nacimiento: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Grado Escolar</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={formData.grado_escolar}
                                    onChange={e => setFormData(p => ({ ...p, grado_escolar: e.target.value }))}
                                    placeholder="Ej: 3ro Primaria"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tutor {formData.fecha_nacimiento && calcularEdad(formData.fecha_nacimiento) < 18 ? '*' : ''}</label>
                                <select
                                    className="form-select"
                                    value={formData.tutor_id}
                                    onChange={e => setFormData(p => ({ ...p, tutor_id: e.target.value }))}
                                >
                                    <option value="">Sin tutor</option>
                                    {mockTutores.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.nombre_padre} {t.nombre_madre ? `/ ${t.nombre_madre}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Condición Médica</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.condicion_medica}
                                    onChange={e => setFormData(p => ({ ...p, condicion_medica: e.target.value }))}
                                    placeholder="Alergias, condiciones, medicamentos..."
                                    rows={2}
                                />
                            </div>

                            {editingAlumno && (
                                <div className="form-group">
                                    <label className="form-label">Estatus</label>
                                    <select
                                        className="form-select"
                                        value={formData.status}
                                        onChange={e => setFormData(p => ({ ...p, status: e.target.value as AlumnoStatus }))}
                                    >
                                        <option value="activo">Activo</option>
                                        <option value="irregular">Irregular</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                Cancelar
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editingAlumno ? 'Guardar Cambios' : 'Registrar Alumno'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
