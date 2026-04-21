'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { calcularEdad, nombreCompleto, formatFecha, STATUS_BADGE, STATUS_LABELS } from '@/lib/utils/business-rules';
import type { Alumno, Tutor } from '@/lib/types/database';
import '../../shared.css';

export const dynamic = 'force-dynamic';

export default function AlumnoProfilePage() {
    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [alumno, setAlumno] = useState<Alumno | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAlumno = async () => {
            try {
                const { data, error } = await supabase
                    .from('alumnos')
                    .select('*, tutor:tutores(*)')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Alumno no encontrado');
                
                setAlumno(data as Alumno);
            } catch (err: any) {
                console.error("Error fetching alumno:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchAlumno();
    }, [id, supabase]);

    const handleDelete = async () => {
        if (confirm('¿Estás totalmente seguro de eliminar este alumno? Esta acción es irreversible.')) {
            try {
                const { error } = await supabase.from('alumnos').delete().eq('id', id);
                if (error) throw error;
                router.push('/alumnos');
            } catch (err: any) {
                alert(`Error al eliminar: ${err.message}`);
            }
        }
    };

    if (loading) return <div className="loading-state">Cargando expediente...</div>;
    if (error || !alumno) return <div className="p-8 text-center text-red-500">Error: {error || 'No encontrado'}</div>;

    const nombreFull = nombreCompleto(alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno);

    return (
        <div className="notion-layout">
            <Link href="/alumnos" className="text-sm text-muted hover:text-black mb-6 inline-block">
                ← Volver a Alumnos
            </Link>

            <div className="page-header notion-header flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-400">
                            {alumno.nombre.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-1">{nombreFull}</h1>
                            <span className={`badge ${STATUS_BADGE[alumno.status]} mr-2`}>
                                {STATUS_LABELS[alumno.status]}
                            </span>
                            <span className="text-muted text-sm">Registrado: {formatFecha(alumno.created_at)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary">✏️ Editar Info</button>
                    <button className="btn btn-secondary" onClick={handleDelete} style={{color: 'var(--color-danger)'}}>🗑️ Eliminar</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Columna Principal - Perfil */}
                <div className="md:col-span-2 space-y-8">
                    
                    <section>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Datos Personales</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted uppercase tracking-wider">Fecha Nacimiento</label>
                                <p>{formatFecha(alumno.fecha_nacimiento)} <span className="text-muted">({calcularEdad(alumno.fecha_nacimiento)} años)</span></p>
                            </div>
                            <div>
                                <label className="text-xs text-muted uppercase tracking-wider">Grado Escolar</label>
                                <p>{alumno.grado_escolar || 'No especificado'}</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-red-500">Alerta Médica</h2>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800">
                            {alumno.condicion_medica || 'Ninguna condición médica registrada.'}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Historial de Grupos (Próximamente)</h2>
                        <div className="notion-empty">
                            Aquí se mostrarán los grupos a los que asiste este alumno y su historial de asistencias.
                        </div>
                    </section>

                </div>

                {/* Columna Lateral - Relaciones */}
                <div className="space-y-6">
                    <div className="notion-card bg-gray-50">
                        <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted">Tutor Responsable</h3>
                        {alumno.tutor ? (
                            <div>
                                <p className="font-medium">{alumno.tutor.nombre_padre}</p>
                                {alumno.tutor.nombre_madre && <p className="text-sm text-gray-600">{alumno.tutor.nombre_madre}</p>}
                                <div className="mt-4">
                                    <a href={`https://wa.me/${alumno.tutor.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn btn-secondary w-full text-sm bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                                        💬 {alumno.tutor.whatsapp}
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted">No tiene tutor asignado.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
