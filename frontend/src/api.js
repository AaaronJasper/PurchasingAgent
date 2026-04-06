const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

const get = (path) => request(path);
const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
const patch = (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) });
const del = (path) => request(path, { method: 'DELETE' });

export const purchaseGroupsApi = {
  list: () => get('/purchase-groups'),
  create: (data) => post('/purchase-groups', data),
  update: (id, data) => patch(`/purchase-groups/${id}`, data),
  remove: (id) => del(`/purchase-groups/${id}`),
};

export const ordersApi = {
  list: () => get('/orders'),
  create: (data) => post('/orders', data),
  update: (id, data) => patch(`/orders/${id}`, data),
  remove: (id) => del(`/orders/${id}`),
};

export const productsApi = {
  list: () => get('/products'),
  create: (data) => post('/products', data),
  update: (id, data) => patch(`/products/${id}`, data),
  remove: (id) => del(`/products/${id}`),
};

export const platformsApi = {
  list: () => get('/platforms'),
};

export const shippingMethodsApi = {
  list: () => get('/shipping-methods'),
};
