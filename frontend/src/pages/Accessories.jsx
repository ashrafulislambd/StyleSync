import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { getAllAccessories, addAccessory, updateAccessory, deleteAccessory } from '../api/accessories'
import { getUsers } from '../api/users'

const TYPES = ['jewelry', 'bag', 'shoes', 'hat', 'belt']
const STATUSES = ['active', 'donated']
const CLOTH_CATS = ['top', 'bottom', 'dress', 'suit', 'outerwear', 'shoes', 'other']

function typeBadge(t) {
    const m = { jewelry: 'badge-pink', bag: 'badge-purple', shoes: 'badge-cyan', hat: 'badge-amber', belt: 'badge-green' }
    return m[t] || 'badge-gray'
}

function AccForm({ initial = {}, users, onSubmit, loading }) {
    const [form, setForm] = useState({
        name: '', type: 'jewelry', color: '', status: 'active', user: '',
        compatibleWith: [], ...initial,
        compatibleWith: Array.isArray(initial.compatibleWith) ? initial.compatibleWith : []
    })
    const [file, setFile] = useState(null)
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
    const toggleCat = (c) => set('compatibleWith',
        form.compatibleWith.includes(c) ? form.compatibleWith.filter(x => x !== c) : [...form.compatibleWith, c])

    const handleSubmit = (e) => {
        e.preventDefault()
        const fd = new FormData()
        fd.append('name', form.name)
        fd.append('type', form.type)
        if (form.color) fd.append('color', form.color)
        fd.append('status', form.status)
        fd.append('user', form.user?._id || form.user)
        form.compatibleWith.forEach(c => fd.append('compatibleWith', c))
        if (file) fd.append('image', file)
        onSubmit(fd)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Pearl Necklace" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Color</label>
                        <input className="input" value={form.color} onChange={e => set('color', e.target.value)} placeholder="White" />
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Type *</label>
                        <select className="select" value={form.type} onChange={e => set('type', e.target.value)}>
                            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Compatible With (clothing categories)</label>
                    <div className="tags" style={{ marginTop: 4 }}>
                        {CLOTH_CATS.map(c => (
                            <button type="button" key={c}
                                className={`btn btn-sm ${form.compatibleWith.includes(c) ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => toggleCat(c)}>{c}</button>
                        ))}
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
                    <label className="form-label">Image</label>
                    <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ color: 'var(--text-secondary)', fontSize: 13 }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
            </div>
        </form>
    )
}

export default function Accessories() {
    const [items, setItems] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('')
    const [filterUser, setFilterUser] = useState('')

    const load = async () => {
        try {
            const [a, u] = await Promise.all([getAllAccessories(filterUser || undefined), getUsers()])
            setItems(a.data); setUsers(u.data)
        } catch (e) { toast.error(e.message) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [filterUser])

    const handleCreate = async (fd) => {
        setSaving(true)
        try { await addAccessory(fd); toast.success('Accessory added!'); setModal(null); load() }
        catch (e) { toast.error(e.message) }
        finally { setSaving(false) }
    }

    const handleUpdate = async (id, fd) => {
        setSaving(true)
        try { await updateAccessory(id, fd); toast.success('Updated!'); setModal(null); load() }
        catch (e) { toast.error(e.message) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this accessory?')) return
        try { await deleteAccessory(id); toast.success('Deleted!'); load() }
        catch (e) { toast.error(e.message) }
    }

    const filtered = items.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) &&
        (!filterType || a.type === filterType)
    )

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Accessories</h1>
                    <p className="page-subtitle">{items.length} accessories</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal('create')}>＋ Add Accessory</button>
            </div>

            <div className="toolbar">
                <input className="input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
                <select className="select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All types</option>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="select" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                    <option value="">All users</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
            </div>

            {loading ? <Spinner /> : filtered.length === 0
                ? <div className="empty-state"><div className="icon">💍</div><p>No accessories found</p></div>
                : (
                    <div className="grid-auto">
                        {filtered.map(a => (
                            <div key={a._id} className="card" style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                    {a.image?.url
                                        ? <img src={a.image.url} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover' }} />
                                        : <div style={{ width: 64, height: 64, borderRadius: 10, background: 'rgba(236,72,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>💍</div>
                                    }
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, marginBottom: 4 }}>{a.name}</p>
                                        <span className={`badge ${typeBadge(a.type)}`}>{a.type}</span>
                                    </div>
                                </div>
                                {a.color && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>🎨 {a.color}</p>}
                                {a.compatibleWith?.length > 0 && (
                                    <div style={{ marginBottom: 10 }}>
                                        <div className="tags">{a.compatibleWith.map(c => <span key={c} className="tag">{c}</span>)}</div>
                                    </div>
                                )}
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                                    Owner: {a.user?.name || '—'} · Worn {a.wearCount}×
                                </p>
                                <div className="actions">
                                    <button className="btn btn-secondary btn-sm" onClick={() => setModal({ edit: a })}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }

            {modal === 'create' && (
                <Modal title="Add Accessory" onClose={() => setModal(null)}>
                    <AccForm users={users} onSubmit={handleCreate} loading={saving} />
                </Modal>
            )}
            {modal?.edit && (
                <Modal title="Edit Accessory" onClose={() => setModal(null)}>
                    <AccForm initial={modal.edit} users={users} onSubmit={fd => handleUpdate(modal.edit._id, fd)} loading={saving} />
                </Modal>
            )}
        </div>
    )
}
