'use client';

import { useState } from 'react';
import { mockMaestros, mockGrupos, mockTalleres } from '@/lib/data/mock-data';
import { formatFecha } from '@/lib/utils/business-rules';
import type { Maestro } from '@/lib/types/database';
import '../shared.css';

export default function MaestrosPage() {
    const [maestros, setMaestros] = useState<Maestro[]>(mockMaestros);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Maestro | null>(null);
    const [formData, setFormData] = useState({ nombre_completo: '', especialidad: '', semblanza: '' });
    const [formError, setFormError] = useState('');

    const filtered = maestros.filter(m =>
        m.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
        m.especialidad.toLowerCase().includes(search.toLowerCase())
    );

    const getGroupCount = (maestroId: string) => mockGrupos.filter(g => g.maestro_id === maestroId).length;

    const getGroupDetails = (maestroId: string) => {
        return mockGrupos
            .filter(g => g.maestro_id === maestroId)
            .map(g => {
                const taller = mockTalleres.find(t => t.id === g.taller_id);
                return taller?.nombre || '—';
            })
            .join(', ');
    };

    const openCreate = () => {
        setEditing(null);
        setFormData({ nombre_completo: '', especialidad: '', semblanza: '' });
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (m: Maestro) => {
        setEditing(m);
        setFormData({ nombre_completo: m.nombre_completo, especialidad: m.especialidad, semblanza: m.semblanza || '' });
        setFormError('');
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.nombre_completo || !formData.especialidad) {
            setFormError('Nombre y especialidad son obligatorios.');
            return;
        }
        if (editing) {
            setMaestros(prev => prev.map(m =>
                m.id === editing.id ? { ...m, ...formData, semblanza: formData.semblanza || null } : m
            ));
        } else {
            setMaestros(prev => [...prev, {
                id: String(Date.now()),
                user_id: '',
                nombre_completo: formData.nombre_completo,
                especialidad: formData.especialidad,
                contrato_url: null,
                semblanza: formData.semblanza || null,
                curriculum_url: null,
                created_at: new Date().toISOString(),
            }]);
        }
        setShowModal(false);
    };

    const handleDelete = (id: string) => {
        if (getGroupCount(id) > 0) { alert('No se puede eliminar: tiene grupos asignados.'); return; }
        if (confirm('¿Eliminar este maestro?')) setMaestros(prev => prev.filter(m => m.id !== id));
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Maestros</h1>
                    <p className="page-subtitle">Equipo docente de la academia</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Maestro</button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card">
                    <div className="stat-value">{maestros.length}</div>
                    <div className="stat-label">Total Maestros</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{mockGrupos.length}</div>
                    <div className="stat-label">Grupos Asignados</div>
                </div>
            </div>

            <div className="alumnos-filters">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input className="alumnos-search" placeholder="Buscar por nombre o especialidad..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Maestro</th>
                            <th>Especialidad</th>
                            <th>Grupos</th>
                            <th>Talleres</th>
                            <th>Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6}><div className="empty-state" style={{ padding: 'var(--space-8)' }}><div className="empty-icon">👩‍🏫</div><div className="empty-title">Sin maestros encontrados</div></div></td></tr>
                        ) : filtered.map(m => (
                            <tr key={m.id}>
                                <td>
                                    <div className="student-name-cell">
                                        <span className="student-name">{m.nombre_completo}</span>
                                        {m.semblanza && <span className="student-meta">{m.semblanza.substring(0, 60)}...</span>}
                                    </div>
                                </td>
                                <td><span className="badge badge-primary">{m.especialidad}</span></td>
                                <td><span className="count-badge badge badge-info">{getGroupCount(m.id)}</span></td>
                                <td><span className="text-sm text-muted">{getGroupDetails(m.id) || '—'}</span></td>
                                <td>{formatFecha(m.created_at)}</td>
                                <td>
                                    <div className="actions-cell">
                                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>✏️</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(m.id)}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Editar Maestro' : 'Nuevo Maestro'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        {formError && <div className="form-alert form-alert-danger">⚠️ {formError}</div>}
                        <div className="form-group">
                            <label className="form-label">Nombre Completo *</label>
                            <input className="form-input" value={formData.nombre_completo} onChange={e => setFormData(p => ({ ...p, nombre_completo: e.target.value }))} placeholder="Nombre completo" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Especialidad *</label>
                            <input className="form-input" value={formData.especialidad} onChange={e => setFormData(p => ({ ...p, especialidad: e.target.value }))} placeholder="Ej: Piano, Canto, Pintura..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Semblanza</label>
                            <textarea className="form-textarea" value={formData.semblanza} onChange={e => setFormData(p => ({ ...p, semblanza: e.target.value }))} placeholder="Breve descripción profesional..." rows={3} />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Guardar' : 'Registrar Maestro'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
