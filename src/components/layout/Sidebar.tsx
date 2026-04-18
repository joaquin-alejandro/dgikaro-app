'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { UserRole } from '@/lib/types/database';
import './layout.css';

interface NavSection {
    title: string;
    items: {
        label: string;
        href: string;
        icon: string;
        roles: UserRole[];
    }[];
}

const navigation: NavSection[] = [
    {
        title: 'General',
        items: [
            { label: 'Dashboard', href: '/', icon: '📊', roles: ['superadmin', 'admin', 'coordinacion', 'maestro', 'recepcion'] },
        ],
    },
    {
        title: 'Personas',
        items: [
            { label: 'Alumnos', href: '/alumnos', icon: '🎓', roles: ['superadmin', 'admin', 'coordinacion', 'maestro', 'recepcion'] },
            { label: 'Tutores', href: '/tutores', icon: '👨‍👩‍👧', roles: ['superadmin', 'admin', 'recepcion'] },
            { label: 'Usuarios', href: '/usuarios', icon: '👤', roles: ['superadmin'] },
        ],
    },
    {
        title: 'Académico',
        items: [
            { label: 'Talleres', href: '/talleres', icon: '🎨', roles: ['superadmin', 'admin', 'coordinacion', 'maestro'] },
            { label: 'Maestros', href: '/maestros', icon: '👩‍🏫', roles: ['superadmin', 'admin', 'coordinacion'] },
            { label: 'Grupos', href: '/grupos', icon: '👥', roles: ['superadmin', 'admin', 'coordinacion', 'maestro'] },
            { label: 'Calendario', href: '/calendario', icon: '📅', roles: ['superadmin', 'admin', 'coordinacion', 'maestro'] },
        ],
    },
    {
        title: 'Operaciones',
        items: [
            { label: 'Inscripciones', href: '/inscripciones', icon: '📝', roles: ['superadmin', 'admin', 'recepcion'] },
            { label: 'Asistencia', href: '/asistencia', icon: '✅', roles: ['superadmin', 'admin', 'coordinacion', 'maestro'] },
            { label: 'Solicitudes', href: '/solicitudes', icon: '📋', roles: ['superadmin', 'admin', 'coordinacion', 'maestro'] },
        ],
    },
    {
        title: 'Finanzas',
        items: [
            { label: 'Pagos', href: '/pagos', icon: '💰', roles: ['superadmin', 'admin', 'recepcion'] },
            { label: 'Gastos', href: '/gastos', icon: '📤', roles: ['superadmin', 'admin'] },
            { label: 'Becas', href: '/becas', icon: '🏅', roles: ['superadmin', 'admin'] },
        ],
    },
];

interface SidebarProps {
    userRole?: UserRole;
    userName?: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ userRole = 'admin', userName = 'Admin', isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    const filteredNav = navigation
        .map(section => ({
            ...section,
            items: section.items.filter(item => item.roles.includes(userRole)),
        }))
        .filter(section => section.items.length > 0);

    const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={onClose}
            />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="sidebar-brand-logo">D</div>
                    <div>
                        <div className="sidebar-brand-text">D&apos;gikaro</div>
                        <div className="sidebar-brand-subtitle">Academia de Arte</div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {filteredNav.map(section => (
                        <div key={section.title}>
                            <div className="sidebar-section-title">{section.title}</div>
                            {section.items.map(item => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/' && pathname.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                                        onClick={onClose}
                                    >
                                        <span className="sidebar-link-icon">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* User Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">{initials}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{userName}</div>
                            <div className="sidebar-user-role">{userRole}</div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
