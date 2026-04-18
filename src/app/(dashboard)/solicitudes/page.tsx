'use client';

import { useState } from 'react';
import { mockSolicitudes, mockUsers } from '@/lib/data/mock-data';
import { formatFecha, STATUS_BADGE, STATUS_LABELS } from '@/lib/utils/business-rules';
import type { Solicitud, SolicitudTipo, SolicitudEstatus } from '@/lib/types/database';
import '../shared.css';

const TIPO_LABELS: Record<SolicitudTipo, string> = {
    permiso_ausencia: '📋 Permiso de Ausencia',
    aviso: '📢 Aviso',
    otro: '📄 Otro',
};

export default function SolicitudesPage() {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>(mockSolicitudes);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ 
        tipo: 'permiso_ausencia' as SolicitudTipo, 
        descripcion: '', 
        fecha_inicio: '', 
        fecha_fin: '' 
    });
    const [formError, setFormError] = useState('');

    const getUserName = (id: string) => mockUsers.find(u => u.id === id)?.nombre_completo || '—';

    const handleSave = () => {
        if (!formData.descripcion) { setFormError('La descripción es obligatoria.'); return; }
        if (formData.tipo === 'permiso_ausencia' && (!formData.fecha_inicio || !formData.fecha_fin)) { 
            setFormError('Las fechas son obligatorias para permisos.'); 
            return; 
        }
        
        const newSolicitud: Solicitud = {
            id: String(Date.now()),
            solicitante_id: '4', // current user (maestro)
            tipo: formData.tipo,
            descripcion: formData.descripcion,
            fecha_referencia: formData.fecha_inicio || new Date().toISOString().split('T')[0],
            fecha_inicio: formData.fecha_inicio || null,
            fecha_fin: formData.fecha_fin || null,
            estatus: 'pendiente',
            resuelta_por: null,
            created_at: new Date().toISOString(),
        };

        setSolicitudes(prev => [...prev, newSolicitud]);
        setShowModal(false);
    };

    const handleAuthorize = (id: string) => setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estatus: 'aprobada' as SolicitudEstatus } : s));
    const handleReject = (id: string) => setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estatus: 'rechazada' as SolicitudEstatus } : s));

    return (
        <>
            <div className="page-header">
                <div><h1 className="page-title">Solicitudes</h1><p className="page-subtitle">Permisos de ausencia y avisos del equipo</p></div>
                <button className="btn btn-primary" onClick={() => { setFormData({ tipo: 'permiso_ausencia', descripcion: '', fecha_inicio: '', fecha_fin: '' }); setFormError(''); setShowModal(true); }}>+ Nueva Solicitud</button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card"><div className="stat-value">{solicitudes.length}</div><div className="stat-label">Total</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-warning)' }}>{solicitudes.filter(s => s.estatus === 'pendiente').length}</div><div className="stat-label">Pendientes</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>{solicitudes.filter(s => s.estatus === 'aprobada').length}</div><div className="stat-label">Aprobadas</div></div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Solicitante</th><th>Tipo</th><th>Descripción</th><th>Período</th><th>Estatus</th><th>Acciones</th></tr></thead>
                    <tbody>
                        {solicitudes.length === 0 ? (
                            <tr><td colSpan={6}><div className="empty-state" style={{ padding: 'var(--space-8)' }}><div className="empty-icon">📋</div><div className="empty-title">Sin solicitudes</div></div></td></tr>
                        ) : solicitudes.map(s => (
                            <tr key={s.id}>
                                <td><span className="student-name">{getUserName(s.solicitante_id)}</span></td>
                                <td>{TIPO_LABELS[s.tipo]}</td>
                                <td><span className="text-sm">{s.descripcion}</span></td>
                                <td>{s.fecha_inicio && s.fecha_fin ? `${formatFecha(s.fecha_inicio)} → ${formatFecha(s.fecha_fin)}` : '—'}</td>
                                <td><span className={`badge ${STATUS_BADGE[s.estatus]}`}>{STATUS_LABELS[s.estatus]}</span></td>
                                <td>
                                    <div className="actions-cell">
                                        {s.estatus === 'pendiente' && <>
                                            <button className="btn btn-sm btn-primary" onClick={() => handleAuthorize(s.id)}>✅</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleReject(s.id)}>❌</button>
                                        </>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header"><h2 className="modal-title">Nueva Solicitud</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                        {formError && <div className="form-alert form-alert-danger">⚠️ {formError}</div>}
                        <div className="form-group"><label className="form-label">Tipo</label><select className="form-select" value={formData.tipo} onChange={e => setFormData(p => ({ ...p, tipo: e.target.value as SolicitudTipo }))}>{Object.entries(TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                        <div className="form-group"><label className="form-label">Descripción *</label><textarea className="form-textarea" rows={3} value={formData.descripcion} onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))} placeholder="Detalle de la solicitud..." /></div>
                        {formData.tipo === 'permiso_ausencia' && (
                            <div className="form-grid">
                                <div className="form-group"><label className="form-label">Fecha Inicio *</label><input className="form-input" type="date" value={formData.fecha_inicio} onChange={e => setFormData(p => ({ ...p, fecha_inicio: e.target.value }))} /></div>
                                <div className="form-group"><label className="form-label">Fecha Fin *</label><input className="form-input" type="date" value={formData.fecha_fin} onChange={e => setFormData(p => ({ ...p, fecha_fin: e.target.value }))} /></div>
                            </div>
                        )}
                        <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>Enviar Solicitud</button></div>
                    </div>
                </div>
            )}
        </>
    );
}
