import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'
import { getWardrobeAnalytics } from '../api/analytics'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'

const COLORS = ['#8b5cf6', '#ec4899', '#22d3ee', '#34d399', '#fbbf24', '#f43f5e']

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        return (
            <div style={{ background: 'rgba(15,15,30,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, padding: '10px 16px' }}>
                <p style={{ color: '#e2e8f0', fontWeight: 600 }}>{payload[0].name}: <strong style={{ color: '#8b5cf6' }}>{payload[0].value}</strong></p>
            </div>
        )
    }
    return null
}

export default function Analytics() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getWardrobeAnalytics()
            .then(r => setData(r.data))
            .catch(e => toast.error(e.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <Spinner />

    if (!data) return (
        <div className="empty-state"><div className="icon">📊</div><p>No analytics data available</p></div>
    )

    // Category distribution of most used
    const categoryCount = {}
        ;[...(data.mostUsed || []), ...(data.leastUsed || [])].forEach(c => {
            categoryCount[c.category] = (categoryCount[c.category] || 0) + 1
        })
    const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }))

    // Bar chart data: wearCount of most-used items
    const mostUsedBar = (data.mostUsed || []).slice(0, 8).map(c => ({
        name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
        wears: c.wearCount,
        category: c.category,
    }))

    const leastUsedBar = (data.leastUsed || []).slice(0, 8).map(c => ({
        name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
        wears: c.wearCount,
        category: c.category,
    }))

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Wardrobe insights & donation suggestions</p>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 28 }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 36, fontWeight: 800, color: '#8b5cf6' }}>{data.mostUsed?.length ?? 0}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>🔥 Most Used</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>≥ 7 wears</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 36, fontWeight: 800, color: '#fbbf24' }}>{data.leastUsed?.length ?? 0}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>⚠️ Least Used</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>≤ 2 wears or 1yr old</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 36, fontWeight: 800, color: '#f43f5e' }}>{data.donationSuggestions?.length ?? 0}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>🎁 Donate</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Suggested donations</p>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                    <h2 className="section-title">🔥 Most Used Items</h2>
                    {mostUsedBar.length === 0
                        ? <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No items with ≥ 7 wears yet</p>
                        : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={mostUsedBar} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-30} textAnchor="end" />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="wears" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )
                    }
                </div>

                <div className="card">
                    <h2 className="section-title">⚠️ Least Used Items</h2>
                    {leastUsedBar.length === 0
                        ? <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>All items are well used!</p>
                        : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={leastUsedBar} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-30} textAnchor="end" />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="wears" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )
                    }
                </div>
            </div>

            {categoryData.length > 0 && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <h2 className="section-title">📊 Category Distribution</h2>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: 'rgba(139,92,246,0.4)' }}>
                                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend formatter={(v) => <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {data.donationSuggestions?.length > 0 && (
                <div className="card">
                    <h2 className="section-title">🎁 Donation Suggestions</h2>
                    <div className="table-wrapper" style={{ border: 'none' }}>
                        <table>
                            <thead><tr><th>Item</th><th>Category</th><th>Wears</th><th>Last Worn</th><th>Status</th></tr></thead>
                            <tbody>
                                {data.donationSuggestions.map(c => (
                                    <tr key={c._id}>
                                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                                        <td><span className="badge badge-gray">{c.category}</span></td>
                                        <td>{c.wearCount}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{c.lastWorn ? new Date(c.lastWorn).toLocaleDateString() : 'Never'}</td>
                                        <td><span className={`badge ${c.status === 'donated' ? 'badge-amber' : 'badge-rose'}`}>{c.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
