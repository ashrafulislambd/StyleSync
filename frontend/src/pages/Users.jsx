import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'
import { getUsers, createUser, updateUser } from '../api/users'

const STYLES = ['minimalist', 'comfortable', 'formal']

function UserForm({ initial = {}, onSubmit, loading }) {
    const [form, setForm] = useState({ name: '', location: '', stylePreferences: [], ...initial })
    const [file, setFile] = useState(null)

    const toggleStyle = (s) =>
        setForm(f => ({
            ...f,
            stylePreferences: f.stylePreferences.includes(s)
                ? f.stylePreferences.filter(x => x !== s)
                : [...f.stylePreferences, s]
        }))

    const handleSubmit = (e) => {
        e.preventDefault()
        const fd = new FormData()
        fd.append('name', form.name)
        fd.append('location', form.location)
        form.stylePreferences.forEach(s => fd.append('stylePreferences', s))
        if (file) fd.append('profilePicture', file)
        onSubmit(fd)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">Name *</label>
                        <input className="input" required value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Alex Johnson" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Location *</label>
                        <input className="input" required value={form.location}
                            onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Dhaka" />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Style Preferences</label>
                    <div className="tags" style={{ marginTop: 4 }}>
                        {STYLES.map(s => (
                            <button type="button" key={s}
                                className={`btn btn-sm ${form.stylePreferences.includes(s) ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => toggleStyle(s)} style={{ textTransform: 'capitalize' }}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Profile Picture</label>
                    <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
                        style={{ color: 'var(--text-secondary)', fontSize: 13 }} />
                </div>
                <div className="modal-footer" style={{ padding: 0, marginTop: 0, border: 0 }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving…' : 'Save User'}
                    </button>
                </div>
            </div>
        </form>
    )
}

export default function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null) // null | 'create' | {edit: user}
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    const load = async () => {
        try {
            const { data } = await getUsers()
            setUsers(data)
        } catch (e) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const handleCreate = async (fd) => {
        setSaving(true)
        try {
            await createUser(fd)
            toast.success('User created!')
            setModal(null)
            load()
        } catch (e) {
            toast.error(e.message)
        } finally {
            setSaving(false)
        }
    }

    const handleUpdate = async (id, fd) => {
        setSaving(true)
        try {
            await updateUser(id, fd)
            toast.success('User updated!')
            setModal(null)
            load()
        } catch (e) {
            toast.error(e.message)
        } finally {
            setSaving(false)
        }
    }

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.location.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <p className="page-subtitle">{users.length} registered users</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModal('create')}>＋ New User</button>
            </div>

            <div className="toolbar">
                <input className="input" placeholder="Search users…" value={search}
                    onChange={e => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
            </div>

            {loading ? <Spinner /> : filtered.length === 0 ? (
                <div className="empty-state"><div className="icon">👤</div><p>No users found</p></div>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Location</th>
                                <th>Style Prefs</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {u.profilePicture?.url
                                                ? <img src={u.profilePicture.url} alt="" className="avatar" />
                                                : <div className="avatar-placeholder">{u.name[0].toUpperCase()}</div>
                                            }
                                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{u.location}</td>
                                    <td>
                                        <div className="tags">
                                            {u.stylePreferences?.map(s => (
                                                <span key={s} className="tag">{s}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button className="btn btn-secondary btn-sm"
                                                onClick={() => setModal({ edit: u })}>Edit</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal === 'create' && (
                <Modal title="New User" onClose={() => setModal(null)}>
                    <UserForm onSubmit={handleCreate} loading={saving} />
                </Modal>
            )}

            {modal?.edit && (
                <Modal title="Edit User" onClose={() => setModal(null)}>
                    <UserForm
                        initial={modal.edit}
                        onSubmit={fd => handleUpdate(modal.edit._id, fd)}
                        loading={saving}
                    />
                </Modal>
            )}
        </div>
    )
}
