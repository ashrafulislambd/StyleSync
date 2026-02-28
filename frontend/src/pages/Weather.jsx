import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Spinner from '../components/Spinner'
import { getWeather, fetchLiveWeather } from '../api/weather'

const conditionEmojis = {
    sunny: '☀️', rainy: '🌧️', cloudy: '☁️', cold: '🥶', hot: '🔥'
}
const conditionBadge = {
    sunny: 'badge-amber', rainy: 'badge-cyan', cloudy: 'badge-gray', cold: 'badge-purple', hot: 'badge-rose'
}

export default function Weather() {
    const [saved, setSaved] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [liveCity, setLiveCity] = useState('')
    const [liveData, setLiveData] = useState(null)
    const [fetching, setFetching] = useState(false)

    const load = async () => {
        try {
            const { data } = await getWeather()
            setSaved(data)
        } catch (e) { toast.error(e.message) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const handleFetch = async (e) => {
        e.preventDefault()
        if (!liveCity.trim()) return
        setFetching(true)
        setLiveData(null)
        try {
            const { data } = await fetchLiveWeather(liveCity.trim())
            setLiveData(data)
        } catch (e) { toast.error(e.message) }
        finally { setFetching(false) }
    }

    const filtered = saved.filter(w =>
        w.location.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Weather</h1>
                    <p className="page-subtitle">Live weather + saved conditions</p>
                </div>
            </div>

            {/* Live weather fetch card */}
            <div className="card" style={{ marginBottom: 28 }}>
                <h2 className="section-title">🌍 Fetch Live Weather</h2>
                <form onSubmit={handleFetch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
                        <label className="form-label">City / Location</label>
                        <input className="input" value={liveCity} onChange={e => setLiveCity(e.target.value)} placeholder="Dhaka, London, Tokyo…" />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={fetching} style={{ marginBottom: 0 }}>
                        {fetching ? 'Fetching…' : '🔍 Get Weather'}
                    </button>
                </form>

                {liveData && (
                    <div style={{ marginTop: 20, padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                            <p style={{ fontSize: 40 }}>{conditionEmojis[liveData.conditions] || '🌡️'}</p>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 20 }}>{liveData.location || liveCity}</p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                                    Condition: <strong>{liveData.conditions || 'N/A'}</strong>
                                </p>
                                {liveData.temperature !== undefined && (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Temperature: <strong>{liveData.temperature}°C</strong></p>
                                )}
                                {liveData.description && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{liveData.description}</p>
                                )}
                            </div>
                        </div>
                        <div style={{ marginTop: 12 }} />
                        {/* Show raw data if fields are unknown */}
                        <pre style={{ color: 'var(--text-muted)', fontSize: 11, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, overflow: 'auto' }}>
                            {JSON.stringify(liveData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            {/* Saved weather */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 className="section-title" style={{ margin: 0, border: 0 }}>📋 Saved Weather Records</h2>
                    <input className="input" placeholder="Filter by location…" value={search}
                        onChange={e => setSearch(e.target.value)} style={{ maxWidth: 200 }} />
                </div>

                {loading ? <Spinner /> : filtered.length === 0
                    ? <div className="empty-state" style={{ padding: '32px 0' }}><div className="icon">🌤️</div><p>No records</p></div>
                    : (
                        <div className="table-wrapper" style={{ border: 'none' }}>
                            <table>
                                <thead>
                                    <tr><th>Location</th><th>Condition</th><th>Date</th></tr>
                                </thead>
                                <tbody>
                                    {filtered.map(w => (
                                        <tr key={w._id}>
                                            <td style={{ fontWeight: 600 }}>📍 {w.location}</td>
                                            <td>
                                                <span className={`badge ${conditionBadge[w.conditions] || 'badge-gray'}`}>
                                                    {conditionEmojis[w.conditions]} {w.conditions}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                                {new Date(w.date).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
