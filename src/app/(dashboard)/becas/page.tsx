'use client';

import { useState } from 'react';
import { mockBecasDescuentos, mockAlumnos } from '@/lib/data/mock-data';
import { nombreCompleto, formatFecha } from '@/lib/utils/business-rules';
import type { BecaDescuento, BecaTipo } from '@/lib/types/database';
import '../shared.css';

export default function BecasPage() {
    const [becas, setBecas] = useState<BecaDescuento[]>(mockBecasDescuentos);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<BecaDescuento | null>(null);
    const [formData, setFormData] = useState({
        alumno_id: '', tipo: 'descuento' as BecaTipo, nombre: '', porcentaje: 10, motivo: '',
        vigencia_inicio: new Date().toISOString().split('T')[0],
        vigencia_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    const [formError, setFormError] = useState('');

    const getAlumnoName = (id: string) => { const a = mockAlumnos.find(al => al.id === id); return a ? nombreCompleto(a.nombre, a.apellido_paterno, a.apellido_materno) : '—'; };

    const openCreate = () => { setEditing(null); setFormData({ alumno_id: '', tipo: 'descuento', nombre: '', porcentaje: 10, motivo: '', vigencia_inicio: new Date().toISOString().split('T')[0], vigencia_fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }); setFormError(''); setShowModal(true); };

    const openEdit = (b: BecaDescuento) => { setEditing(b); setFormData({ alumno_id: b.alumno_id, tipo: b.tipo, nombre: b.nombre, porcentaje: b.porcentaje, motivo: b.motivo || '', vigencia_inicio: b.vigencia_inicio, vigencia_fin: b.vigencia_fin }); setFormError(''); setShowModal(true); };

    const handleSave = () => {
        if (!formData.alumno_id || !formData.nombre) { setFormError('Alumno y nombre son obligatorios.'); return; }
        if (formData.porcentaje < 1 || formData.porcentaje > 100) { setFormError('Porcentaje debe ser entre 1 y 100.'); return; }

        if (editing) {
            setBecas(prev => prev.map(b => b.id === editing.id ? { ...b, ...formData, motivo: formData.motivo || null } : b));
        } else {
            setBecas(prev => [...prev, { id: String(Date.now()), ...formData, motivo: formData.motivo || null, activo: true, creado_por: '1' }]);
        }
        setShowModal(false);
    };

    const toggleActive = (id: string) => setBecas(prev => prev.map(b => b.id === id ? { ...b, activo: !b.activo } : b));
    const handleDelete = (id: string) => { if (confirm('¿Eliminar esta beca/descuento?')) setBecas(prev => prev.filter(b => b.id !== id)); };

    return (
        <>
            <div className="page-header">
                <div><h1 className="page-title">Becas y Descuentos</h1><p className="page-subtitle">Gestión de becas y descuentos para alumnos</p></div>
                <button className="btn btn-primary" onClick={openCreate}>+ Nueva Beca/Descuento</button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card"><div className="stat-value">{becas.length}</div><div className="stat-label">Total</div></div>
                <div className="stat-card"><div className="stat-value">{becas.filter(b => b.tipo === 'beca').length}</div><div className="stat-label">🏅 Becas</div></div>
                <div className="stat-card"><div className="stat-value">{becas.filter(b => b.tipo === 'descuento').length}</div><div className="stat-label">🏷️ Descuentos</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>{becas.filter(b => b.activo).length}</div><div className="stat-label">Activos</div></div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Alumno</th><th>Tipo</th><th>Nombre</th><th>Porcentaje</th><th>Vigencia</th><th>Estatus</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {becas.length === 0 ? (
                            <tr><td colSpan={7}><div className="empty-state" style={{ padding: 'var(--space-8)' }}><div className="empty-icon">🏅</div><div className="empty-title">Sin becas o descuentos</div></div></td></tr>
                        ) : becas.map(b => (
                            <tr key={b.id} style={{ opacity: b.activo ? 1 : 0.5 }}>
                                <td><span className="student-name">{getAlumnoName(b.alumno_id)}</span></td>
                                <td><span className={`badge ${b.tipo === 'beca' ? 'badge-primary' : 'badge-info'}`}>{b.tipo === 'beca' ? '🏅 Beca' : '🏷️ Descuento'}</span></td>
                                <td>{b.nombre}</td>
                                <td><strong>{b.porcentaje}%</strong></td>
                                <td><span className="text-sm text-muted">{formatFecha(b.vigencia_inicio)} — {formatFecha(b.vigencia_fin)}</span></td>
                                <td><span className={`badge ${b.activo ? 'badge-success' : 'badge-neutral'}`}>{b.activo ? 'Activo' : 'Inactivo'}</span></td>
                                <td><div className="actions-cell"><button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)}>✏️</button><button className="btn btn-ghost btn-sm" onClick={() => toggleActive(b.id)}>{b.activo ? '⏸️' : '▶️'}</button><button className="btn btn-ghost btn-sm" onClick={() => handleDelete(b.id)}>🗑️</button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
                        <div className="modal-header"><h2 className="modal-title">{editing ? 'Editar' : 'Nueva'} Beca/Descuento</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                        {formError && <div className="form-alert form-alert-danger">⚠️ {formError}</div>}
                        <div className="form-grid">
                            <div className="form-group full-width"><label className="form-label">Alumno *</label><select className="form-select" value={formData.alumno_id} onChange={e => setFormData(p => ({ ...p, alumno_id: e.target.value }))}><option value="">Seleccionar...</option>{mockAlumnos.map(a => <option key={a.id} value={a.id}>{nombreCompleto(a.nombre, a.apellido_paterno, a.apellido_materno)}</option>)}</select></div>
                            <div className="form-group"><label className="form-label">Tipo</label><select className="form-select" value={formData.tipo} onChange={e => setFormData(p => ({ ...p, tipo: e.target.value as BecaTipo }))}><option value="beca">Beca</option><option value="descuento">Descuento</option></select></div>
                            <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Beca Excelencia" /></div>
                            <div className="form-group"><label className="form-label">Porcentaje (%)</label><input className="form-input" type="number" min={1} max={100} value={formData.porcentaje} onChange={e => setFormData(p => ({ ...p, porcentaje: Number(e.target.value) }))} /></div>
                            <div className="form-group"><label className="form-label">Motivo</label><input className="form-input" value={formData.motivo} onChange={e => setFormData(p => ({ ...p, motivo: e.target.value }))} placeholder="Razón de la beca/descuento" /></div>
                            <div className="form-group"><label className="form-label">Vigencia Inicio</label><input className="form-input" type="date" value={formData.vigencia_inicio} onChange={e => setFormData(p => ({ ...p, vigencia_inicio: e.target.value }))} /></div>
                            <div className="form-group"><label className="form-label">Vigencia Fin</label><input className="form-input" type="date" value={formData.vigencia_fin} onChange={e => setFormData(p => ({ ...p, vigencia_fin: e.target.value }))} /></div>
                        </div>
                        <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>{editing ? 'Guardar' : 'Crear'}</button></div>
                    </div>
                </div>
            )}
        </>
    );
}
