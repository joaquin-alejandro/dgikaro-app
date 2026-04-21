'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatFecha } from '@/lib/utils/business-rules';
import type { Tutor, Alumno } from '@/lib/types/database';
import '../shared.css';

export const dynamic = 'force-dynamic';

export default function TutoresPage() {
    const supabase = createClient();

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
            setLoading(true);
            try {
                const { data: tutoresData, error: tutoresError } = await supabase
                    .from('tutores')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (tutoresError) throw tutoresError;

                const { data: alumnosData, error: alumnosError } = await supabase
                    .from('alumnos')
                    .select('*');

                if (alumnosError) throw alumnosError;

                setTutores(tutoresData as Tutor[]);
                setAlumnos(alumnosData as Alumno[]);
            } catch (error) {
                console.error("Error fetching tutores:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [supabase]);

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

        const dbPayload = {
            nombre_padre: formData.nombre_padre,
            nombre_madre: formData.nombre_madre || null,
            whatsapp: formData.whatsapp,
            tel_secundario: formData.tel_secundario || null,
            cp: formData.cp || null,
            colonia: formData.colonia || null,
        };

        try {
            if (editingTutor) {
                const { data, error } = await supabase
                    .from('tutores')
                    .update(dbPayload)
                    .eq('id', editingTutor.id)
                    .select()
                    .single();

                if (error) throw error;
                setTutores(prev => prev.map(t => t.id === editingTutor.id ? (data as Tutor) : t));
            } else {
                const { data, error } = await supabase
                    .from('tutores')
                    .insert([dbPayload])
                    .select()
                    .single();

                if (error) throw error;
                setTutores(prev => [data as Tutor, ...prev]);
            }
            setShowModal(false);
        } catch (error: any) {
            console.error("Error saving tutor:", error);
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
                const { error } = await supabase.from('tutores').delete().eq('id', id);
                if (error) throw error;
                setTutores(prev => prev.filter(t => t.id !== id));
            } catch (error: any) {
                console.error("Error deleting tutor:", error);
                alert(`Error al eliminar: ${error.message}`);
            }
        }
    };

    if (loading) return <div className="loading-state">Cargando datos desde Supabase...</div>;

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tutores</h1>
                    <p className="page-subtitle">Padres y tutores de los alumnos (Supabase)</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    + Nuevo Tutor
                </button>
            </div>

            {/* Stats */}
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

            {/* Search */}
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

            {/* Table */}
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
                                    <td>
                                        <span className="student-name">{tutor.nombre_padre}</span>
                                    </td>
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

            {/* Modal */}
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
                                <input
                                    className="form-input"
                                    type="text"
                                    value={formData.nombre_padre}
                                    onChange={e => setFormData(p => ({ ...p, nombre_padre: e.target.value }))}
                                    placeholder="Nombre completo"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Nombre de la Madre</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={formData.nombre_madre}
                                    onChange={e => setFormData(p => ({ ...p, nombre_madre: e.target.value }))}
                                    placeholder="Nombre completo"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">WhatsApp *</label>
                                <input
                                    className="form-input"
                                    type="tel"
                                    value={formData.whatsapp}
                                    onChange={e => setFormData(p => ({ ...p, whatsapp: e.target.value }))}
                                    placeholder="55 1234 5678"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Teléfono Secundario</label>
                                <input
                                    className="form-input"
                                    type="tel"
                                    value={formData.tel_secundario}
                                    onChange={e => setFormData(p => ({ ...p, tel_secundario: e.target.value }))}
                                    placeholder="Opcional"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Código Postal</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={formData.cp}
                                    onChange={e => setFormData(p => ({ ...p, cp: e.target.value }))}
                                    placeholder="06600"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Colonia</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    value={formData.colonia}
                                    onChange={e => setFormData(p => ({ ...p, colonia: e.target.value }))}
                                    placeholder="Ej: Condesa"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editingTutor ? 'Guardar Cambios' : 'Registrar Tutor'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
