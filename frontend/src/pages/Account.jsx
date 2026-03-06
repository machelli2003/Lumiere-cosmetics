import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';

const Account = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const [userRes, ordersRes] = await Promise.all([
                    apiClient.get('/auth/me'),
                    apiClient.get('/orders')
                ]);
                setUser(userRes.data.data.user);
                setOrders(ordersRes.data.data || []);
            } catch (error) {
                console.error('Account fetch error:', error);
                // Interceptor handles logout/redirect on 401
            } finally {
                setLoading(false);
            }
        };
        fetchAccountData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('lu');
        localStorage.removeItem('lt');
        window.dispatchEvent(new Event('storage'));
        navigate('/auth');
    };

    if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center uppercase tracking-widest text-espresso/40">Loading Your Sanctuary...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* Sidebar */}
                <aside className="lg:w-72 space-y-12">
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-blush-light rounded-full flex items-center justify-center text-espresso font-display text-3xl">
                            {user?.firstName?.[0]}
                        </div>
                        <div>
                            <h2 className="font-display text-2xl font-light">{user?.firstName} {user?.lastName}</h2>
                            <p className="text-xs text-espresso/40 uppercase tracking-widest">{user?.email}</p>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        <Link to="/account" className="flex items-center justify-between p-4 bg-ivory-dark text-espresso no-underline group hover:bg-gold/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 opacity-40" />
                                <span className="text-[10px] uppercase font-bold tracking-widest">Dashboard</span>
                            </div>
                            <ChevronRight className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <Link to="/orders" className="flex items-center justify-between p-4 text-espresso/60 no-underline group hover:bg-gold/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <Package className="w-4 h-4 opacity-40" />
                                <span className="text-[10px] uppercase font-bold tracking-widest">Orders</span>
                            </div>
                            <ChevronRight className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="flex items-center justify-between p-4 text-gold no-underline group hover:bg-gold/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <LayoutDashboard className={`w-4 h-4 opacity-40`} />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Admin Dashboard</span>
                                </div>
                                <ChevronRight className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 text-red-800 no-underline group hover:bg-red-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <LogOut className="w-4 h-4 opacity-40" />
                                <span className="text-[10px] uppercase font-bold tracking-widest">Sign Out</span>
                            </div>
                        </button>
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 space-y-16">
                    <div>
                        <h1 className="font-display text-4xl lg:text-5xl font-light mb-10">Account Overview</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 border border-gold/10 bg-ivory-dark/20 space-y-4 hover:border-gold/30 transition-colors">
                                <div className="flex items-center gap-3 text-gold">
                                    <Package className="w-5 h-5" />
                                    <h3 className="text-xs uppercase font-bold tracking-widest">Recent Orders</h3>
                                </div>
                                {orders.length === 0 ? (
                                    <p className="text-sm text-espresso/40">You haven't placed any orders yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.slice(0, 3).map(order => (
                                            <div key={order._id} className="flex justify-between items-center py-2 border-b border-gold/5">
                                                <div>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">#{order.orderNumber}</p>
                                                    <p className="text-[10px] text-espresso/40 italic">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`text-[9px] px-2 py-1 uppercase font-bold tracking-widest ${order.status === 'paid' ? 'bg-sage/10 text-sage' : 'bg-gold/10 text-gold'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        ))}
                                        <Link to="/orders" className="block text-[9px] uppercase font-bold tracking-widest text-gold hover:text-espresso transition-colors">
                                            View all orders →
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 border border-gold/10 bg-ivory-dark/20 space-y-4 hover:border-gold/30 transition-colors">
                                <div className="flex items-center gap-3 text-gold">
                                    <User className="w-5 h-5" />
                                    <h3 className="text-xs uppercase font-bold tracking-widest">Profile Details</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] uppercase tracking-widest text-espresso/30">Lumière Member Since</p>
                                        <p className="text-sm font-medium">{new Date(user?.createdAt).getFullYear()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] uppercase tracking-widest text-espresso/30">Member Category</p>
                                        <p className="text-sm font-medium uppercase tracking-widest">Lumière Elite</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Account;
