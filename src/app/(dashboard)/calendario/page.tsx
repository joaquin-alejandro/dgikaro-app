'use client';

import { useState, useMemo } from 'react';
import { mockGrupos, mockTalleres, mockMaestros, mockSesiones } from '@/lib/data/mock-data';
import { GRUPO_TIPO_LABELS } from '@/lib/utils/business-rules';
import type { SesionProgramada, SesionEstatus } from '@/lib/types/database';
import '../shared.css';

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8am to 8pm

function getMonthDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    const days: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarioPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week'>('month');
    const [showModal, setShowModal] = useState(false);
    const [sesiones, setSesiones] = useState<SesionProgramada[]>(mockSesiones);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        grupo_id: '',
        hora_inicio: '09:00',
        hora_fin: '10:00',
        estatus: 'programada' as SesionEstatus,
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const getSesionesForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return sesiones.filter(s => s.fecha === dateStr);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    };

    const handleDayClick = (day: number | null) => {
        if (!day) return;
        setSelectedDay(day);
        setFormData({ grupo_id: mockGrupos[0]?.id || '', hora_inicio: '09:00', hora_fin: '10:00', estatus: 'programada' });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.grupo_id || !selectedDay) return;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
        setSesiones(prev => [...prev, {
            id: String(Date.now()),
            grupo_id: formData.grupo_id,
            fecha: dateStr,
            hora_inicio: formData.hora_inicio,
            hora_fin: formData.hora_fin,
            estatus: formData.estatus,
        }]);
        setShowModal(false);
    };

    return (
        <>
            <div className="page-header">
                <div><h1 className="page-title">Calendario</h1><p className="page-subtitle">Programación de sesiones y clases</p></div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className={`btn ${view === 'month' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setView('month')}>Mes</button>
                    <button className={`btn ${view === 'week' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setView('week')}>Semana</button>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button className="btn btn-ghost btn-sm" onClick={prevMonth}>← Anterior</button>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, margin: 0 }}>
                            {MONTH_NAMES[month]} {year}
                        </h2>
                        <button className="btn btn-ghost btn-sm" onClick={goToday} style={{ fontSize: 'var(--font-size-xs)' }}>Hoy</button>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={nextMonth}>Siguiente →</button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card"><div className="stat-value">{sesiones.length}</div><div className="stat-label">Sesiones Programadas</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>{sesiones.filter(s => s.estatus === 'completada').length}</div><div className="stat-label">Completadas</div></div>
                <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-info)' }}>{sesiones.filter(s => s.estatus === 'programada').length}</div><div className="stat-label">Por Impartir</div></div>
            </div>

            {/* Calendar Grid */}
            <div className="card">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--color-border)' }}>
                    {/* Day headers */}
                    {DAYS_OF_WEEK.map(day => (
                        <div key={day} style={{ padding: 'var(--space-2)', textAlign: 'center', fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', background: 'var(--color-bg-elevated)', textTransform: 'uppercase' }}>
                            {day}
                        </div>
                    ))}
                    {/* Day cells */}
                    {monthDays.map((day, idx) => {
                        const daySesiones = day ? getSesionesForDay(day) : [];
                        return (
                            <div
                                key={idx}
                                onClick={() => handleDayClick(day)}
                                style={{
                                    minHeight: '80px',
                                    padding: 'var(--space-1) var(--space-2)',
                                    background: day ? (isToday(day) ? 'var(--color-primary-50)' : 'var(--color-bg-card)') : 'var(--color-bg-elevated)',
                                    cursor: day ? 'pointer' : 'default',
                                    transition: 'background var(--transition-fast)',
                                }}
                            >
                                {day && (
                                    <>
                                        <div style={{
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: isToday(day) ? 700 : 400,
                                            color: isToday(day) ? 'var(--color-primary)' : 'var(--color-text)',
                                            marginBottom: 'var(--space-1)',
                                        }}>
                                            {day}
                                        </div>
                                        {daySesiones.map(s => {
                                            const grupo = mockGrupos.find(g => g.id === s.grupo_id);
                                            const taller = grupo ? mockTalleres.find(t => t.id === grupo.taller_id) : null;
                                            return (
                                                <div key={s.id} style={{
                                                    fontSize: '10px',
                                                    padding: '1px 4px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: s.estatus === 'completada' ? 'var(--color-success-light)' : s.estatus === 'cancelada' ? 'var(--color-danger-light)' : 'var(--color-primary-50)',
                                                    color: s.estatus === 'completada' ? 'var(--color-success)' : s.estatus === 'cancelada' ? 'var(--color-danger)' : 'var(--color-primary)',
                                                    marginBottom: '2px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>
                                                    {s.hora_inicio} {taller?.nombre || 'Sesión'}
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Session Modal */}
            {showModal && selectedDay && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">Programar Sesión — {selectedDay} de {MONTH_NAMES[month]}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {/* Existing sessions for this day */}
                        {getSesionesForDay(selectedDay).length > 0 && (
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <p className="form-label">Sesiones existentes:</p>
                                {getSesionesForDay(selectedDay).map(s => {
                                    const grupo = mockGrupos.find(g => g.id === s.grupo_id);
                                    const taller = grupo ? mockTalleres.find(t => t.id === grupo.taller_id) : null;
                                    return (
                                        <div key={s.id} className="form-alert form-alert-info" style={{ marginBottom: 'var(--space-2)' }}>
                                            🕐 {s.hora_inicio}–{s.hora_fin} — {taller?.nombre || 'Sesión'} ({grupo ? GRUPO_TIPO_LABELS[grupo.tipo] : ''})
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Grupo</label>
                            <select className="form-select" value={formData.grupo_id} onChange={e => setFormData(p => ({ ...p, grupo_id: e.target.value }))}>
                                {mockGrupos.filter(g => g.activo).map(g => {
                                    const taller = mockTalleres.find(t => t.id === g.taller_id);
                                    const maestro = mockMaestros.find(m => m.id === g.maestro_id);
                                    return <option key={g.id} value={g.id}>{taller?.nombre} — {maestro?.nombre_completo} ({GRUPO_TIPO_LABELS[g.tipo]})</option>;
                                })}
                            </select>
                        </div>
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">Hora Inicio</label><input className="form-input" type="time" value={formData.hora_inicio} onChange={e => setFormData(p => ({ ...p, hora_inicio: e.target.value }))} /></div>
                            <div className="form-group"><label className="form-label">Hora Fin</label><input className="form-input" type="time" value={formData.hora_fin} onChange={e => setFormData(p => ({ ...p, hora_fin: e.target.value }))} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>Programar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
