'use client';

import { useState } from 'react';
import { mockTalleres } from '@/lib/data/mock-data';
import type { Taller } from '@/lib/types/database';
import '../shared.css';

export default function TalleresPage() {
    const [talleres, setTalleres] = useState<Taller[]>(mockTalleres);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Taller | null>(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '', edad_minima: 5, activo: true });
    const [formError, setFormError] = useState('');

    const filtered = talleres.filter(t =>
        t.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setEditing(null);
        setFormData({ nombre: '', descripcion: '', edad_minima: 5, activo: true });
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (t: Taller) => {
        setEditing(t);
        setFormData({ nombre: t.nombre, descripcion: t.descripcion || '', edad_minima: t.edad_minima, activo: t.activo });
        setFormError('');
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.nombre) { setFormError('El nombre del taller es obligatorio.'); return; }
        if (talleres.some(t => t.nombre.toLowerCase() === formData.nombre.toLowerCase() && t.id !== editing?.id)) {
            setFormError('Ya existe un taller con ese nombre.');
            return;
        }

        if (editing) {
            setTalleres(prev => prev.map(t =>
                t.id === editing.id ? { ...t, ...formData, descripcion: formData.descripcion || null } : t
            ));
        } else {
            setTalleres(prev => [...prev, {
                id: String(Date.now()),
                nombre: formData.nombre,
                descripcion: formData.descripcion || null,
                edad_minima: formData.edad_minima,
                activo: formData.activo,
            }]);
        }
        setShowModal(false);
    };

    const toggleActive = (id: string) => {
        setTalleres(prev => prev.map(t => t.id === id ? { ...t, activo: !t.activo } : t));
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Talleres</h1>
                    <p className="page-subtitle">Catálogo de talleres de la academia</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Taller</button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card">
                    <div className="stat-value">{talleres.length}</div>
                    <div className="stat-label">Total Talleres</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-success)' }}>{talleres.filter(t => t.activo).length}</div>
                    <div className="stat-label">Activos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-text-muted)' }}>{talleres.filter(t => !t.activo).length}</div>
                    <div className="stat-label">Inactivos</div>
                </div>
            </div>

            <div className="alumnos-filters">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input className="alumnos-search" placeholder="Buscar taller..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Taller</th>
                            <th>Descripción</th>
                            <th>Edad Mínima</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5}><div className="empty-state" style={{ padding: 'var(--space-8)' }}><div className="empty-icon">🎨</div><div className="empty-title">Sin talleres encontrados</div></div></td></tr>
                        ) : filtered.map(t => (
                            <tr key={t.id} style={{ opacity: t.activo ? 1 : 0.5 }}>
                                <td><span className="student-name">{t.nombre}</span></td>
                                <td><span className="text-sm text-muted">{t.descripcion || '—'}</span></td>
                                <td>{t.edad_minima} años</td>
                                <td>
                                    <span className={`badge ${t.activo ? 'badge-success' : 'badge-neutral'}`}>
                                        {t.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>✏️</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(t.id)}>
                                            {t.activo ? '⏸️' : '▶️'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Editar Taller' : 'Nuevo Taller'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        {formError && <div className="form-alert form-alert-danger">⚠️ {formError}</div>}
                        <div className="form-group">
                            <label className="form-label">Nombre del Taller *</label>
                            <input className="form-input" value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Pintura, Canto, Guitarra..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Descripción</label>
                            <textarea className="form-textarea" value={formData.descripcion} onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción del taller..." rows={3} />
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Edad Mínima</label>
                                <select className="form-select" value={formData.edad_minima} onChange={e => setFormData(p => ({ ...p, edad_minima: Number(e.target.value) }))}>
                                    <option value={3}>3 años</option>
                                    <option value={5}>5 años</option>
                                    <option value={7}>7 años</option>
                                    <option value={10}>10 años</option>
                                    <option value={12}>12 años</option>
                                    <option value={15}>15 años</option>
                                    <option value={18}>18 años</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Estatus</label>
                                <select className="form-select" value={formData.activo ? 'true' : 'false'} onChange={e => setFormData(p => ({ ...p, activo: e.target.value === 'true' }))}>
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Guardar' : 'Crear Taller'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
