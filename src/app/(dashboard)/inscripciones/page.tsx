'use client';

import { useState, useMemo } from 'react';
import { mockAlumnos, mockGrupos, mockTalleres, mockMaestros, mockInscripciones } from '@/lib/data/mock-data';
import { calcularEdad, validarEdadInscripcion, nombreCompleto, formatFecha, GRUPO_TIPO_LABELS, STATUS_BADGE, STATUS_LABELS } from '@/lib/utils/business-rules';
import type { Inscripcion, InscripcionEstatus, InscripcionModalidad, PeriodoPago } from '@/lib/types/database';
import '../shared.css';

export default function InscripcionesPage() {
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>(mockInscripciones);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<InscripcionEstatus | 'todos'>('todos');
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        alumno_id: '',
        grupo_id: '',
        modalidad: 'presencial' as InscripcionModalidad,
        periodo_pago: 'mensual' as PeriodoPago,
    });
    const [formError, setFormError] = useState('');
    const [formWarning, setFormWarning] = useState('');

    const getTallerForGroup = (grupoId: string) => {
        const grupo = mockGrupos.find(g => g.id === grupoId);
        if (!grupo) return null;
        return mockTalleres.find(t => t.id === grupo.taller_id);
    };

    const filtered = useMemo(() => {
        return inscripciones.filter(i => {
            const alumno = mockAlumnos.find(a => a.id === i.alumno_id);
            const name = alumno ? nombreCompleto(alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno).toLowerCase() : '';
            const matchSearch = name.includes(search.toLowerCase());
            const matchStatus = statusFilter === 'todos' || i.estatus === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [inscripciones, search, statusFilter]);

    const handleAlumnoChange = (alumnoId: string) => {
        setFormData(p => ({ ...p, alumno_id: alumnoId }));
        setFormError('');
        setFormWarning('');

        const alumno = mockAlumnos.find(a => a.id === alumnoId);
        if (alumno) {
            const edad = calcularEdad(alumno.fecha_nacimiento);
            if (edad < 5 && edad >= 3) {
                setFormWarning(`Alumno de ${edad} años: solo puede inscribirse a Pintura o Iniciación Musical.`);
            }
            if (alumno.status === 'irregular') {
                setFormWarning('⚠️ Alumno irregular: solo puede inscribirse a clases GRUPALES.');
            }
        }
    };

    const handleSave = () => {
        if (!formData.alumno_id || !formData.grupo_id) {
            setFormError('Selecciona un alumno y un grupo.');
            return;
        }

        // Check duplicate enrollment
        if (inscripciones.some(i => i.alumno_id === formData.alumno_id && i.grupo_id === formData.grupo_id && i.estatus === 'activa')) {
            setFormError('Este alumno ya está inscrito en este grupo.');
            return;
        }

        const alumno = mockAlumnos.find(a => a.id === formData.alumno_id);
        const grupo = mockGrupos.find(g => g.id === formData.grupo_id);
        const taller = grupo ? mockTalleres.find(t => t.id === grupo.taller_id) : null;

        if (!alumno || !grupo || !taller) { setFormError('Datos inválidos.'); return; }

        // Rule 1: Age validation
        const ageCheck = validarEdadInscripcion(alumno.fecha_nacimiento, taller.nombre);
        if (!ageCheck.valido) { setFormError(ageCheck.mensaje!); return; }

        // Rule 6: Irregular student → only grupal
        if (alumno.status === 'irregular' && !['grupal', 'grupal_especial', 'familiar'].includes(grupo.tipo)) {
            setFormError('Alumno irregular: solo puede inscribirse a clases grupales.');
            return;
        }

        // Rule 4: Capacity check
        const currentEnrolled = inscripciones.filter(i => i.grupo_id === grupo.id && i.estatus === 'activa').length;
        if (currentEnrolled >= grupo.cupo_maximo) {
            setFormError(`Grupo lleno (${currentEnrolled}/${grupo.cupo_maximo}). No hay cupo disponible.`);
            return;
        }

        const newInscripcion: Inscripcion = {
            id: String(Date.now()),
            alumno_id: formData.alumno_id,
            grupo_id: formData.grupo_id,
            modalidad: formData.modalidad,
            periodo_pago: formData.periodo_pago,
            fecha_inscripcion: new Date().toISOString().split('T')[0],
            estatus: 'activa',
        };

        setInscripciones(prev => [...prev, newInscripcion]);
        setShowModal(false);
    };

    const handleBaja = (id: string) => {
        if (confirm('¿Dar de baja esta inscripción?')) {
            setInscripciones(prev => prev.map(i => i.id === id ? { ...i, estatus: 'baja' as InscripcionEstatus } : i));
        }
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Inscripciones</h1>
                    <p className="page-subtitle">Registro de alumnos en talleres y grupos</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setFormData({ alumno_id: '', grupo_id: '', modalidad: 'presencial', periodo_pago: 'mensual' }); setFormError(''); setFormWarning(''); setShowModal(true); }}>
                    + Nueva Inscripción
                </button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card"><div className="stat-value">{inscripciones.length}</div><div className="stat-label">Total</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>{inscripciones.filter(i => i.estatus === 'activa').length}</div><div className="stat-label">Activas</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-danger)' }}>{inscripciones.filter(i => i.estatus === 'baja').length}</div><div className="stat-label">Bajas</div></div>
            </div>

            <div className="alumnos-filters">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input className="alumnos-search" placeholder="Buscar por alumno..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as InscripcionEstatus | 'todos')}>
                    <option value="todos">Todos</option>
                    <option value="activa">Activas</option>
                    <option value="baja">Bajas</option>
                    <option value="suspendida">Suspendidas</option>
                </select>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Alumno</th>
                            <th>Taller</th>
                            <th>Tipo</th>
                            <th>Modalidad</th>
                            <th>Pago</th>
                            <th>Fecha</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8}><div className="empty-state" style={{ padding: 'var(--space-8)' }}><div className="empty-icon">📝</div><div className="empty-title">Sin inscripciones</div><p className="text-sm text-muted">Registra la primera inscripción con el botón de arriba</p></div></td></tr>
                        ) : filtered.map(i => {
                            const alumno = mockAlumnos.find(a => a.id === i.alumno_id);
                            const grupo = mockGrupos.find(g => g.id === i.grupo_id);
                            const taller = getTallerForGroup(i.grupo_id);
                            return (
                                <tr key={i.id}>
                                    <td><span className="student-name">{alumno ? nombreCompleto(alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno) : '—'}</span></td>
                                    <td>{taller?.nombre || '—'}</td>
                                    <td><span className="badge badge-primary">{grupo ? GRUPO_TIPO_LABELS[grupo.tipo] : '—'}</span></td>
                                    <td>{i.modalidad === 'presencial' ? '🏫 Presencial' : '💻 Online'}</td>
                                    <td>{i.periodo_pago === 'mensual' ? 'Mensual' : 'Quincenal'}</td>
                                    <td>{formatFecha(i.fecha_inscripcion)}</td>
                                    <td><span className={`badge ${STATUS_BADGE[i.estatus]}`}>{STATUS_LABELS[i.estatus]}</span></td>
                                    <td>
                                        <div className="actions-cell">
                                            {i.estatus === 'activa' && <button className="btn btn-ghost btn-sm" onClick={() => handleBaja(i.id)} title="Dar de baja">❌</button>}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Inscripción</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        {formError && <div className="form-alert form-alert-danger">⚠️ {formError}</div>}
                        {formWarning && <div className="form-alert form-alert-warning">ℹ️ {formWarning}</div>}
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label className="form-label">Alumno *</label>
                                <select className="form-select" value={formData.alumno_id} onChange={e => handleAlumnoChange(e.target.value)}>
                                    <option value="">Seleccionar alumno...</option>
                                    {mockAlumnos.filter(a => a.status !== 'inactivo').map(a => (
                                        <option key={a.id} value={a.id}>{nombreCompleto(a.nombre, a.apellido_paterno, a.apellido_materno)} ({calcularEdad(a.fecha_nacimiento)} años) {a.status === 'irregular' ? '⚠️' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">Grupo *</label>
                                <select className="form-select" value={formData.grupo_id} onChange={e => setFormData(p => ({ ...p, grupo_id: e.target.value }))}>
                                    <option value="">Seleccionar grupo...</option>
                                    {mockGrupos.filter(g => g.activo).map(g => {
                                        const taller = mockTalleres.find(t => t.id === g.taller_id);
                                        const maestro = mockMaestros.find(m => m.id === g.maestro_id);
                                        const enrolled = inscripciones.filter(i => i.grupo_id === g.id && i.estatus === 'activa').length;
                                        return (
                                            <option key={g.id} value={g.id}>
                                                {taller?.nombre} — {GRUPO_TIPO_LABELS[g.tipo]} — {maestro?.nombre_completo} ({enrolled}/{g.cupo_maximo})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Modalidad</label>
                                <select className="form-select" value={formData.modalidad} onChange={e => setFormData(p => ({ ...p, modalidad: e.target.value as InscripcionModalidad }))}>
                                    <option value="presencial">Presencial</option>
                                    <option value="online">Online</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Periodo de Pago</label>
                                <select className="form-select" value={formData.periodo_pago} onChange={e => setFormData(p => ({ ...p, periodo_pago: e.target.value as PeriodoPago }))}>
                                    <option value="mensual">Mensual</option>
                                    <option value="quincenal">Quincenal</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>Inscribir</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
