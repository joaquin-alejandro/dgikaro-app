'use client';

import { useState, useMemo } from 'react';
import { mockGrupos, mockTalleres, mockMaestros, mockInscripciones } from '@/lib/data/mock-data';
import { GRUPO_TIPO_LABELS, STATUS_LABELS } from '@/lib/utils/business-rules';
import type { Grupo, GrupoTipo, NivelGrupo } from '@/lib/types/database';
import '../shared.css';

const TIPO_CUPO_DEFAULTS: Record<GrupoTipo, { min: number; max: number }> = {
    individual: { min: 1, max: 1 },
    grupal: { min: 2, max: 5 },
    grupal_especial: { min: 5, max: 15 },
    duo: { min: 2, max: 2 },
    familiar: { min: 2, max: 10 },
};

export default function GruposPage() {
    const [grupos, setGrupos] = useState<Grupo[]>(mockGrupos);
    const [search, setSearch] = useState('');
    const [tipoFilter, setTipoFilter] = useState<GrupoTipo | 'todos'>('todos');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Grupo | null>(null);
    const [formData, setFormData] = useState({
        taller_id: '',
        maestro_id: '',
        tipo: 'grupal' as GrupoTipo,
        nivel: 'basico' as NivelGrupo,
        cupo_minimo: 2,
        cupo_maximo: 5,
        activo: true,
    });
    const [formError, setFormError] = useState('');

    const getTallerName = (id: string) => mockTalleres.find(t => t.id === id)?.nombre || '—';
    const getMaestroName = (id: string) => mockMaestros.find(m => m.id === id)?.nombre_completo || '—';
    const getInscritos = (grupoId: string) => mockInscripciones.filter(i => i.grupo_id === grupoId && i.estatus === 'activa').length;

    const filtered = useMemo(() => {
        return grupos.filter(g => {
            const tallerName = getTallerName(g.taller_id).toLowerCase();
            const maestroName = getMaestroName(g.maestro_id).toLowerCase();
            const matchSearch = tallerName.includes(search.toLowerCase()) || maestroName.includes(search.toLowerCase());
            const matchTipo = tipoFilter === 'todos' || g.tipo === tipoFilter;
            return matchSearch && matchTipo;
        });
    }, [grupos, search, tipoFilter]);

    const openCreate = () => {
        setEditing(null);
        setFormData({ taller_id: mockTalleres[0]?.id || '', maestro_id: mockMaestros[0]?.id || '', tipo: 'grupal', nivel: 'basico', cupo_minimo: 2, cupo_maximo: 5, activo: true });
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (g: Grupo) => {
        setEditing(g);
        setFormData({ taller_id: g.taller_id, maestro_id: g.maestro_id, tipo: g.tipo, nivel: g.nivel, cupo_minimo: g.cupo_minimo, cupo_maximo: g.cupo_maximo, activo: g.activo });
        setFormError('');
        setShowModal(true);
    };

    const handleTipoChange = (tipo: GrupoTipo) => {
        const defaults = TIPO_CUPO_DEFAULTS[tipo];
        setFormData(p => ({ ...p, tipo, cupo_minimo: defaults.min, cupo_maximo: defaults.max }));
    };

    const handleSave = () => {
        if (!formData.taller_id || !formData.maestro_id) { setFormError('Taller y maestro son obligatorios.'); return; }
        if (formData.cupo_minimo > formData.cupo_maximo) { setFormError('El cupo mínimo no puede ser mayor al máximo.'); return; }

        if (editing) {
            setGrupos(prev => prev.map(g => g.id === editing.id ? { ...g, ...formData } : g));
        } else {
            setGrupos(prev => [...prev, { id: String(Date.now()), ...formData }]);
        }
        setShowModal(false);
    };

    const toggleActive = (id: string) => {
        setGrupos(prev => prev.map(g => g.id === id ? { ...g, activo: !g.activo } : g));
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Grupos</h1>
                    <p className="page-subtitle">Clases activas y su configuración</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Grupo</button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                {Object.entries(GRUPO_TIPO_LABELS).map(([key, label]) => (
                    <div className="stat-card" key={key}>
                        <div className="stat-value">{grupos.filter(g => g.tipo === key).length}</div>
                        <div className="stat-label">{label}</div>
                    </div>
                ))}
            </div>

            <div className="alumnos-filters">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input className="alumnos-search" placeholder="Buscar por taller o maestro..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="filter-select" value={tipoFilter} onChange={e => setTipoFilter(e.target.value as GrupoTipo | 'todos')}>
                    <option value="todos">Todos los tipos</option>
                    {Object.entries(GRUPO_TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Taller</th>
                            <th>Maestro</th>
                            <th>Tipo</th>
                            <th>Nivel</th>
                            <th>Cupo</th>
                            <th>Inscritos</th>
                            <th>Estatus</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8}><div className="empty-state" style={{ padding: 'var(--space-8)' }}><div className="empty-icon">👥</div><div className="empty-title">Sin grupos encontrados</div></div></td></tr>
                        ) : filtered.map(g => {
                            const inscritos = getInscritos(g.id);
                            const lleno = inscritos >= g.cupo_maximo;
                            return (
                                <tr key={g.id} style={{ opacity: g.activo ? 1 : 0.5 }}>
                                    <td><span className="student-name">{getTallerName(g.taller_id)}</span></td>
                                    <td>{getMaestroName(g.maestro_id)}</td>
                                    <td><span className="badge badge-primary">{GRUPO_TIPO_LABELS[g.tipo]}</span></td>
                                    <td>{STATUS_LABELS[g.nivel] || g.nivel}</td>
                                    <td>{g.cupo_minimo}–{g.cupo_maximo}</td>
                                    <td>
                                        <span className={`badge ${lleno ? 'badge-danger' : 'badge-success'}`}>
                                            {inscritos}/{g.cupo_maximo}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${g.activo ? 'badge-success' : 'badge-neutral'}`}>
                                            {g.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(g)}>✏️</button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => toggleActive(g.id)}>{g.activo ? '⏸️' : '▶️'}</button>
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
                            <h2 className="modal-title">{editing ? 'Editar Grupo' : 'Nuevo Grupo'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        {formError && <div className="form-alert form-alert-danger">⚠️ {formError}</div>}
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Taller *</label>
                                <select className="form-select" value={formData.taller_id} onChange={e => setFormData(p => ({ ...p, taller_id: e.target.value }))}>
                                    {mockTalleres.filter(t => t.activo).map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Maestro *</label>
                                <select className="form-select" value={formData.maestro_id} onChange={e => setFormData(p => ({ ...p, maestro_id: e.target.value }))}>
                                    {mockMaestros.map(m => <option key={m.id} value={m.id}>{m.nombre_completo}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tipo de Grupo</label>
                                <select className="form-select" value={formData.tipo} onChange={e => handleTipoChange(e.target.value as GrupoTipo)}>
                                    {Object.entries(GRUPO_TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nivel</label>
                                <select className="form-select" value={formData.nivel} onChange={e => setFormData(p => ({ ...p, nivel: e.target.value as NivelGrupo }))}>
                                    <option value="basico">Básico</option>
                                    <option value="intermedio">Intermedio</option>
                                    <option value="avanzado">Avanzado</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cupo Mínimo</label>
                                <input className="form-input" type="number" min={1} value={formData.cupo_minimo} onChange={e => setFormData(p => ({ ...p, cupo_minimo: Number(e.target.value) }))} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cupo Máximo</label>
                                <input className="form-input" type="number" min={1} value={formData.cupo_maximo} onChange={e => setFormData(p => ({ ...p, cupo_maximo: Number(e.target.value) }))} />
                            </div>
                        </div>

                        {/* Tipo info alert */}
                        <div className="form-alert form-alert-info" style={{ marginTop: 'var(--space-4)' }}>
                            ℹ️ {formData.tipo === 'individual' ? 'Clase 1 a 1 con cobro individual.' :
                                formData.tipo === 'duo' ? 'Grupo de 2 personas, cobro individual por alumno.' :
                                    formData.tipo === 'familiar' ? 'Grupo familiar, cobro grupal, SIN restricción de edades.' :
                                        formData.tipo === 'grupal_especial' ? 'Grupo variable (mín 5), cobro grupal.' :
                                            'Grupo estándar (2-5 alumnos), cobro grupal, por rango de edad.'}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>{editing ? 'Guardar' : 'Crear Grupo'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
