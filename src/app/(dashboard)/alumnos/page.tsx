'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { calcularEdad, nombreCompleto, formatFecha, STATUS_BADGE, STATUS_LABELS } from '@/lib/utils/business-rules';
import type { Alumno, AlumnoStatus, Tutor } from '@/lib/types/database';
import Link from 'next/link';
import '../shared.css';

export default function AlumnosPage() {
    const supabase = createClient();
    
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [tutores, setTutores] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<AlumnoStatus | 'todos'>('todos');
    const [showModal, setShowModal] = useState(false);
    const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        fecha_nacimiento: '',
        grado_escolar: '',
        condicion_medica: '',
        tutor_id: '',
        status: 'activo' as AlumnoStatus,
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data: alumnosData, error: alumnosError } = await supabase
                    .from('alumnos')
                    .select('*, tutor:tutores(*)');
                
                if (alumnosError) throw alumnosError;

                const { data: tutoresData, error: tutoresError } = await supabase
                    .from('tutores')
                    .select('*');
                
                if (tutoresError) throw tutoresError;

                setAlumnos(alumnosData as Alumno[] || []);
                setTutores(tutoresData as Tutor[] || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [supabase]);

    const filtered = useMemo(() => {
        return alumnos.filter(a => {
            const name = nombreCompleto(a.nombre, a.apellido_paterno, a.apellido_materno).toLowerCase();
            const matchSearch = name.includes(search.toLowerCase());
            const matchStatus = statusFilter === 'todos' || a.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [alumnos, search, statusFilter]);

    const openCreate = () => {
        setEditingAlumno(null);
        setFormData({
            nombre: '', apellido_paterno: '', apellido_materno: '',
            fecha_nacimiento: '', grado_escolar: '', condicion_medica: '',
            tutor_id: '', status: 'activo',
        });
        setFormError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.nombre || !formData.apellido_paterno || !formData.fecha_nacimiento) {
            setFormError('Nombre, apellido paterno y fecha de nacimiento son obligatorios.'); return;
        }
        const edad = calcularEdad(formData.fecha_nacimiento);
        if (edad < 3) { setFormError(`La edad mínima es 3 años cumplidos.`); return; }
        if (edad < 18 && !formData.tutor_id) { setFormError('Menores de 18 años requieren un tutor asociado.'); return; }

        const dbPayload = {
            nombre: formData.nombre, apellido_paterno: formData.apellido_paterno, apellido_materno: formData.apellido_materno || null,
            fecha_nacimiento: formData.fecha_nacimiento, grado_escolar: formData.grado_escolar || null,
            condicion_medica: formData.condicion_medica || null, tutor_id: formData.tutor_id || null, status: formData.status,
        };

        try {
            if (editingAlumno) {
                const { data, error } = await supabase.from('alumnos').update(dbPayload).eq('id', editingAlumno.id).select('*, tutor:tutores(*)').single();
                if (error) throw error;
                setAlumnos(prev => prev.map(a => a.id === editingAlumno.id ? (data as Alumno) : a));
            } else {
                const { data, error } = await supabase.from('alumnos').insert([dbPayload]).select('*, tutor:tutores(*)').single();
                if (error) throw error;
                setAlumnos(prev => [data as Alumno, ...prev]);
            }
            setShowModal(false);
        } catch (error: any) {
            setFormError(`Error al guardar: ${error.message}`);
        }
    };

    const getTutorName = (alumno: Alumno) => alumno.tutor?.nombre_padre || '—';
    const countByStatus = (status: AlumnoStatus) => alumnos.filter(a => a.status === status).length;

    if (loading) return <div className="loading-state">Cargando datos...</div>;

    return (
        <div className="notion-layout">
            <div className="page-header notion-header">
                <div>
                    <h1 className="page-title text-4xl font-bold">Alumnos</h1>
                    <p className="page-subtitle text-muted">Gestión de estudiantes de la academia</p>
                </div>
                <button className="btn btn-primary shadow-sm" onClick={openCreate}>+ Nuevo Alumno</button>
            </div>

            <div className="stats-grid notion-stats" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="stat-card notion-card"><div className="stat-value">{alumnos.length}</div><div className="stat-label">Total</div></div>
                <div className="stat-card notion-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>{countByStatus('activo')}</div><div className="stat-label">Activos</div></div>
                <div className="stat-card notion-card"><div className="stat-value" style={{ color: 'var(--color-warning)' }}>{countByStatus('irregular')}</div><div className="stat-label">Irregulares</div></div>
            </div>

            <div className="alumnos-filters notion-filters">
                <div className="search-wrapper notion-search">
                    <span className="search-icon">🔍</span>
                    <input type="text" className="alumnos-search" placeholder="Buscar alumno..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="filter-select notion-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as AlumnoStatus | 'todos')}>
                    <option value="todos">Todos los estatus</option><option value="activo">Activos</option><option value="irregular">Irregulares</option><option value="inactivo">Inactivos</option>
                </select>
            </div>

            {/* Notion Style List instead of classic Table */}
            <div className="notion-list-container">
                {filtered.length === 0 ? (
                    <div className="empty-state notion-empty">
                        <div className="empty-icon text-4xl">🎓</div>
                        <div className="empty-title">Sin alumnos registrados</div>
                    </div>
                ) : (
                    <div className="notion-grid">
                        {filtered.map(alumno => (
                            <Link href={`/alumnos/${alumno.id}`} key={alumno.id} className="notion-list-item">
                                <div className="item-main">
                                    <div className="item-avatar">{alumno.nombre.charAt(0)}</div>
                                    <div className="item-info">
                                        <div className="item-name font-medium">{nombreCompleto(alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno)}</div>
                                        <div className="item-meta text-sm text-muted">
                                            {calcularEdad(alumno.fecha_nacimiento)} años • {alumno.grado_escolar || 'Sin grado'} 
                                            {alumno.condicion_medica && <span className="medical-alert"> • ⚕️ Condición médica</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="item-secondary hidden md:block">
                                    <div className="text-sm text-muted">Tutor</div>
                                    <div>{getTutorName(alumno)}</div>
                                </div>
                                <div className="item-status">
                                    <span className={`badge ${STATUS_BADGE[alumno.status]}`}>{STATUS_LABELS[alumno.status]}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal remains similar but cleaner */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content notion-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title font-bold text-xl">{editingAlumno ? 'Editar Alumno' : 'Nuevo Alumno'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        {formError && <div className="form-alert form-alert-danger">⚠️ {formError}</div>}
                        <div className="form-grid">
                            <div className="form-group"><label>Nombre *</label><input className="form-input" value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} /></div>
                            <div className="form-group"><label>Apellido Paterno *</label><input className="form-input" value={formData.apellido_paterno} onChange={e => setFormData(p => ({ ...p, apellido_paterno: e.target.value }))} /></div>
                            <div className="form-group"><label>Apellido Materno</label><input className="form-input" value={formData.apellido_materno} onChange={e => setFormData(p => ({ ...p, apellido_materno: e.target.value }))} /></div>
                            <div className="form-group"><label>Fecha Nacimiento *</label><input className="form-input" type="date" value={formData.fecha_nacimiento} onChange={e => setFormData(p => ({ ...p, fecha_nacimiento: e.target.value }))} /></div>
                            <div className="form-group"><label>Tutor</label><select className="form-select" value={formData.tutor_id} onChange={e => setFormData(p => ({ ...p, tutor_id: e.target.value }))}><option value="">Sin tutor</option>{tutores.map(t => <option key={t.id} value={t.id}>{t.nombre_padre}</option>)}</select></div>
                            <div className="form-group"><label>Grado Escolar</label><input className="form-input" value={formData.grado_escolar} onChange={e => setFormData(p => ({ ...p, grado_escolar: e.target.value }))} /></div>
                            <div className="form-group full-width"><label>Condición Médica</label><textarea className="form-textarea" rows={2} value={formData.condicion_medica} onChange={e => setFormData(p => ({ ...p, condicion_medica: e.target.value }))} /></div>
                        </div>
                        <div className="modal-footer pt-4 border-t mt-4">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
