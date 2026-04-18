'use client';

import { useState, useEffect, useMemo } from 'react';
import { pb } from '@/lib/pocketbase';
import { calcularEdad, nombreCompleto, formatFecha, STATUS_BADGE, STATUS_LABELS } from '@/lib/utils/business-rules';
import type { Alumno, AlumnoStatus, Tutor } from '@/lib/types/database';
import '../shared.css';

export default function AlumnosPage() {
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [tutores, setTutores] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<AlumnoStatus | 'todos'>('todos');
    const [showModal, setShowModal] = useState(false);
    const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);

    // Form state
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

    // Fetch data from PocketBase
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Traer alumnos y expandir tutores
                const alumnosRecords = await pb.collection('alumnos').getFullList<Alumno>({
                    sort: '-created',
                    expand: 'tutor_id'
                });
                const tutoresRecords = await pb.collection('tutores').getFullList<Tutor>();
                
                setAlumnos(alumnosRecords);
                setTutores(tutoresRecords);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filtered students
    const filtered = useMemo(() => {
        return alumnos.filter(a => {
            const name = nombreCompleto(a.nombre, a.apellido_paterno, a.apellido_materno).toLowerCase();
            const matchSearch = name.includes(search.toLowerCase());
            const matchStatus = statusFilter === 'todos' || a.status === statusFilter;
            return matchSearch && matchStatus;
        });
    }, [alumnos, search, statusFilter]);

    const handleSave = async () => {
        if (!formData.nombre || !formData.apellido_paterno || !formData.fecha_nacimiento) {
            setFormError('Nombre, apellido paterno y fecha de nacimiento son obligatorios.');
            return;
        }

        try {
            const data = {
                ...formData,
                tutor_id: formData.tutor_id || null,
            };

            if (editingAlumno) {
                const record = await pb.collection('alumnos').update(editingAlumno.id, data);
                setAlumnos(prev => prev.map(a => a.id === record.id ? { ...record } as Alumno : a));
            } else {
                const record = await pb.collection('alumnos').create(data);
                setAlumnos(prev => [{ ...record } as Alumno, ...prev]);
            }
            setShowModal(false);
        } catch (error: any) {
            setFormError(error.message || 'Error al guardar el alumno.');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este alumno?')) {
            try {
                await pb.collection('alumnos').delete(id);
                setAlumnos(prev => prev.filter(a => a.id !== id));
            } catch (error) {
                alert('Error al eliminar el alumno.');
            }
        }
    };

    const getTutorName = (alumno: Alumno) => {
        // En PocketBase, los datos expandidos vienen en @expand
        const expandedTutor = (alumno as any).expand?.tutor_id;
        if (expandedTutor) return expandedTutor.nombre_padre;
        return '—';
    };

    if (loading) return <div className="loading-state">Cargando alumnos...</div>;

    return (
        <>
            <div className="page-header">
                <div><h1 className="page-title">Alumnos</h1><p className="page-subtitle">Gestión de alumnos en PocketBase</p></div>
                <button className="btn btn-primary" onClick={() => { setEditingAlumno(null); setShowModal(true); }}>+ Nuevo Alumno</button>
            </div>

            {/* Listado de alumnos... (similar al anterior pero usando los nuevos datos) */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr><th>Alumno</th><th>Edad</th><th>Tutor</th><th>Estatus</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map(alumno => (
                            <tr key={alumno.id}>
                                <td>{nombreCompleto(alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno)}</td>
                                <td>{calcularEdad(alumno.fecha_nacimiento)} años</td>
                                <td>{getTutorName(alumno)}</td>
                                <td><span className={`badge ${STATUS_BADGE[alumno.status]}`}>{STATUS_LABELS[alumno.status]}</span></td>
                                <td>
                                    <button className="btn btn-ghost" onClick={() => { setEditingAlumno(alumno); setFormData({ ...alumno, tutor_id: alumno.tutor_id || '' }); setShowModal(true); }}>✏️</button>
                                    <button className="btn btn-ghost" onClick={() => handleDelete(alumno.id)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de creación/edición... */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        {/* Formulario simplificado */}
                        <div className="form-group">
                            <label>Nombre</label>
                            <input className="form-input" value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label>Tutor</label>
                            <select className="form-select" value={formData.tutor_id} onChange={e => setFormData(p => ({ ...p, tutor_id: e.target.value }))}>
                                <option value="">Sin tutor</option>
                                {tutores.map(t => <option key={t.id} value={t.id}>{t.nombre_padre}</option>)}
                            </select>
                        </div>
                        <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}
        </>
    );
}
