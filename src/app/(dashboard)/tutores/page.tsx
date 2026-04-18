'use client';

import { useState, useMemo, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { formatFecha } from '@/lib/utils/business-rules';
import type { Tutor, Alumno } from '@/lib/types/database';
import '../shared.css';

export default function TutoresPage() {
    const [tutores, setTutores] = useState<Tutor[]>([]);
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);

    const [formData, setFormData] = useState({
        nombre_padre: '',
        nombre_madre: '',
        whatsapp: '',
        tel_secundario: '',
        cp: '',
        colonia: '',
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tutoresList, alumnosList] = await Promise.all([
                    pb.collection('tutores').getFullList<Tutor>({ sort: '-created' }),
                    pb.collection('alumnos').getFullList<Alumno>()
                ]);
                setTutores(tutoresList);
                setAlumnos(alumnosList);
            } catch (error) {
                console.error("Error cargando tutores:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = useMemo(() => {
        return tutores.filter(t => {
            const name = `${t.nombre_padre} ${t.nombre_madre || ''}`.toLowerCase();
            return name.includes(search.toLowerCase());
        });
    }, [tutores, search]);

    const getHijosCount = (tutorId: string) => {
        return alumnos.filter(a => a.tutor_id === tutorId).length;
    };

    const getHijosNames = (tutorId: string) => {
        return alumnos
            .filter(a => a.tutor_id === tutorId)
            .map(a => a.nombre)
            .join(', ');
    };

    const openCreate = () => {
        setEditingTutor(null);
        setFormData({ nombre_padre: '', nombre_madre: '', whatsapp: '', tel_secundario: '', cp: '', colonia: '' });
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (tutor: Tutor) => {
        setEditingTutor(tutor);
        setFormData({
            nombre_padre: tutor.nombre_padre,
            nombre_madre: tutor.nombre_madre || '',
            whatsapp: tutor.whatsapp,
            tel_secundario: tutor.tel_secundario || '',
            cp: tutor.cp || '',
            colonia: tutor.colonia || '',
        });
        setFormError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.nombre_padre || !formData.whatsapp) {
            setFormError('Nombre del padre/madre y WhatsApp son obligatorios.');
            return;
        }

        try {
            const data = {
                ...formData,
                nombre_madre: formData.nombre_madre || null,
                tel_secundario: formData.tel_secundario || null,
                cp: formData.cp || null,
                colonia: formData.colonia || null,
            };

            if (editingTutor) {
                const record = await pb.collection('tutores').update(editingTutor.id, data);
                setTutores(prev => prev.map(t => t.id === record.id ? { ...record } as Tutor : t));
            } else {
                const record = await pb.collection('tutores').create(data);
                setTutores(prev => [{ ...record } as Tutor, ...prev]);
            }
            setShowModal(false);
        } catch (error: any) {
            setFormError(error.message || 'Error al guardar el tutor.');
        }
    };

    const handleDelete = async (id: string) => {
        const hijosCount = getHijosCount(id);
        if (hijosCount > 0) {
            alert(`No se puede eliminar: este tutor tiene ${hijosCount} alumno(s) asociados.`);
            return;
        }
        if (confirm('¿Estás seguro de eliminar este tutor?')) {
            try {
                await pb.collection('tutores').delete(id);
                setTutores(prev => prev.filter(t => t.id !== id));
            } catch (error) {
                alert('Error al eliminar el tutor.');
            }
        }
    };

    if (loading) return <div className="loading-state">Cargando tutores...</div>;

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tutores</h1>
                    <p className="page-subtitle">Padres y tutores de los alumnos registrados en PocketBase</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    + Nuevo Tutor
                </button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card">
                    <div className="stat-value">{tutores.length}</div>
                    <div className="stat-label">Total Tutores</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{alumnos.filter(a => a.tutor_id).length}</div>
                    <div className="stat-label">Alumnos con Tutor</div>
                </div>
            </div>

            <div className="alumnos-filters">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="alumnos-search"
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Padre / Tutor</th>
                            <th>Madre</th>
                            <th>WhatsApp</th>
                            <th>Colonia</th>
                            <th>Hijos</th>
                            <th>Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                        <div className="empty-icon">👨‍👩‍👧</div>
                                        <div className="empty-title">Sin tutores encontrados</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(tutor => (
                                <tr key={tutor.id}>
                                    <td><span className="student-name">{tutor.nombre_padre}</span></td>
                                    <td>{tutor.nombre_madre || '—'}</td>
                                    <td>{tutor.whatsapp}</td>
                                    <td>{tutor.colonia || '—'}</td>
                                    <td>
                                        <div className="student-name-cell">
                                            <span className="count-badge badge badge-primary">{getHijosCount(tutor.id)}</span>
                                            <span className="student-meta">{getHijosNames(tutor.id)}</span>
                                        </div>
                                    </td>
                                    <td>{formatFecha(tutor.created_at)}</td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(tutor)}>✏️</button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(tutor.id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingTutor ? 'Editar Tutor' : 'Nuevo Tutor'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        {formError && <div className="form-alert form-alert-danger">⚠️ {formError}</div>}
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Nombre del Padre/Tutor *</label>
                                <input className="form-input" type="text" value={formData.nombre_padre} onChange={e => setFormData(p => ({ ...p, nombre_padre: e.target.value }))} placeholder="Nombre completo" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nombre de la Madre</label>
                                <input className="form-input" type="text" value={formData.nombre_madre} onChange={e => setFormData(p => ({ ...p, nombre_madre: e.target.value }))} placeholder="Nombre completo" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">WhatsApp *</label>
                                <input className="form-input" type="tel" value={formData.whatsapp} onChange={e => setFormData(p => ({ ...p, whatsapp: e.target.value }))} placeholder="55 1234 5678" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Teléfono Secundario</label>
                                <input className="form-input" type="tel" value={formData.tel_secundario} onChange={e => setFormData(p => ({ ...p, tel_secundario: e.target.value }))} placeholder="Opcional" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Código Postal</label>
                                <input className="form-input" type="text" value={formData.cp} onChange={e => setFormData(p => ({ ...p, cp: e.target.value }))} placeholder="06600" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Colonia</label>
                                <input className="form-input" type="text" value={formData.colonia} onChange={e => setFormData(p => ({ ...p, colonia: e.target.value }))} placeholder="Ej: Condesa" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>{editingTutor ? 'Guardar Cambios' : 'Registrar Tutor'}</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
