import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'
import { getUsers } from '../api/users'
import { getAllClothes } from '../api/clothes'
import { getAllAccessories } from '../api/accessories'
import { getAllOutfits } from '../api/outfits'
import { getAllLaundry } from '../api/laundry'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function load() {
            try {
                const [users, clothes, accessories, outfits, laundry] = await Promise.allSettled([
                    getUsers(), getAllClothes(), getAllAccessories(), getAllOutfits(), getAllLaundry()
                ])
                setStats({
                    users: users.value?.data?.length ?? 0,
                    clothes: clothes.value?.data?.length ?? 0,
                    accessories: accessories.value?.data?.length ?? 0,
                    outfits: outfits.value?.data?.length ?? 0,
                    laundry: laundry.value?.data?.length ?? 0,
                    activeClothes: clothes.value?.data?.filter(c => c.status === 'active').length ?? 0,
                })
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const quickActions = [
        { label: 'Add Clothes', icon: '👗', path: '/clothes', color: '#8b5cf6' },
        { label: 'Add Accessory', icon: '💍', path: '/accessories', color: '#ec4899' },
        { label: 'Generate Outfit', icon: '✨', path: '/outfits', color: '#22d3ee' },
        { label: 'Laundry Tracker', icon: '🫧', path: '/laundry', color: '#34d399' },
        { label: 'Check Weather', icon: '🌤️', path: '/weather', color: '#fbbf24' },
        { label: 'Analytics', icon: '📊', path: '/analytics', color: '#f43f5e' },
    ]

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back to your wardrobe manager</p>
                </div>
            </div>

            {loading ? <Spinner /> : (
                <>
                    <div className="stats-grid">
                        <StatCard icon="👤" label="Users" value={stats.users} color="purple" />
                        <StatCard icon="👗" label="Clothes" value={stats.clothes} color="cyan" sub={`${stats.activeClothes} active`} />
                        <StatCard icon="💍" label="Accessories" value={stats.accessories} color="pink" />
                        <StatCard icon="✨" label="Outfits" value={stats.outfits} color="green" />
                        <StatCard icon="🫧" label="Laundry" value={stats.laundry} color="amber" />
                    </div>

                    <div className="card" style={{ marginBottom: 24 }}>
                        <h2 className="section-title">Quick Actions</h2>
                        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                            {quickActions.map(a => (
                                <button
                                    key={a.path}
                                    className="quick-action-card"
                                    onClick={() => navigate(a.path)}
                                    style={{ '--qa-color': a.color }}
                                >
                                    <span className="qa-icon">{a.icon}</span>
                                    <span className="qa-label">{a.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <style>{`
        .quick-action-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 24px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--t-mid);
          font-family: inherit;
        }
        .quick-action-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: var(--qa-color);
          box-shadow: 0 0 20px color-mix(in srgb, var(--qa-color) 20%, transparent);
          transform: translateY(-2px);
        }
        .qa-icon  { font-size: 32px; }
        .qa-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
      `}</style>
        </div>
    )
}
