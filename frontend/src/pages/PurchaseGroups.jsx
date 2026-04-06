import { useState, useEffect } from 'react'
import { purchaseGroupsApi } from '../api'

const EMPTY_FORM = { name: '', description: '', status: 'open', started_at: '', ended_at: '' }

export default function PurchaseGroups() {
  const [groups, setGroups] = useState([])
  const [modal, setModal] = useState(null) // 'create' | 'edit'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { fetchGroups() }, [])

  async function fetchGroups() {
    try {
      setGroups(await purchaseGroupsApi.list())
    } catch {
      setError('Failed to load purchase groups.')
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setSelected(null)
    setError(null)
    setModal('create')
  }

  function openEdit(group) {
    setForm({
      name: group.name,
      description: group.description ?? '',
      status: group.status,
      started_at: group.started_at ? group.started_at.slice(0, 10) : '',
      ended_at: group.ended_at ? group.ended_at.slice(0, 10) : '',
    })
    setSelected(group)
    setError(null)
    setModal('edit')
  }

  function closeModal() {
    setModal(null)
    setSelected(null)
    setError(null)
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...form,
        started_at: form.started_at || null,
        ended_at: form.ended_at || null,
      }
      if (modal === 'create') {
        await purchaseGroupsApi.create(payload)
      } else {
        await purchaseGroupsApi.update(selected.id, payload)
      }
      await fetchGroups()
      closeModal()
    } catch (err) {
      setError(err?.message?.name?.[0] ?? err?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(group) {
    if (!confirm(`Delete "${group.name}"?`)) return
    try {
      await purchaseGroupsApi.remove(group.id)
      setGroups(gs => gs.filter(g => g.id !== group.id))
    } catch {
      alert('Failed to delete.')
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Purchase Groups</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Group</button>
      </div>

      <div className="page-body">
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Status</th>
                <th>Started</th>
                <th>Ended</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 && (
                <tr><td colSpan={7}><div className="empty">No purchase groups yet.</div></td></tr>
              )}
              {groups.map(g => (
                <tr key={g.id}>
                  <td>{g.id}</td>
                  <td><strong>{g.name}</strong></td>
                  <td><span className={`badge badge-${g.status}`}>{g.status}</span></td>
                  <td>{g.started_at ? g.started_at.slice(0, 10) : '—'}</td>
                  <td>{g.ended_at ? g.ended_at.slice(0, 10) : '—'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.description ?? '—'}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(g)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'create' ? 'New Purchase Group' : 'Edit Purchase Group'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                  <label>Name *</label>
                  <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows={2} value={form.description} onChange={e => set('description', e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Started At</label>
                    <input type="date" className="form-control" value={form.started_at} onChange={e => set('started_at', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Ended At</label>
                    <input type="date" className="form-control" value={form.ended_at} onChange={e => set('ended_at', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
