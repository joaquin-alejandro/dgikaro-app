'use client';

import { useState } from 'react';
import { mockGastos, mockCategoriasGastos } from '@/lib/data/mock-data';
import { formatMonto, formatFecha } from '@/lib/utils/business-rules';
import type { Gasto } from '@/lib/types/database';
import '../shared.css';

export default function GastosPage() {
    const [gastos, setGastos] = useState<Gasto[]>(mockGastos);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ monto: '', descripcion: '', categoria_id: '', fecha: new Date().toISOString().split('T')[0] });
    const [formError, setFormError] = useState('');

    const totalEgresos = gastos.reduce((sum, g) => sum + g.monto, 0);
    const getCatName = (id: string) => mockCategoriasGastos.find(c => c.id === id)?.nombre || '—';

    const handleSave = () => {
        if (!formData.monto || !formData.descripcion || !formData.categoria_id) { setFormError('Todos los campos son obligatorios.'); return; }
        const montoNum = parseFloat(formData.monto);
        if (isNaN(montoNum) || montoNum <= 0) { setFormError('El monto debe ser mayor a 0.'); return; }

        setGastos(prev => [...prev, {
            id: String(Date.now()),
            monto: Math.round(montoNum * 100),
            descripcion: formData.descripcion,
            fecha: formData.fecha,
            categoria_id: formData.categoria_id,
            comprobante_url: null,
            registrado_por: '1',
        }]);
        setShowModal(false);
    };

    return (
        <>
            <div className="page-header">
                <div><h1 className="page-title">Gastos</h1><p className="page-subtitle">Registro de egresos de la academia</p></div>
                <button className="btn btn-primary" onClick={() => { setFormData({ monto: '', descripcion: '', categoria_id: '', fecha: new Date().toISOString().split('T')[0] }); setFormError(''); setShowModal(true); }}>+ Registrar Gasto</button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card"><div className="stat-value">{gastos.length}</div><div className="stat-label">Total Gastos</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-danger)' }}>{formatMonto(totalEgresos)}</div><div className="stat-label">Total Egresos</div></div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Descripción</th><th>Categoría</th><th>Monto</th><th>Fecha</th></tr></thead>
                    <tbody>
                        {gastos.length === 0 ? (
                            <tr><td colSpan={4}><div className="empty-state" style={{ padding: 'var(--space-8)' }}><div className="empty-icon">📤</div><div className="empty-title">Sin gastos registrados</div></div></td></tr>
                        ) : gastos.map(g => (
                            <tr key={g.id}><td><span className="student-name">{g.descripcion}</span></td><td><span className="badge badge-neutral">{getCatName(g.categoria_id)}</span></td><td><strong style={{ color: 'var(--color-danger)' }}>-{formatMonto(g.monto)}</strong></td><td>{formatFecha(g.fecha)}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className="modal-header"><h2 className="modal-title">Registrar Gasto</h2><button className="modal-close" onClick={() => setShowModal(false)}>✕</button></div>
                        {formError && <div className="form-alert form-alert-danger">⚠️ {formError}</div>}
                        <div className="form-group"><label className="form-label">Descripción *</label><input className="form-input" value={formData.descripcion} onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))} placeholder="Ej: Materiales de pintura" /></div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Categoría *</label><select className="form-select" value={formData.categoria_id} onChange={e => setFormData(p => ({ ...p, categoria_id: e.target.value }))}><option value="">Seleccionar...</option>{mockCategoriasGastos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
                            <div className="form-group"><label className="form-label">Monto (MXN) *</label><input className="form-input" type="number" step="0.01" min="0" value={formData.monto} onChange={e => setFormData(p => ({ ...p, monto: e.target.value }))} placeholder="0.00" /></div>
                        </div>
                        <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" value={formData.fecha} onChange={e => setFormData(p => ({ ...p, fecha: e.target.value }))} /></div>
                        <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>Registrar</button></div>
                    </div>
                </div>
            )}
        </>
    );
}
