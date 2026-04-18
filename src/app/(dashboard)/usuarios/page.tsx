'use client';

import { useState, useMemo } from 'react';
import { mockUsers } from '@/lib/data/mock-data';
import { formatFecha, ROLE_LABELS } from '@/lib/utils/business-rules';
import type { User, UserRole } from '@/lib/types/database';
import '../shared.css';

const ROLE_BADGE: Record<UserRole, string> = {
    superadmin: 'badge-danger',
    admin: 'badge-warning',
    coordinacion: 'badge-info',
    maestro: 'badge-primary',
    recepcion: 'badge-neutral',
};

export default function UsuariosPage() {
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'todos'>('todos');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [formData, setFormData] = useState({
        nombre_completo: '',
        email: '',
        role: 'recepcion' as UserRole,
    });
    const [formError, setFormError] = useState('');

    const filtered = useMemo(() => {
        return users.filter(u => {
            const matchSearch = u.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase());
            const matchRole = roleFilter === 'todos' || u.role === roleFilter;
            return matchSearch && matchRole;
        });
    }, [users, search, roleFilter]);

    const openCreate = () => {
        setEditingUser(null);
        setFormData({ nombre_completo: '', email: '', role: 'recepcion' });
        setFormError('');
        setShowModal(true);
    };

    const openEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            nombre_completo: user.nombre_completo,
            email: user.email,
            role: user.role,
        });
        setFormError('');
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.nombre_completo || !formData.email) {
            setFormError('Nombre y email son obligatorios.');
            return;
        }

        // Check for duplicate email
        const isDuplicate = users.some(u =>
            u.email === formData.email && u.id !== editingUser?.id
        );
        if (isDuplicate) {
            setFormError('Ya existe un usuario con ese email.');
            return;
        }

        if (editingUser) {
            setUsers(prev => prev.map(u =>
                u.id === editingUser.id
                    ? { ...u, nombre_completo: formData.nombre_completo, email: formData.email, role: formData.role }
                    : u
            ));
        } else {
            const newUser: User = {
                id: String(Date.now()),
                nombre_completo: formData.nombre_completo,
                email: formData.email,
                password_hash: '',
                role: formData.role,
                created_at: new Date().toISOString(),
            };
            setUsers(prev => [...prev, newUser]);
        }

        setShowModal(false);
    };

    const handleDelete = (user: User) => {
        if (user.role === 'superadmin') {
            alert('No se puede eliminar al SuperAdmin.');
            return;
        }
        if (confirm(`¿Seguro que deseas eliminar a ${user.nombre_completo}?`)) {
            setUsers(prev => prev.filter(u => u.id !== user.id));
        }
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Usuarios</h1>
                    <p className="page-subtitle">Administración de accesos al sistema</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    + Nuevo Usuario
                </button>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="stat-card">
                    <div className="stat-value">{users.length}</div>
                    <div className="stat-label">Total Usuarios</div>
                </div>
                {(['superadmin', 'admin', 'coordinacion', 'maestro', 'recepcion'] as UserRole[]).map(role => (
                    <div className="stat-card" key={role}>
                        <div className="stat-value">{users.filter(u => u.role === role).length}</div>
                        <div className="stat-label">{ROLE_LABELS[role]}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="alumnos-filters">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="alumnos-search"
                        placeholder="Buscar por nombre o email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value as UserRole | 'todos')}
                >
                    <option value="todos">Todos los roles</option>
                    <option value="superadmin">Dirección</option>
                    <option value="admin">Gerencia</option>
                    <option value="coordinacion">Coordinación</option>
                    <option value="maestro">Maestro</option>
                    <option value="recepcion">Recepción</option>
                </select>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                        <div className="empty-icon">👤</div>
                                        <div className="empty-title">Sin usuarios encontrados</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filtered.map(user => (
                                <tr key={user.id}>
                                    <td><span className="student-name">{user.nombre_completo}</span></td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge ${ROLE_BADGE[user.role]}`}>
                                            {ROLE_LABELS[user.role]}
                                        </span>
                                    </td>
                                    <td>{formatFecha(user.created_at)}</td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(user)}>✏️</button>
                                            {user.role !== 'superadmin' && (
                                                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(user)}>🗑️</button>
                                            )}
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
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        {formError && <div className="form-alert form-alert-danger">⚠️ {formError}</div>}

                        <div className="form-group">
                            <label className="form-label">Nombre Completo *</label>
                            <input
                                className="form-input"
                                type="text"
                                value={formData.nombre_completo}
                                onChange={e => setFormData(p => ({ ...p, nombre_completo: e.target.value }))}
                                placeholder="Nombre completo"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input
                                className="form-input"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                placeholder="usuario@dgikaro.com"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Rol</label>
                            <select
                                className="form-select"
                                value={formData.role}
                                onChange={e => setFormData(p => ({ ...p, role: e.target.value as UserRole }))}
                            >
                                <option value="superadmin">Dirección (SuperAdmin)</option>
                                <option value="admin">Gerencia (Admin)</option>
                                <option value="coordinacion">Coordinación</option>
                                <option value="maestro">Maestro</option>
                                <option value="recepcion">Recepción</option>
                            </select>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
