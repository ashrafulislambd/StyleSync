import { NavLink } from 'react-router-dom'

const navItems = [
    { to: '/', icon: '🏠', label: 'Dashboard' },
    { to: '/users', icon: '👤', label: 'Users' },
    { to: '/clothes', icon: '👗', label: 'Clothes' },
    { to: '/accessories', icon: '💍', label: 'Accessories' },
    { to: '/outfits', icon: '✨', label: 'Outfits' },
    { to: '/laundry', icon: '🫧', label: 'Laundry' },
    { to: '/weather', icon: '🌤️', label: 'Weather' },
    { to: '/analytics', icon: '📊', label: 'Analytics' },
]

export default function Navbar() {
    return (
        <nav className="sidebar">
            <div className="sidebar-brand">
                <span className="brand-icon">👗</span>
                <span className="brand-name">StyleSync</span>
            </div>
            <ul className="nav-list">
                {navItems.map(({ to, icon, label }) => (
                    <li key={to}>
                        <NavLink
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{icon}</span>
                            <span className="nav-label">{label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
            <div className="sidebar-footer">
                <p>StyleSync v1.0</p>
            </div>

            <style>{`
        .sidebar {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: var(--sidebar-w);
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          padding: 0 0 16px;
        }
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 24px 20px 20px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 12px;
        }
        .brand-icon { font-size: 24px; }
        .brand-name {
          font-size: 18px;
          font-weight: 800;
          background: var(--grad-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }
        .nav-list { list-style: none; flex: 1; padding: 0 10px; }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all var(--t-fast);
          margin-bottom: 2px;
        }
        .nav-item:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .nav-item.active {
          background: rgba(139,92,246,0.15);
          color: var(--purple-400);
          border: 1px solid rgba(139,92,246,0.2);
        }
        .nav-icon { font-size: 18px; width: 22px; text-align: center; }
        .sidebar-footer {
          padding: 12px 20px 0;
          color: var(--text-muted);
          font-size: 11px;
          border-top: 1px solid var(--border);
        }
      `}</style>
        </nav>
    )
}
