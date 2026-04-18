'use client';

import { useState } from 'react';
import { mockPagos, mockConceptosPago, mockAlumnos, mockInscripciones } from '@/lib/data/mock-data';
import { formatMonto, formatFecha, nombreCompleto, STATUS_BADGE, STATUS_LABELS, calcularMulta, requiereReinscripcion } from '@/lib/utils/business-rules';
import type { Pago, PagoEstatus } from '@/lib/types/database';
import '../shared.css';

export default function PagosPage() {
    const [pagos, setPagos] = useState<Pago[]>(mockPagos);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<PagoEstatus | 'todos'>('todos');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        inscripcion_id: '',
        concepto_id: '',
        monto: '',
        fecha_pago: new Date().toISOString().split('T')[0],
    });
    const [formError, setFormError] = useState('');
    const [formWarning, setFormWarning] = useState('');

    const getConceptoName = (id: string) => {
        const c = mockConceptosPago.find(cp => cp.id === id);
        return c ? c.nombre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '—';
    };

    const getAlumnoForInscripcion = (inscId: string) => {
        const insc = mockInscripciones.find(i => i.id === inscId);
        if (!insc) return null;
        return mockAlumnos.find(a => a.id === insc.alumno_id);
    };

    const totalIngresos = pagos.filter(p => p.estatus === 'validado').reduce((sum, p) => sum + p.monto, 0);

    const handleConceptoChange = (conceptoId: string) => {
        const concepto = mockConceptosPago.find(c => c.id === conceptoId);
        setFormData(p => ({
            ...p,
            concepto_id: conceptoId,
            monto: concepto && concepto.monto_default > 0 ? String(concepto.monto_default / 100) : p.monto,
        }));

        setFormWarning('');
        if (concepto?.nombre === 'mensualidad' && formData.inscripcion_id) {
            // Check if reinscription is needed
            const lastPayment = pagos
                .filter(p => p.inscripcion_id === formData.inscripcion_id && p.estatus === 'validado')
                .sort((a, b) => b.fecha_pago.localeCompare(a.fecha_pago))[0];

            if (requiereReinscripcion(lastPayment?.fecha_pago || null)) {
                setFormWarning('⚠️ Han pasado más de 60 días sin pago. Se generará un cargo extra de Reinscripción ($250).');
            }
        }
    };

    const handleSave = () => {
        if (!formData.concepto_id || !formData.monto) { setFormError('Concepto y monto son obligatorios.'); return; }
        const montoNum = parseFloat(formData.monto);
        if (isNaN(montoNum) || montoNum <= 0) { setFormError('El monto debe ser mayor a 0.'); return; }

        // Create the main payment
        const newPago: Pago = {
            id: String(Date.now()),
            inscripcion_id: formData.inscripcion_id || '',
            concepto_id: formData.concepto_id,
            monto: Math.round(montoNum * 100), // convert to centavos
            comprobante_url: null,
            estatus: 'pendiente',
            fecha_pago: formData.fecha_pago,
            registrado_por: '1', // current user
        };

        const newPagos = [newPago];

        // Rule 10: Late fee (10%)
        const concepto = mockConceptosPago.find(c => c.id === formData.concepto_id);
        if (concepto?.nombre === 'mensualidad') {
            // Check if payment is late (simplified check)
            const lateFee = calcularMulta(newPago.monto);
            if (lateFee > 0 && formWarning.includes('Reinscripción')) {
                // Add reinscription charge
                const multaConcepto = mockConceptosPago.find(c => c.nombre === 'reinscripcion');
                if (multaConcepto) {
                    newPagos.push({
                        id: String(Date.now() + 1),
                        inscripcion_id: formData.inscripcion_id || '',
                        concepto_id: multaConcepto.id,
                        monto: 25000, // $250
                        comprobante_url: null,
                        estatus: 'pendiente',
                        fecha_pago: formData.fecha_pago,
                        registrado_por: '1',
                    });
                }
            }
        }

        setPagos(prev => [...prev, ...newPagos]);
        setShowModal(false);
    };

    const handleValidate = (id: string) => {
        setPagos(prev => prev.map(p => p.id === id ? { ...p, estatus: 'validado' as PagoEstatus } : p));
    };

    const handleReject = (id: string) => {
        setPagos(prev => prev.map(p => p.id === id ? { ...p, estatus: 'rechazado' as PagoEstatus } : p));
    };

    const filtered = pagos.filter(p => {
        const alumno = getAlumnoForInscripcion(p.inscripcion_id);
        const name = alumno ? nombreCompleto(alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno).toLowerCase() : '';
        const matchSearch = name.includes(search.toLowerCase()) || getConceptoName(p.concepto_id).toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'todos' || p.estatus === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Pagos</h1>
                    <p className="page-subtitle">Registro y validación de pagos</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setFormData({ inscripcion_id: '', concepto_id: '', monto: '', fecha_pago: new Date().toISOString().split('T')[0] }); setFormError(''); setFormWarning(''); setShowModal(true); }}>
                    + Registrar Pago
                </button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card"><div className="stat-value">{pagos.length}</div><div className="stat-label">Total Pagos</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>{formatMonto(totalIngresos)}</div><div className="stat-label">Ingresos Validados</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-warning)' }}>{pagos.filter(p => p.estatus === 'pendiente').length}</div><div className="stat-label">Pendientes</div></div>
            </div>

            <div className="alumnos-filters">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input className="alumnos-search" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as PagoEstatus | 'todos')}>
                    <option value="todos">Todos</option><option value="pendiente">Pendientes</option><option value="validado">Validados</option><option value="rechazado">Rechazados</option>
                </select>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr><th>Concepto</th><th>Monto</th><th>Fecha</th><th>Estatus</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5}><div className="empty-state" style={{ padding: 'var(--space-8)' }}><div className="empty-icon">💰</div><div className="empty-title">Sin pagos registrados</div></div></td></tr>
                        ) : filtered.map(p => (
                            <tr key={p.id}>
                                <td><span className="student-name">{getConceptoName(p.concepto_id)}</span></td>
                                <td><strong>{formatMonto(p.monto)}</strong></td>
                                <td>{formatFecha(p.fecha_pago)}</td>
                                <td><span className={`badge ${STATUS_BADGE[p.estatus]}`}>{STATUS_LABELS[p.estatus]}</span></td>
                                <td>
                                    <div className="actions-cell">
                                        {p.estatus === 'pendiente' && <>
                                            <button className="btn btn-sm btn-primary" onClick={() => handleValidate(p.id)}>✅</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleReject(p.id)}>❌</button>
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
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Registrar Pago</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        {formError && <div className="form-alert form-alert-danger">⚠️ {formError}</div>}
                        {formWarning && <div className="form-alert form-alert-warning">{formWarning}</div>}
                        <div className="form-group">
                            <label className="form-label">Concepto *</label>
                            <select className="form-select" value={formData.concepto_id} onChange={e => handleConceptoChange(e.target.value)}>
                                <option value="">Seleccionar...</option>
                                {mockConceptosPago.map(c => <option key={c.id} value={c.id}>{c.nombre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} {c.monto_default > 0 ? `(${formatMonto(c.monto_default)})` : ''}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Monto (MXN) *</label>
                            <input className="form-input" type="number" step="0.01" min="0" value={formData.monto} onChange={e => setFormData(p => ({ ...p, monto: e.target.value }))} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Fecha de Pago</label>
                            <input className="form-input" type="date" value={formData.fecha_pago} onChange={e => setFormData(p => ({ ...p, fecha_pago: e.target.value }))} />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>Registrar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
