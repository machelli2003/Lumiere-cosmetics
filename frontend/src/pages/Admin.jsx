import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Users, Tag,
    ArrowLeft, Plus, Edit, Trash2, X, Save, ChevronLeft, ChevronRight
} from 'lucide-react';

const formatPrice = (n) => `GH₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

// ── Product Modal (Add / Edit) ──────────────────────────────
const ProductModal = ({ product, onClose, onSave, brands, categories }) => {
    const isEdit = !!product;
    const [form, setForm] = useState({
        name: product?.name || '',
        slug: product?.slug || '',
        description: product?.description || '',
        shortDescription: product?.shortDescription || '',
        basePrice: product?.basePrice || '',
        stock: product?.stock || '',
        brand: product?.brand?._id || product?.brand || '',
        category: product?.category?._id || product?.category || '',
        isFeatured: product?.isFeatured || false,
        isBestSeller: product?.isBestSeller || false,
        isNewArrival: product?.isNewArrival || false,
        tags: product?.tags?.join(', ') || '',
        imageUrl: product?.images?.[0]?.url || '',
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setErr('');
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await apiClient.post('/admin/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setForm(f => ({ ...f, imageUrl: res.data.data.url }));
        } catch (error) {
            setErr('Failed to upload image. Check Cloudinary settings.');
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.basePrice || !form.brand || !form.category) {
            setErr('Name, price, brand and category are required.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                basePrice: Number(form.basePrice),
                stock: Number(form.stock) || 0,
                tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
                images: form.imageUrl ? [{ url: form.imageUrl, isPrimary: true }] : (product?.images || []),
            };
            delete payload.imageUrl;

            let res;
            if (isEdit) {
                res = await apiClient.put(`/products/${product._id}`, payload);
            } else {
                res = await apiClient.post('/products', payload);
            }
            onSave(res.data.data?.product || res.data.data, isEdit);
            onClose();
        } catch (e) {
            setErr(e?.response?.data?.message || 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gold/20 sticky top-0 bg-white">
                    <h3 className="font-display text-2xl font-light">{isEdit ? 'Edit Product' : 'Add New Product'}</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    {err && <p className="text-red-800 text-xs uppercase tracking-widest font-bold bg-red-50 p-3">{err}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Product Name *</label>
                            <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Brand *</label>
                            <select name="brand" value={form.brand} onChange={handleChange} className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso bg-white">
                                <option value="">Select Brand</option>
                                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Category *</label>
                            <select name="category" value={form.category} onChange={handleChange} className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso bg-white">
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Price (GHS) *</label>
                            <input name="basePrice" type="number" value={form.basePrice} onChange={handleChange} className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Stock</label>
                            <input name="stock" type="number" value={form.stock} onChange={handleChange} className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Short Description</label>
                            <input name="shortDescription" value={form.shortDescription} onChange={handleChange} className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso resize-none" />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Image URL</label>
                            <div className="flex gap-2">
                                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="flex-1 border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso" placeholder="https://..." />
                                <label className="cursor-pointer bg-ivory-dark border border-gold/30 px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-gold/10 transition-all flex items-center justify-center min-w-[120px]">
                                    {uploading ? 'Uploading...' : 'Upload File'}
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" disabled={uploading} />
                                </label>
                            </div>
                        </div>
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Tags (comma separated)</label>
                            <input name="tags" value={form.tags} onChange={handleChange} className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso" placeholder="moisturizer, anti-aging, luxury" />
                        </div>
                        <div className="col-span-2 flex gap-6 flex-wrap">
                            {['isFeatured', 'isBestSeller', 'isNewArrival'].map(field => (
                                <label key={field} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" name={field} checked={form[field]} onChange={handleChange} className="w-4 h-4" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-espresso/60">{field.replace('is', '')}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-gold/20 flex justify-end gap-4 sticky bottom-0 bg-white">
                    <button onClick={onClose} className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest border border-espresso/20 hover:bg-ivory transition-all">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving} className="px-6 py-3 text-[10px] uppercase font-bold tracking-widest bg-espresso text-ivory hover:bg-espresso-medium transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Brand / Category Modal ──────────────────────────────────
const BrandModal = ({ item, onClose, onSave, type }) => {
    const isEdit = !!item;
    const [form, setForm] = useState({
        name: item?.name || '',
        slug: item?.slug || '',
        description: item?.description || '',
        origin: item?.origin || '',
        isFeatured: item?.isFeatured || false,
    });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const endpoint = type === 'brand' ? '/brands' : '/categories';

    const handleSubmit = async () => {
        if (!form.name) { setErr('Name is required'); return; }
        setSaving(true);
        try {
            const payload = {
                ...form,
                slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            };
            let res;
            if (isEdit) {
                res = await apiClient.put(`${endpoint}/${item._id}`, payload);
            } else {
                res = await apiClient.post(endpoint, payload);
            }
            onSave(res.data.data, isEdit);
            onClose();
        } catch (e) {
            setErr(e?.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-gold/20">
                    <h3 className="font-display text-2xl font-light">{isEdit ? `Edit ${type}` : `Add ${type}`}</h3>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    {err && <p className="text-red-800 text-xs uppercase tracking-widest font-bold">{err}</p>}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Name *</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Description</label>
                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso resize-none" />
                    </div>
                    {type === 'brand' && (
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Country of Origin</label>
                            <input value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} placeholder="e.g. France" className="w-full border border-gold/30 px-3 py-2 text-sm focus:outline-none focus:border-espresso" />
                        </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-espresso/60">Featured</span>
                    </label>
                </div>
                <div className="p-6 border-t border-gold/20 flex justify-end gap-4">
                    <button onClick={onClose} className="px-5 py-2 text-[10px] uppercase font-bold tracking-widest border border-espresso/20 hover:bg-ivory transition-all">Cancel</button>
                    <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 text-[10px] uppercase font-bold tracking-widest bg-espresso text-ivory hover:bg-espresso-medium transition-all">
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Admin Component ────────────────────────────────────
const Admin = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0, products: 0 });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productPage, setProductPage] = useState(1);
    const [productTotal, setProductTotal] = useState(0);
    const PRODUCTS_PER_PAGE = 10;

    // Modals
    const [showProductModal, setShowProductModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [editBrand, setEditBrand] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editCategory, setEditCategory] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('lu') || '{}');
        if (user.role !== 'admin') { navigate('/'); return; }

        const fetchAll = async () => {
            setLoading(true);
            try {
                const [statsRes, productsRes, ordersRes, usersRes, brandsRes, catsRes] = await Promise.all([
                    apiClient.get('/admin/dashboard'),
                    apiClient.get(`/products?limit=${PRODUCTS_PER_PAGE}&page=${productPage}`),
                    apiClient.get('/admin/orders'),
                    apiClient.get('/admin/users'),
                    apiClient.get('/products/brands'),
                    apiClient.get('/products/categories'),
                ]);
                setStats(statsRes.data.data || {});
                setProducts(productsRes.data.data || []);
                setProductTotal(productsRes.data.pagination?.total || 0);
                setOrders(ordersRes.data.data || []);
                setUsers(usersRes.data.data || []);
                setBrands(brandsRes.data.data || []);
                setCategories(catsRes.data.data || []);
            } catch (e) {
                console.error('Admin fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [navigate, productPage]);

    const handleDeleteProduct = async (id) => {
        if (!confirm('Remove this product?')) return;
        try {
            await apiClient.delete(`/products/${id}`);
            setProducts(p => p.filter(x => x._id !== id));
        } catch (e) {
            alert(e?.response?.data?.message || 'Failed to delete');
        }
    };

    const handleProductSaved = (saved, isEdit) => {
        if (isEdit) {
            setProducts(p => p.map(x => x._id === saved._id ? saved : x));
        } else {
            setProducts(p => [saved, ...p]);
        }
    };

    const handleOrderStatus = async (id, status) => {
        try {
            await apiClient.patch(`/admin/orders/${id}/status`, { status });
            setOrders(o => o.map(x => x._id === id ? { ...x, status } : x));
        } catch (e) {
            alert('Failed to update status');
        }
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center uppercase tracking-[0.4em] text-gold animate-pulse">
            Initializing Command Center...
        </div>
    );

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'brands', label: 'Brands', icon: Tag },
        { id: 'categories', label: 'Categories', icon: Tag },
    ];

    const totalProductPages = Math.ceil(productTotal / PRODUCTS_PER_PAGE);

    return (
        <div className="flex min-h-[calc(100vh-80px)] bg-ivory">
            {/* Modals */}
            {showProductModal && (
                <ProductModal
                    product={editProduct}
                    onClose={() => { setShowProductModal(false); setEditProduct(null); }}
                    onSave={handleProductSaved}
                    brands={brands}
                    categories={categories}
                />
            )}
            {showBrandModal && (
                <BrandModal
                    item={editBrand}
                    type="brand"
                    onClose={() => { setShowBrandModal(false); setEditBrand(null); }}
                    onSave={(saved, isEdit) => {
                        if (isEdit) setBrands(b => b.map(x => x._id === saved._id ? saved : x));
                        else setBrands(b => [saved, ...b]);
                    }}
                />
            )}
            {showCategoryModal && (
                <BrandModal
                    item={editCategory}
                    type="category"
                    onClose={() => { setShowCategoryModal(false); setEditCategory(null); }}
                    onSave={(saved, isEdit) => {
                        if (isEdit) setCategories(c => c.map(x => x._id === saved._id ? saved : x));
                        else setCategories(c => [saved, ...c]);
                    }}
                />
            )}

            {/* Sidebar */}
            <aside className="w-64 bg-espresso text-ivory flex-shrink-0 shadow-xl z-10">
                <div className="p-8 border-b border-ivory/10">
                    <p className="font-display text-2xl tracking-[0.2em]">LUMIÈRE</p>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60 mt-2 font-bold">Admin Console</p>
                </div>
                <nav className="py-6">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`w-full flex items-center gap-4 px-8 py-4 text-[10px] uppercase font-bold tracking-widest transition-all ${activeSection === item.id ? 'bg-ivory text-espresso border-r-4 border-gold' : 'text-ivory/40 hover:text-ivory hover:bg-white/5'}`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                    <Link to="/" className="w-full flex items-center gap-4 px-8 py-4 mt-8 text-[10px] uppercase font-bold tracking-widest text-gold hover:text-ivory no-underline transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Store
                    </Link>
                </nav>
            </aside>

            {/* Main */}
            <main className="flex-1 p-10 overflow-auto">
                <div className="max-w-6xl mx-auto">

                    {/* DASHBOARD */}
                    {activeSection === 'dashboard' && (
                        <div className="space-y-12">
                            <h2 className="font-display text-4xl font-light">Overview</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Revenue', value: formatPrice(stats.revenue), color: 'text-gold' },
                                    { label: 'Orders', value: stats.orders || 0, color: 'text-espresso' },
                                    { label: 'Users', value: stats.users || 0, color: 'text-espresso' },
                                    { label: 'Products', value: stats.products || 0, color: 'text-espresso' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white p-8 border border-gold/10 hover:border-gold/30 transition-all">
                                        <p className="text-[9px] uppercase tracking-widest text-espresso/40 mb-2 font-bold">{s.label}</p>
                                        <p className={`font-display text-3xl ${s.color}`}>{s.value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-display text-2xl font-light">Recent Orders</h3>
                                {orders.length === 0 ? (
                                    <p className="text-espresso/30 text-sm py-10 text-center">No orders yet</p>
                                ) : (
                                    <div className="bg-white border border-gold/10 overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-ivory-dark/30 text-[9px] uppercase tracking-widest font-bold">
                                                <tr>
                                                    <th className="px-6 py-4">Order</th>
                                                    <th className="px-6 py-4">Customer</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Amount</th>
                                                    <th className="px-6 py-4">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gold/10">
                                                {orders.slice(0, 5).map(order => (
                                                    <tr key={order._id} className="hover:bg-ivory/50">
                                                        <td className="px-6 py-4 font-bold text-[10px]">#{order.orderNumber}</td>
                                                        <td className="px-6 py-4">{order.user?.firstName} {order.user?.lastName}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-[9px] px-2 py-1 uppercase font-bold tracking-widest ${order.status === 'paid' || order.status === 'delivered' ? 'text-green-800 bg-green-50' : 'text-gold bg-gold/10'}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">{formatPrice(order.pricing?.total)}</td>
                                                        <td className="px-6 py-4 text-espresso/40 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PRODUCTS */}
                    {activeSection === 'products' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="font-display text-4xl font-light">Inventory</h2>
                                <button onClick={() => { setEditProduct(null); setShowProductModal(true); }} className="bg-espresso text-ivory px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-espresso-medium transition-all flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Product
                                </button>
                            </div>
                            <div className="bg-white border border-gold/10 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-ivory-dark/30 text-[9px] uppercase tracking-widest font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4 text-center">Price</th>
                                            <th className="px-6 py-4 text-center">Stock</th>
                                            <th className="px-6 py-4 text-center">Sales</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gold/10">
                                        {products.map(p => (
                                            <tr key={p._id} className="hover:bg-ivory/50">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-ivory-dark flex-shrink-0">
                                                        {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-xs max-w-[180px] truncate">{p.name}</p>
                                                        <p className="text-[10px] text-espresso/40 uppercase">{p.brand?.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-xs">{formatPrice(p.basePrice)}</td>
                                                <td className="px-6 py-4 text-center font-bold text-xs">
                                                    <span className={(p.totalStock ?? p.stock) < 10 ? 'text-red-800' : 'text-green-700'}>
                                                        {p.totalStock ?? p.stock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-espresso/40 text-xs">{p.totalSold || 0}</td>
                                                <td className="px-6 py-4 text-right space-x-3">
                                                    <button onClick={() => { setEditProduct(p); setShowProductModal(true); }} className="text-gold hover:text-espresso transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(p._id)} className="text-red-800 hover:text-red-600 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {totalProductPages > 1 && (
                                <div className="flex items-center justify-center gap-4">
                                    <button onClick={() => setProductPage(p => Math.max(1, p - 1))} disabled={productPage === 1} className="p-2 border border-gold/20 hover:border-gold disabled:opacity-30 transition-all">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Page {productPage} of {totalProductPages}</span>
                                    <button onClick={() => setProductPage(p => Math.min(totalProductPages, p + 1))} disabled={productPage === totalProductPages} className="p-2 border border-gold/20 hover:border-gold disabled:opacity-30 transition-all">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ORDERS */}
                    {activeSection === 'orders' && (
                        <div className="space-y-6">
                            <h2 className="font-display text-4xl font-light">Orders</h2>
                            {orders.length === 0 ? (
                                <p className="text-espresso/30 text-center py-20">No orders yet</p>
                            ) : (
                                <div className="bg-white border border-gold/10 overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-ivory-dark/30 text-[9px] uppercase tracking-widest font-bold">
                                            <tr>
                                                <th className="px-6 py-4">Order</th>
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4">Items</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Update</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gold/10">
                                            {orders.map(order => (
                                                <tr key={order._id} className="hover:bg-ivory/50">
                                                    <td className="px-6 py-4 font-bold text-[10px]">#{order.orderNumber}</td>
                                                    <td className="px-6 py-4 text-xs">{order.user?.firstName} {order.user?.lastName}</td>
                                                    <td className="px-6 py-4 text-espresso/40 text-xs">{order.items?.length || 0}</td>
                                                    <td className="px-6 py-4 text-xs font-medium">{formatPrice(order.pricing?.total)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-[9px] px-2 py-1 uppercase font-bold tracking-widest ${order.status === 'paid' || order.status === 'delivered' ? 'text-green-800 bg-green-50' : order.status === 'cancelled' ? 'text-red-800 bg-red-50' : 'text-gold bg-gold/10'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-espresso/40 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <select value={order.status} onChange={e => handleOrderStatus(order._id, e.target.value)} className="text-[10px] border border-gold/20 px-2 py-1 bg-white focus:outline-none focus:border-espresso">
                                                            {['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'].map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* USERS */}
                    {activeSection === 'users' && (
                        <div className="space-y-6">
                            <h2 className="font-display text-4xl font-light">Users</h2>
                            <div className="bg-white border border-gold/10 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-ivory-dark/30 text-[9px] uppercase tracking-widest font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gold/10">
                                        {users.length === 0 ? (
                                            <tr><td colSpan={4} className="px-6 py-10 text-center text-espresso/30">No users found</td></tr>
                                        ) : users.map(u => (
                                            <tr key={u._id} className="hover:bg-ivory/50">
                                                <td className="px-6 py-4 font-medium">{u.firstName} {u.lastName}</td>
                                                <td className="px-6 py-4 text-espresso/60 text-xs">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[9px] px-2 py-1 uppercase font-bold tracking-widest ${u.role === 'admin' ? 'text-gold bg-gold/10' : 'text-espresso/40 bg-ivory-dark'}`}>{u.role}</span>
                                                </td>
                                                <td className="px-6 py-4 text-espresso/40 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* BRANDS */}
                    {activeSection === 'brands' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="font-display text-4xl font-light">Brands</h2>
                                <button onClick={() => { setEditBrand(null); setShowBrandModal(true); }} className="bg-espresso text-ivory px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-espresso-medium transition-all flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Brand
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {brands.map(brand => (
                                    <div key={brand._id} className="bg-white border border-gold/10 p-6 hover:border-gold/30 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-display text-xl font-light">{brand.name}</p>
                                                {brand.origin && <p className="text-[10px] uppercase tracking-widest text-espresso/40 mt-1">{brand.origin}</p>}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditBrand(brand); setShowBrandModal(true); }} className="text-gold hover:text-espresso transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        {brand.description && <p className="text-xs text-espresso/50 leading-relaxed">{brand.description}</p>}
                                        <p className="text-[10px] uppercase tracking-widest text-espresso/30 mt-3">
                                            {products.filter(p => p.brand?._id === brand._id || p.brand === brand._id).length} products
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CATEGORIES */}
                    {activeSection === 'categories' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="font-display text-4xl font-light">Categories</h2>
                                <button onClick={() => { setEditCategory(null); setShowCategoryModal(true); }} className="bg-espresso text-ivory px-6 py-3 text-[10px] uppercase font-bold tracking-widest hover:bg-espresso-medium transition-all flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Category
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map(cat => (
                                    <div key={cat._id} className="bg-white border border-gold/10 p-6 hover:border-gold/30 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-display text-xl font-light">{cat.name}</p>
                                                <p className="text-[10px] uppercase tracking-widest text-espresso/40 mt-1">/{cat.slug}</p>
                                            </div>
                                            <button onClick={() => { setEditCategory(cat); setShowCategoryModal(true); }} className="text-gold hover:text-espresso transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {cat.description && <p className="text-xs text-espresso/50 mt-3 leading-relaxed">{cat.description}</p>}
                                        <p className="text-[10px] uppercase tracking-widest text-espresso/30 mt-3">
                                            {products.filter(p => p.category?._id === cat._id || p.category === cat._id).length} products
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default Admin;