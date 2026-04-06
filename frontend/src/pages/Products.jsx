import { useState, useEffect } from 'react'
import { productsApi } from '../api'

const EMPTY_FORM = { name: '', cost_price: '', selling_price: '', note: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    try {
      setProducts(await productsApi.list())
    } catch {
      setError('Failed to load products.')
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setSelected(null)
    setError(null)
    setModal('create')
  }

  function openEdit(product) {
    setForm({
      name: product.name,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      note: product.note ?? '',
    })
    setSelected(product)
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
        cost_price: parseFloat(form.cost_price),
        selling_price: parseFloat(form.selling_price),
        note: form.note || null,
      }
      if (modal === 'create') {
        await productsApi.create(payload)
      } else {
        await productsApi.update(selected.id, payload)
      }
      await fetchProducts()
      closeModal()
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"?`)) return
    try {
      await productsApi.remove(product.id)
      setProducts(ps => ps.filter(p => p.id !== product.id))
    } catch {
      alert('Failed to delete.')
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Product</button>
      </div>

      <div className="page-body">
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={6}><div className="empty">No products yet.</div></td></tr>
              )}
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>${Number(p.cost_price).toFixed(2)}</td>
                  <td>${Number(p.selling_price).toFixed(2)}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.note ?? '—'}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Delete</button>
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
              <h2>{modal === 'create' ? 'New Product' : 'Edit Product'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                  <label>Name *</label>
                  <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Cost Price *</label>
                    <input type="number" step="0.01" min="0" className="form-control" value={form.cost_price}
                      onChange={e => set('cost_price', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Selling Price *</label>
                    <input type="number" step="0.01" min="0" className="form-control" value={form.selling_price}
                      onChange={e => set('selling_price', e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Note</label>
                  <textarea className="form-control" rows={2} value={form.note} onChange={e => set('note', e.target.value)} />
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
