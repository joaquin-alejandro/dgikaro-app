'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import type { UserRole } from '@/lib/types/database';
import './layout.css';

interface DashboardLayoutProps {
    children: React.ReactNode;
    userRole?: UserRole;
    userName?: string;
}

export default function DashboardLayout({
    children,
    userRole = 'admin',
    userName = 'Administrador'
}: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div>
            <Sidebar
                userRole={userRole}
                userName={userName}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="main-wrapper">
                {/* Top Bar */}
                <header className="topbar">
                    <div className="topbar-left">
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Abrir menú"
                        >
                            ☰
                        </button>
                    </div>

                    <div className="topbar-right">
                        <button className="topbar-btn" aria-label="Notificaciones">
                            🔔
                            <span className="topbar-btn-badge" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
