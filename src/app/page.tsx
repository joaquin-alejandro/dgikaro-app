'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
  return (
    <DashboardLayout userRole="admin" userName="Administrador">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general de la academia</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)' }}>
            🎓
          </div>
          <div className="stat-value">0</div>
          <div className="stat-label">Alumnos Activos</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            📝
          </div>
          <div className="stat-value">0</div>
          <div className="stat-label">Inscripciones del Mes</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            💰
          </div>
          <div className="stat-value">$0</div>
          <div className="stat-label">Ingresos Hoy</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
            👥
          </div>
          <div className="stat-value">0</div>
          <div className="stat-label">Grupos Activos</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Actividad Reciente</h3>
          </div>
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">Sin actividad reciente</div>
            <p className="text-sm text-muted">Las inscripciones y pagos aparecerán aquí</p>
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Alertas</h3>
            <span className="badge badge-neutral">0</span>
          </div>
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <div className="empty-title">Sin alertas pendientes</div>
            <p className="text-sm text-muted">Faltas, pagos vencidos y cupos aparecerán aquí</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
