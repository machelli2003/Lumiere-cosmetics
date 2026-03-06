import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await apiClient.get('/orders');
                setOrders(data.data || []);
            } catch (error) {
                console.error('Orders fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatGHS = (n) => `GH₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'paid': return <Package className="w-4 h-4" />;
            case 'shipped': return <Truck className="w-4 h-4" />;
            case 'delivered': return <CheckCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const StatusTimeline = ({ currentStatus }) => {
        const steps = ['pending', 'paid', 'shipped', 'delivered'];
        const currentIndex = steps.indexOf(currentStatus.toLowerCase());

        return (
            <div className="flex items-center justify-between w-full max-w-sm mb-8 mt-4 mx-auto">
                {steps.map((step, i) => (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${i <= currentIndex ? 'bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'bg-gold/10'}`} />
                            <span className={`text-[8px] uppercase tracking-widest font-bold ${i <= currentIndex ? 'text-espresso' : 'text-espresso/20'}`}>
                                {step}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`flex-1 h-px transition-all duration-500 ${i < currentIndex ? 'bg-gold' : 'bg-gold/10'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-ivory">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] uppercase tracking-[0.5em] text-gold animate-pulse">Retrieving Your History...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 py-16 min-h-[80vh]">
            <Link to="/account" className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-espresso/40 hover:text-gold transition-colors mb-12 no-underline group w-fit">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                Return to Sanctuary
            </Link>

            <header className="mb-16 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-px w-10 bg-gold" />
                    <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">Ritual Archive</p>
                </div>
                <h1 className="font-display text-5xl lg:text-7xl font-light tracking-tight">Your Orders</h1>
            </header>

            {orders.length === 0 ? (
                <div className="py-32 text-center space-y-8 animate-fade-in">
                    <div className="w-20 h-20 bg-ivory-dark rounded-full flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-8 h-8 text-espresso/20 stroke-[1]" />
                    </div>
                    <p className="font-display text-3xl font-light italic text-espresso/30">Your collection is waiting to be started.</p>
                    <Link to="/shop" className="inline-block bg-espresso text-ivory px-10 py-5 uppercase text-[10px] font-bold tracking-[0.3em] hover:bg-espresso-medium transition-all no-underline shadow-xl">
                        Explore Gallery
                    </Link>
                </div>
            ) : (
                <div className="space-y-8 animate-fade-in">
                    {orders.map((order) => (
                        <div key={order._id} className="group bg-white border border-gold/10 overflow-hidden hover:border-gold/40 transition-all duration-500 shadow-sm hover:shadow-xl">
                            {/* Summary Header */}
                            <div className="p-8 lg:p-10 flex flex-wrap justify-between items-center gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] uppercase tracking-widest text-espresso/40 font-bold">Ritual Reference</p>
                                        <h3 className="text-sm font-bold tracking-widest text-espresso">#{order.orderNumber}</h3>
                                    </div>
                                    <div className="flex gap-8">
                                        <div className="space-y-1">
                                            <p className="text-[9px] uppercase tracking-widest text-espresso/40 font-bold">Inception</p>
                                            <p className="text-xs font-medium">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] uppercase tracking-widest text-espresso/40 font-bold">Investment</p>
                                            <p className="text-sm font-display text-gold">{formatGHS(order.pricing.total)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-[300px] lg:px-12">
                                    <StatusTimeline currentStatus={order.status} />
                                </div>

                                <div className="flex flex-col items-end gap-4">
                                    <button
                                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                        className="text-[10px] uppercase font-bold tracking-[0.2em] px-6 py-3 border border-espresso/10 hover:border-gold hover:text-gold transition-all"
                                    >
                                        {expandedOrder === order._id ? 'Conceal' : 'Expose Details'}
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedOrder === order._id && (
                                <div className="p-8 lg:p-10 bg-ivory/20 border-t border-gold/5 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-slide-down">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-espresso/40 border-b border-gold/10 pb-4">Curated Items</h4>
                                        <div className="space-y-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex gap-6 items-center">
                                                    <div className="w-16 h-20 bg-ivory flex-shrink-0 border border-gold/5">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-espresso/10"><Package /></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[11px] font-bold uppercase tracking-widest text-espresso">{item.name}</p>
                                                        <p className="text-[10px] text-espresso/40 italic mt-1">{item.variantLabel || 'Original Formula'}</p>
                                                        <div className="flex justify-between items-center mt-2">
                                                            <span className="text-[10px] text-espresso/60">Qty: {item.quantity}</span>
                                                            <span className="text-[11px] font-bold text-gold">{formatGHS(item.price * item.quantity)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-espresso/40 border-b border-gold/10 pb-4">Destination</h4>
                                                <p className="text-xs font-semibold">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                                <p className="text-xs text-espresso/60 leading-relaxed italic">
                                                    {order.shippingAddress.address}<br />
                                                    {order.shippingAddress.city}, {order.shippingAddress.region}<br />
                                                    {order.shippingAddress.phone}
                                                </p>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-espresso/40 border-b border-gold/10 pb-4">Treasury</h4>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-[10px] text-espresso/40 lowercase italic">
                                                        <span>Subtotal</span>
                                                        <span>{formatGHS(order.pricing.subtotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-espresso/40 lowercase italic">
                                                        <span>Shipping</span>
                                                        <span>{order.pricing.shipping === 0 ? 'Complimentary' : formatGHS(order.pricing.shipping)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs font-bold pt-2 border-t border-gold/10 text-espresso">
                                                        <span className="uppercase tracking-widest text-[9px]">Grand Total</span>
                                                        <span>{formatGHS(order.pricing.total)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-espresso text-ivory p-6 rounded-sm space-y-3">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(order.status)}
                                                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Courier Status</span>
                                            </div>
                                            <p className="text-[11px] italic leading-relaxed text-ivory/60">
                                                {order.status === 'pending' && 'Waiting for payment confirmation to begin processing.'}
                                                {order.status === 'paid' && 'Your ritual is being prepared by our artisans.'}
                                                {order.status === 'shipped' && 'The courier is currently en route to your destination.'}
                                                {order.status === 'delivered' && 'The ritual has been successfully completed and delivered.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
