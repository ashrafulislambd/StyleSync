export default function StatCard({ icon, label, value, color = 'purple', sub }) {
    const colors = {
        purple: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
        cyan: { bg: 'rgba(34,211,238,0.12)', color: '#22d3ee' },
        green: { bg: 'rgba(52,211,153,0.12)', color: '#34d399' },
        amber: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
        pink: { bg: 'rgba(236,72,153,0.12)', color: '#ec4899' },
        rose: { bg: 'rgba(244,63,94,0.12)', color: '#f43f5e' },
    }
    const c = colors[color] || colors.purple
    return (
        <div className="card stat-card">
            <div className="stat-icon" style={{ background: c.bg, color: c.color }}>{icon}</div>
            <div className="stat-body">
                <p className="stat-label">{label}</p>
                <p className="stat-value" style={{ color: c.color }}>{value ?? '—'}</p>
                {sub && <p className="stat-sub">{sub}</p>}
            </div>
            <style>{`
        .stat-card { display: flex; align-items: center; gap: 16px; }
        .stat-icon { width: 52px; height: 52px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .stat-body { flex: 1; min-width: 0; }
        .stat-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .stat-value { font-size: 28px; font-weight: 800; line-height: 1.1; margin: 2px 0; }
        .stat-sub   { font-size: 12px; color: var(--text-muted); }
      `}</style>
        </div>
    )
}
