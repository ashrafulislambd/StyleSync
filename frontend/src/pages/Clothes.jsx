import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { getAllClothes, addClothes, updateClothes, deleteClothes } from '../api/clothes'
import { getUsers } from '../api/users'

const CATEGORIES = ['top', 'bottom', 'dress', 'suit', 'outerwear', 'shoes', 'other']
const STATUSES = ['active', 'donated', 'sold']

function categoryBadge(cat) {
    const map = { top: 'badge-cyan', bottom: 'badge-purple', dress: 'badge-pink', suit: 'badge-amber', outerwear: 'badge-green', shoes: 'badge-rose', other: 'badge-gray' }
    return map[cat] || 'badge-gray'
}
function statusBadge(s) {
    return s === 'active' ? 'badge-green' : s === 'donated' ? 'badge-amber' : 'badge-rose'
}

function ClothesForm({ initial = {}, users, onSubmit, loading }) {
    const [form, setForm] = useState({
        name: '', category: 'top', color: '', season: '', occasion: '', status: 'active', user: '', ...initial,
        season: Array.isArray(initial.season) ? initial.season.join(', ') : (initial.season || ''),
        occasion: Array.isArray(initial.occasion) ? initial.occasion.join(', ') : (initial.occasion || ''),
    })
    const [files, setFiles] = useState([])
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = (e) => {
        e.preventDefault()
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => v !== undefined && v !== '' && fd.append(k, v))
        files.forEach(f => fd.append('images', f))
        onSubmit(fd)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Blue Denim Jacket" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Color *</label>
                        <input className="input" required value={form.color} onChange={e => set('color', e.target.value)} placeholder="Navy Blue" />
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select className="select" value={form.category} onChange={e => set('category', e.target.value)}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Season (comma-separated)</label>
                        <input className="input" value={form.season} onChange={e => set('season', e.target.value)} placeholder="Summer, Spring" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Occasion (comma-separated)</label>
                        <input className="input" value={form.occasion} onChange={e => set('occasion', e.target.value)} placeholder="casual, outdoor" />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Owner *</label>
                    <select className="select" required value={form.user?._id || form.user || ''} onChange={e => set('user', e.target.value)}>
                        <option value="">Select a user</option>
                        {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Images (up to 5)</label>
                    <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files))} style={{ color: 'var(--text-secondary)', fontSize: 13 }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
            </div>
        </form>
    )
}

export default function Clothes() {
    const [items, setItems] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [filterCat, setFilterCat] = useState('')
    const [filterUser, setFilterUser] = useState('')

    const load = async () => {
        try {
            const [c, u] = await Promise.all([getAllClothes(filterUser || undefined), getUsers()])
            setItems(c.data)
            setUsers(u.data)
        } catch (e) { toast.error(e.message) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [filterUser])

    const handleCreate = async (fd) => {
        setSaving(true)
        try { await addClothes(fd); toast.success('Clothes added!'); setModal(null); load() }
        catch (e) { toast.error(e.message) }
        finally { setSaving(false) }
    }

    const handleUpdate = async (id, fd) => {
        setSaving(true)
        try { await updateClothes(id, fd); toast.success('Updated!'); setModal(null); load() }
        catch (e) { toast.error(e.message) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this item?')) return
        try { await deleteClothes(id); toast.success('Deleted!'); load() }
        catch (e) { toast.error(e.message) }
    }

    const filtered = items.filter(c =>
        (c.name.toLowerCase().includes(search.toLowerCase()) || c.color.toLowerCase().includes(search.toLowerCase())) &&
        (!filterCat || c.category === filterCat)
    )

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clothes</h1>
                    <p className="page-subtitle">{items.length} items in wardrobe</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal('create')}>＋ Add Clothes</button>
            </div>

            <div className="toolbar">
                <input className="input" placeholder="Search name or color…" value={search} onChange={e => setSearch(e.target.value)} />
                <select className="select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="">All categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="select" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                    <option value="">All users</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
            </div>

            {loading ? <Spinner /> : filtered.length === 0
                ? <div className="empty-state"><div className="icon">👗</div><p>No clothes found</p></div>
                : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr><th>Item</th><th>Category</th><th>Color</th><th>Season</th><th>Status</th><th>Wears</th><th>Owner</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(c => (
                                    <tr key={c._id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                {c.images?.[0]?.url
                                                    ? <img src={c.images[0].url} alt="" className="img-thumb" />
                                                    : <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👗</div>
                                                }
                                                <span style={{ fontWeight: 600 }}>{c.name}</span>
                                            </div>
                                        </td>
                                        <td><span className={`badge ${categoryBadge(c.category)}`}>{c.category}</span></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{c.color}</td>
                                        <td><div className="tags">{c.season?.map(s => <span key={s} className="tag">{s}</span>)}</div></td>
                                        <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                                        <td style={{ color: 'var(--text-muted)' }}>{c.wearCount}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{c.user?.name || '—'}</td>
                                        <td>
                                            <div className="actions">
                                                <button className="btn btn-secondary btn-sm" onClick={() => setModal({ edit: c })}>Edit</button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Del</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            }

            {modal === 'create' && (
                <Modal title="Add Clothes" onClose={() => setModal(null)}>
                    <ClothesForm users={users} onSubmit={handleCreate} loading={saving} />
                </Modal>
            )}
            {modal?.edit && (
                <Modal title="Edit Clothes" onClose={() => setModal(null)}>
                    <ClothesForm initial={modal.edit} users={users} onSubmit={fd => handleUpdate(modal.edit._id, fd)} loading={saving} />
                </Modal>
            )}
        </div>
    )
}
