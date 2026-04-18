'use client';

import { useState } from 'react';
import { mockAlumnos, mockGrupos, mockTalleres, mockSesiones } from '@/lib/data/mock-data';
import { nombreCompleto, formatFecha } from '@/lib/utils/business-rules';
import type { ConfirmacionAsistencia, AsistenciaEstatus } from '@/lib/types/database';
import '../shared.css';

export default function AsistenciaPage() {
    const [asistencias, setAsistencias] = useState<ConfirmacionAsistencia[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedGrupo, setSelectedGrupo] = useState('');

    const handleMark = (alumnoId: string, sesionId: string, estatus: AsistenciaEstatus) => {
        setAsistencias(prev => {
            const existing = prev.findIndex(a => a.alumno_id === alumnoId && a.sesion_id === sesionId);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = { ...updated[existing], estatus };
                return updated;
            }
            return [...prev, {
                id: String(Date.now()),
                sesion_id: sesionId,
                alumno_id: alumnoId,
                estatus,
                nota: null,
                created_at: new Date().toISOString(),
            }];
        });
    };

    const getAsistenciaStatus = (alumnoId: string, sesionId: string): AsistenciaEstatus | null => {
        const record = asistencias.find(a => a.alumno_id === alumnoId && a.sesion_id === sesionId);
        return record?.estatus || null;
    };

    // Count absences for a student
    const getFaltasCount = (alumnoId: string) => {
        return asistencias.filter(a => a.alumno_id === alumnoId && a.estatus === 'falta').length;
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Asistencia</h1>
                    <p className="page-subtitle">Control de asistencia por sesión</p>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card">
                    <div className="stat-value">{asistencias.filter(a => a.estatus === 'asistio').length}</div>
                    <div className="stat-label">✅ Asistencias</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{asistencias.filter(a => a.estatus === 'falta').length}</div>
                    <div className="stat-label">❌ Faltas</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{asistencias.filter(a => a.estatus === 'cancelacion_valida').length}</div>
                    <div className="stat-label">📋 Cancelaciones</div>
                </div>
            </div>

            <div className="alumnos-filters">
                <div className="form-group" style={{ marginBottom: 0, minWidth: '180px' }}>
                    <input className="form-input" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                </div>
                <select className="filter-select" value={selectedGrupo} onChange={e => setSelectedGrupo(e.target.value)}>
                    <option value="">Todos los grupos</option>
                    {mockGrupos.filter(g => g.activo).map(g => {
                        const taller = mockTalleres.find(t => t.id === g.taller_id);
                        return <option key={g.id} value={g.id}>{taller?.nombre || 'Grupo'}</option>;
                    })}
                </select>
            </div>

            <div className="card" style={{ marginTop: 'var(--space-4)' }}>
                <div className="card-header">
                    <h3 className="card-title">Sesión del {formatFecha(selectedDate)}</h3>
                </div>

                {mockSesiones.length === 0 && mockAlumnos.length > 0 ? (
                    <div>
                        <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                            No hay sesiones programadas. Mostrando todos los alumnos activos para registro rápido:
                        </p>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Alumno</th>
                                        <th>Faltas Acum.</th>
                                        <th>Asistencia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockAlumnos.filter(a => a.status !== 'inactivo').map(alumno => {
                                        const sesionId = `manual-${selectedDate}`;
                                        const currentStatus = getAsistenciaStatus(alumno.id, sesionId);
                                        const faltasCount = getFaltasCount(alumno.id);
                                        return (
                                            <tr key={alumno.id}>
                                                <td>
                                                    <div className="student-name-cell">
                                                        <span className="student-name">{nombreCompleto(alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno)}</span>
                                                        {faltasCount >= 2 && <span className="student-meta" style={{ color: 'var(--color-danger)' }}>⚠️ {faltasCount} faltas acumuladas</span>}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${faltasCount >= 3 ? 'badge-danger' : faltasCount >= 2 ? 'badge-warning' : 'badge-success'}`}>
                                                        {faltasCount}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="actions-cell" style={{ gap: 'var(--space-2)' }}>
                                                        <button
                                                            className={`btn btn-sm ${currentStatus === 'asistio' ? 'btn-primary' : 'btn-secondary'}`}
                                                            onClick={() => handleMark(alumno.id, sesionId, 'asistio')}
                                                        >✅</button>
                                                        <button
                                                            className={`btn btn-sm ${currentStatus === 'falta' ? 'btn-danger' : 'btn-secondary'}`}
                                                            onClick={() => handleMark(alumno.id, sesionId, 'falta')}
                                                        >❌</button>
                                                        <button
                                                            className={`btn btn-sm ${currentStatus === 'cancelacion_valida' ? 'btn-primary' : 'btn-secondary'}`}
                                                            onClick={() => handleMark(alumno.id, sesionId, 'cancelacion_valida')}
                                                            style={currentStatus === 'cancelacion_valida' ? { background: 'var(--color-warning)', borderColor: 'var(--color-warning)' } : {}}
                                                        >📋</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">✅</div>
                        <div className="empty-title">Sin sesiones programadas para esta fecha</div>
                        <p className="text-sm text-muted">Selecciona otra fecha o crea sesiones en el Calendario</p>
                    </div>
                )}
            </div>
        </>
    );
}
