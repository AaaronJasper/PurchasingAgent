import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import PurchaseGroups from './pages/PurchaseGroups'
import Orders from './pages/Orders'
import Products from './pages/Products'
import './App.css'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/purchase-groups" replace />} />
        <Route path="/purchase-groups" element={<PurchaseGroups />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </Layout>
  )
}
