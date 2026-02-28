import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { getAllLaundry, addLaundry, updateLaundry } from '../api/laundry'
import { getAllClothes } from '../api/clothes'
import { getUsers } from '../api/users'

const STATUSES = ['pending', 'washing', 'drying', 'done']

function statusBadge(s) {
    const m = { pending: 'badge-amber', washing: 'badge-cyan', drying: 'badge-purple', done: 'badge-green' }
    return m[s] || 'badge-gray'
}

function LaundryForm({ users, clothes, onSubmit, loading }) {
    const [form, setForm] = useState({ user: '', items: [], scheduledDate: '' })
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
    const toggleItem = (id) => set('items', form.items.includes(id) ? form.items.filter(x => x !== id) : [...form.items, id])
    const userClothes = form.user ? clothes.filter(c => (c.user?._id || c.user) === form.user) : []

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({ user: form.user, items: form.items, scheduledDate: form.scheduledDate || undefined })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">User *</label>
                        <select className="select" required value={form.user} onChange={e => { set('user', e.target.value); set('items', []) }}>
                            <option value="">Select user</option>
                            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Scheduled Date</label>
                        <input type="date" className="input" value={form.scheduledDate} onChange={e => set('scheduledDate', e.target.value)} />
                    </div>
                </div>
                {form.user && (
                    <div className="form-group">
                        <label className="form-label">Select Clothes to Add</label>
                        {userClothes.length === 0
                            ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No active clothes for this user</p>
                            : (
                                <div className="tags" style={{ marginTop: 4, maxHeight: 120, overflowY: 'auto' }}>
                                    {userClothes.filter(c => c.status === 'active').map(c => (
                                        <button type="button" key={c._id}
                                            className={`btn btn-sm ${form.items.includes(c._id) ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => toggleItem(c._id)}>{c.name}</button>
                                    ))}
                                </div>
                            )
                        }
                    </div>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Add to Laundry'}</button>
            </div>
        </form>
    )
}

export default function Laundry() {
    const [laundry, setLaundry] = useState([])
    const [users, setUsers] = useState([])
    const [clothes, setClothes] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [filterUser, setFilterUser] = useState('')

    const load = async () => {
        try {
            const [l, u, c] = await Promise.all([getAllLaundry(filterUser || undefined), getUsers(), getAllClothes()])
            setLaundry(l.data); setUsers(u.data); setClothes(c.data)
        } catch (e) { toast.error(e.message) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [filterUser])

    const handleCreate = async (data) => {
        setSaving(true)
        try { await addLaundry(data); toast.success('Added to laundry!'); setModal(false); load() }
        catch (e) { toast.error(e.message) }
        finally { setSaving(false) }
    }

    const nextStatus = (s) => {
        const idx = STATUSES.indexOf(s)
        return idx < STATUSES.length - 1 ? STATUSES[idx + 1] : null
    }

    const handleAdvance = async (id, current) => {
        const next = nextStatus(current)
        if (!next) return
        try { await updateLaundry(id, { status: next }); toast.success(`Status → ${next}`); load() }
        catch (e) { toast.error(e.message) }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Laundry</h1>
                    <p className="page-subtitle">{laundry.length} laundry sessions</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal(true)}>＋ New Laundry</button>
            </div>

            <div className="toolbar">
                <select className="select" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                    <option value="">All users</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
            </div>

            {loading ? <Spinner /> : laundry.length === 0
                ? <div className="empty-state"><div className="icon">🫧</div><p>No laundry sessions</p></div>
                : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {laundry.map(l => (
                            <div key={l._id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div>
                                        <p style={{ fontWeight: 700, marginBottom: 4 }}>
                                            {l.user?.name || 'Unknown'}'s Laundry
                                        </p>
                                        {l.scheduledDate && (
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                📅 {new Date(l.scheduledDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className={`badge ${statusBadge(l.status)}`}>{l.status}</span>
                                        {nextStatus(l.status) && (
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleAdvance(l._id, l.status)}>
                                                → {nextStatus(l.status)}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="form-label" style={{ marginBottom: 6 }}>Items ({l.items?.length || 0})</p>
                                    <div className="tags">
                                        {l.items?.map(item => (
                                            <span key={item._id || item} className="tag">👗 {item.name || item}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }

            {modal && (
                <Modal title="New Laundry Batch" onClose={() => setModal(false)}>
                    <LaundryForm users={users} clothes={clothes} onSubmit={handleCreate} loading={saving} />
                </Modal>
            )}
        </div>
    )
}
