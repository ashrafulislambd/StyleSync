import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { getAllOutfits, addOutfit, generateOutfit } from '../api/outfits'
import { getAllClothes } from '../api/clothes'
import { getAllAccessories } from '../api/accessories'
import { getUsers } from '../api/users'

function OutfitCard({ outfit }) {
    const items = outfit.clothingItems || []
    const accs = outfit.accessories || []
    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontWeight: 700 }}>{outfit.name || 'Outfit'}</p>
                {outfit.weatherCondition && (
                    <span className="badge badge-cyan">{outfit.weatherCondition}</span>
                )}
            </div>
            {outfit.outfitImages?.[0]?.url && (
                <img src={outfit.outfitImages[0].url} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />
            )}
            <p className="form-label" style={{ marginBottom: 6 }}>Clothing Items</p>
            <div className="tags" style={{ marginBottom: 12 }}>
                {items.length === 0
                    ? <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>None</span>
                    : items.map(c => <span key={c._id} className="tag">👗 {c.name || c._id}</span>)
                }
            </div>
            <p className="form-label" style={{ marginBottom: 6 }}>Accessories</p>
            <div className="tags" style={{ marginBottom: 12 }}>
                {accs.length === 0
                    ? <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>None</span>
                    : accs.map(a => <span key={a._id} className="tag">💍 {a.name || a._id}</span>)
                }
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Worn {outfit.wearCount}× · {new Date(outfit.createdAt).toLocaleDateString()}</p>
        </div>
    )
}

function AddOutfitForm({ users, clothes, accessories, onSubmit, loading }) {
    const [form, setForm] = useState({ name: '', user: '', weatherCondition: '', clothingItems: [], accessories: [] })
    const [files, setFiles] = useState([])
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
    const toggle = (key, id) => set(key, form[key].includes(id) ? form[key].filter(x => x !== id) : [...form[key], id])

    const handleSubmit = (e) => {
        e.preventDefault()
        const fd = new FormData()
        fd.append('name', form.name)
        fd.append('user', form.user)
        if (form.weatherCondition) fd.append('weatherCondition', form.weatherCondition)
        fd.append('clothingItems', JSON.stringify(form.clothingItems))
        fd.append('accessories', JSON.stringify(form.accessories))
        files.forEach(f => fd.append('outfitImages', f))
        onSubmit(fd)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Weekend Casual" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Weather Condition</label>
                        <input className="input" value={form.weatherCondition} onChange={e => set('weatherCondition', e.target.value)} placeholder="sunny" />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">User *</label>
                    <select className="select" required value={form.user} onChange={e => set('user', e.target.value)}>
                        <option value="">Select user</option>
                        {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Clothing Items</label>
                    <div className="tags" style={{ marginTop: 4, maxHeight: 120, overflowY: 'auto' }}>
                        {clothes.map(c => (
                            <button type="button" key={c._id}
                                className={`btn btn-sm ${form.clothingItems.includes(c._id) ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => toggle('clothingItems', c._id)}>{c.name} ({c.category})</button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Accessories</label>
                    <div className="tags" style={{ marginTop: 4, maxHeight: 100, overflowY: 'auto' }}>
                        {accessories.map(a => (
                            <button type="button" key={a._id}
                                className={`btn btn-sm ${form.accessories.includes(a._id) ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => toggle('accessories', a._id)}>{a.name}</button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Outfit Images</label>
                    <input type="file" multiple accept="image/*" onChange={e => setFiles(Array.from(e.target.files))} style={{ color: 'var(--text-secondary)', fontSize: 13 }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Create Outfit'}</button>
            </div>
        </form>
    )
}

export default function Outfits() {
    const [outfits, setOutfits] = useState([])
    const [users, setUsers] = useState([])
    const [clothes, setClothes] = useState([])
    const [accessories, setAccessories] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null)
    const [saving, setSaving] = useState(false)
    const [genUser, setGenUser] = useState('')
    const [generating, setGenerating] = useState(false)

    const load = async () => {
        try {
            const [o, u, c, a] = await Promise.all([getAllOutfits(), getUsers(), getAllClothes(), getAllAccessories()])
            setOutfits(o.data); setUsers(u.data); setClothes(c.data); setAccessories(a.data)
        } catch (e) { toast.error(e.message) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const handleCreate = async (fd) => {
        setSaving(true)
        try { await addOutfit(fd); toast.success('Outfit created!'); setModal(null); load() }
        catch (e) { toast.error(e.message) }
        finally { setSaving(false) }
    }

    const handleGenerate = async () => {
        if (!genUser) return toast.error('Select a user first')
        setGenerating(true)
        try {
            await generateOutfit(genUser)
            toast.success('Outfit generated! 🎉')
            load()
        } catch (e) { toast.error(e.message) }
        finally { setGenerating(false) }
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Outfits</h1>
                    <p className="page-subtitle">{outfits.length} outfits created</p>
                </div>
                <div className="actions">
                    <button className="btn btn-secondary" onClick={() => setModal('create')}>＋ Manual</button>
                    <button className="btn btn-primary" onClick={() => setModal('generate')}>✨ Generate</button>
                </div>
            </div>

            {loading ? <Spinner /> : outfits.length === 0
                ? <div className="empty-state"><div className="icon">✨</div><p>No outfits yet — generate your first!</p></div>
                : <div className="grid-auto">{outfits.map(o => <OutfitCard key={o._id} outfit={o} />)}</div>
            }

            {modal === 'generate' && (
                <Modal title="✨ Generate Smart Outfit" onClose={() => setModal(null)}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
                        The AI will pick the best outfit based on weather, season, and available clothes for the selected user.
                    </p>
                    <div className="form-group" style={{ marginBottom: 20 }}>
                        <label className="form-label">Select User *</label>
                        <select className="select" value={genUser} onChange={e => setGenUser(e.target.value)}>
                            <option value="">Choose user…</option>
                            {users.map(u => <option key={u._id} value={u._id}>{u.name} — {u.location}</option>)}
                        </select>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleGenerate} disabled={generating}>
                        {generating ? 'Generating…' : '✨ Generate Outfit'}
                    </button>
                </Modal>
            )}

            {modal === 'create' && (
                <Modal title="Create Outfit Manually" onClose={() => setModal(null)}>
                    <AddOutfitForm users={users} clothes={clothes} accessories={accessories} onSubmit={handleCreate} loading={saving} />
                </Modal>
            )}
        </div>
    )
}
