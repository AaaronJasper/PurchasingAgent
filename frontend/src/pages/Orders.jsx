import { useState, useEffect } from 'react'
import { ordersApi, platformsApi, shippingMethodsApi, purchaseGroupsApi, productsApi } from '../api'

const EMPTY_FORM = {
  purchase_group_id: '',
  customer_name: '',
  platform_id: '',
  deposit: '',
  account_last5: '',
  shipping_method_id: '',
  shipping_number: '',
  shipping_status: false,
  is_finished: false,
  note: '',
  ordered_at: '',
}

const EMPTY_ITEM = { product_id: '', quantity: 1 }

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [platforms, setPlatforms] = useState([])
  const [shippingMethods, setShippingMethods] = useState([])
  const [purchaseGroups, setPurchaseGroups] = useState([])
  const [products, setProducts] = useState([])
  const [filterGroupId, setFilterGroupId] = useState('')
  const [modal, setModal] = useState(null) // 'create' | 'edit' | 'view'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([
      ordersApi.list(),
      platformsApi.list(),
      shippingMethodsApi.list(),
      purchaseGroupsApi.list(),
      productsApi.list(),
    ]).then(([o, p, s, g, pr]) => {
      setOrders(o)
      setPlatforms(p)
      setShippingMethods(s)
      setPurchaseGroups(g)
      setProducts(pr)
    })
  }, [])

  async function fetchOrders() {
    setOrders(await ordersApi.list())
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setItems([{ ...EMPTY_ITEM }])
    setSelected(null)
    setError(null)
    setModal('create')
  }

  function openEdit(order) {
    setForm({
      purchase_group_id: order.purchase_group_id ?? '',
      customer_name: order.customer_name,
      platform_id: order.platform_id ?? '',
      deposit: order.deposit ?? '',
      account_last5: order.account_last5 ?? '',
      shipping_method_id: order.shipping_method_id ?? '',
      shipping_number: order.shipping_number ?? '',
      shipping_status: order.shipping_status ?? false,
      is_finished: order.is_finished ?? false,
      note: order.note ?? '',
      ordered_at: order.ordered_at ? order.ordered_at.slice(0, 10) : '',
    })
    setItems(
      order.items?.length
        ? order.items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
        : [{ ...EMPTY_ITEM }]
    )
    setSelected(order)
    setError(null)
    setModal('edit')
  }

  function openView(order) {
    setSelected(order)
    setModal('view')
  }

  function closeModal() {
    setModal(null)
    setSelected(null)
    setError(null)
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function addItem() {
    setItems(prev => [...prev, { ...EMPTY_ITEM }])
  }

  function removeItem(index) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function updateItem(index, field, value) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...form,
        purchase_group_id: Number(form.purchase_group_id),
        platform_id: Number(form.platform_id),
        shipping_method_id: Number(form.shipping_method_id),
        deposit: form.deposit !== '' ? parseFloat(form.deposit) : null,
        account_last5: form.account_last5 || null,
        shipping_number: form.shipping_number || null,
        note: form.note || null,
        items: items
          .filter(i => i.product_id)
          .map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })),
      }
      if (modal === 'create') {
        await ordersApi.create(payload)
      } else {
        await ordersApi.update(selected.id, payload)
      }
      await fetchOrders()
      closeModal()
    } catch {
      setError('Something went wrong. Check all required fields.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(order) {
    if (!confirm(`Delete order #${order.id} for "${order.customer_name}"?`)) return
    try {
      await ordersApi.remove(order.id)
      setOrders(os => os.filter(o => o.id !== order.id))
    } catch {
      alert('Failed to delete.')
    }
  }

  const displayed = filterGroupId
    ? orders.filter(o => String(o.purchase_group_id) === filterGroupId)
    : orders

  const groupName = (id) => purchaseGroups.find(g => g.id === id)?.name ?? '—'
  const platformName = (id) => platforms.find(p => p.id === id)?.name ?? '—'
  const shippingName = (id) => shippingMethods.find(s => s.id === id)?.name ?? '—'

  return (
    <>
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Order</button>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          <label>Filter by Group:</label>
          <select value={filterGroupId} onChange={e => setFilterGroupId(e.target.value)}>
            <option value="">All Groups</option>
            {purchaseGroups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="card">
          <table>

            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Group</th>
                <th>Platform</th>
                <th>Shipping</th>
                <th>Shipped</th>
                <th>Finished</th>
                <th>Deposit</th>
                <th>Ordered At</th>
                <th>Items</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayed.length === 0 && (
                <tr><td colSpan={11}><div className="empty">No orders found.</div></td></tr>
              )}
              {displayed.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td><strong>{o.customer_name}</strong></td>
                  <td>{groupName(o.purchase_group_id)}</td>
                  <td>{platformName(o.platform_id)}</td>
                  <td>{shippingName(o.shipping_method_id)}</td>
                  <td>
                    <span className={`badge badge-${o.shipping_status}`}>
                      {o.shipping_status ? 'Shipped' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${o.is_finished}`}>
                      {o.is_finished ? 'Finished' : 'Ongoing'}
                    </span>
                  </td>
                  <td>{o.deposit != null ? `$${Number(o.deposit).toFixed(2)}` : '—'}</td>
                  <td>{o.ordered_at ? o.ordered_at.slice(0, 10) : '—'}</td>
                  <td>{o.items?.length ?? 0}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openView(o)}>View</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(o)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-summary">
            <span>{displayed.length} order{displayed.length !== 1 ? 's' : ''}</span>
            <span>
              Total: <strong>
                ${displayed.reduce((sum, o) => sum + (o.items ?? []).reduce((s, i) => s + Number(i.total_price), 0), 0).toFixed(2)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selected.id} — {selected.customer_name}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-row">
                  <span className="detail-label">Customer</span>
                  <span className="detail-value">{selected.customer_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Purchase Group</span>
                  <span className="detail-value">{groupName(selected.purchase_group_id)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Platform</span>
                  <span className="detail-value">{platformName(selected.platform_id)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ordered At</span>
                  <span className="detail-value">{selected.ordered_at ? selected.ordered_at.slice(0, 10) : '—'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Deposit</span>
                  <span className="detail-value">{selected.deposit != null ? `$${Number(selected.deposit).toFixed(2)}` : '—'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Account Last 5</span>
                  <span className="detail-value">{selected.account_last5 ?? '—'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Shipping Method</span>
                  <span className="detail-value">{shippingName(selected.shipping_method_id)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Shipping Number</span>
                  <span className="detail-value">{selected.shipping_number ?? '—'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Shipping Status</span>
                  <span className="detail-value">
                    <span className={`badge badge-${selected.shipping_status}`}>
                      {selected.shipping_status ? 'Shipped' : 'Pending'}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Finished</span>
                  <span className="detail-value">
                    <span className={`badge badge-${selected.is_finished}`}>
                      {selected.is_finished ? 'Finished' : 'Ongoing'}
                    </span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Note</span>
                  <span className="detail-value">{selected.note ?? '—'}</span>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div className="items-section">
                  <div className="items-section-header">
                    <span>Order Items ({selected.items?.length ?? 0})</span>
                  </div>
                  {selected.items?.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.items.map(item => (
                          <tr key={item.id}>
                            <td>{item.product_name}</td>
                            <td>{item.quantity}</td>
                            <td>${Number(item.unit_price).toFixed(2)}</td>
                            <td><strong>${Number(item.total_price).toFixed(2)}</strong></td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Grand Total</td>
                          <td>
                            <strong>
                              ${selected.items.reduce((sum, i) => sum + Number(i.total_price), 0).toFixed(2)}
                            </strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty">No items.</div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Close</button>
              <button className="btn btn-primary" onClick={() => { closeModal(); openEdit(selected) }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modal === 'create' ? 'New Order' : `Edit Order #${selected?.id}`}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label>Purchase Group *</label>
                    <select className="form-control" value={form.purchase_group_id}
                      onChange={e => set('purchase_group_id', e.target.value)} required>
                      <option value="">Select group</option>
                      {purchaseGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input className="form-control" value={form.customer_name}
                      onChange={e => set('customer_name', e.target.value)} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Platform *</label>
                    <select className="form-control" value={form.platform_id}
                      onChange={e => set('platform_id', e.target.value)} required>
                      <option value="">Select platform</option>
                      {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ordered At *</label>
                    <input type="date" className="form-control" value={form.ordered_at}
                      onChange={e => set('ordered_at', e.target.value)} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Deposit</label>
                    <input type="number" step="0.01" min="0" className="form-control" value={form.deposit}
                      onChange={e => set('deposit', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Account Last 5</label>
                    <input className="form-control" maxLength={5} value={form.account_last5}
                      onChange={e => set('account_last5', e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Shipping Method *</label>
                    <select className="form-control" value={form.shipping_method_id}
                      onChange={e => set('shipping_method_id', e.target.value)} required>
                      <option value="">Select method</option>
                      {shippingMethods.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Shipping Number</label>
                    {modal === 'create'
                      ? <input className="form-control" value="Auto-generated" disabled style={{ color: '#94a3b8' }} />
                      : <input className="form-control" value={form.shipping_number}
                          onChange={e => set('shipping_number', e.target.value)} />
                    }
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Note</label>
                    <textarea className="form-control" rows={2} value={form.note}
                      onChange={e => set('note', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>&nbsp;</label>
                    <div className="form-check">
                      <input type="checkbox" id="shipping_status" checked={form.shipping_status}
                        onChange={e => set('shipping_status', e.target.checked)} />
                      <label htmlFor="shipping_status">Shipped</label>
                    </div>
                    <div className="form-check">
                      <input type="checkbox" id="is_finished" checked={form.is_finished}
                        onChange={e => set('is_finished', e.target.checked)} />
                      <label htmlFor="is_finished">Finished</label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="items-section">
                    <div className="items-section-header">
                      <span>Order Items</span>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>+ Add Item</button>
                    </div>
                    {items.map((item, idx) => (
                      <div className="item-row" key={idx}>
                        <select className="form-control" value={item.product_id}
                          onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                          <option value="">Select product</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="number" min="0" className="form-control" placeholder="Qty"
                          value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                        <button type="button" className="item-remove" onClick={() => removeItem(idx)}>×</button>
                      </div>
                    ))}
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
