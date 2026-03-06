import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const formatPrice = (amount) => {
    return `GH₵ ${Number(amount || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
};

const Checkout = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1 = address, 2 = confirm & pay
    const [order, setOrder] = useState(null);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        region: '',
        notes: '',
    });

    const user = JSON.parse(localStorage.getItem('lu') || '{}');

    useEffect(() => {
        if (!user?.id) { navigate('/auth'); return; }

        const fetchCart = async () => {
            try {
                const res = await apiClient.get('/cart');
                setCart(res.data.data?.cart || res.data.data);
            } catch (e) {
                console.error('Cart fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();

        setForm(f => ({
            ...f,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
        }));
    }, [navigate, user.id, user.firstName, user.lastName, user.email]);

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handlePlaceOrder = async () => {
        if (!form.firstName || !form.lastName || !form.address || !form.city || !form.phone || !form.email || !form.region) {
            setError('Please fill in all required fields (Name, Address, City, Phone, Email, and Region).');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const orderRes = await apiClient.post('/orders', {
                shippingAddress: {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    phone: form.phone,
                    email: form.email,
                    address: form.address,
                    city: form.city,
                    region: form.region,
                    country: 'Ghana',
                },
                paymentProvider: 'paystack',
                notes: form.notes,
            });

            const createdOrder = orderRes.data.data?.order || orderRes.data.data;
            setOrder(createdOrder);
            setStep(2);
        } catch (err) {
            const resp = err?.response?.data;
            setError(resp?.message || 'Failed to place order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaystackPayment = async () => {
        setSubmitting(true);
        setError('');
        try {
            const payRes = await apiClient.post('/payment/paystack/initiate', {
                orderId: order._id,
            });
            const url = payRes.data.data?.payUrl;
            if (url) {
                window.location.href = url; // Redirect to Paystack
            } else {
                throw new Error('Payment URL not received');
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to initiate payment.');
            setSubmitting(false);
        }
    };

    const ghanaRegions = [
        'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
        'Northern', 'Upper East', 'Upper West', 'Volta', 'Ahafo',
        'Bono', 'Bono East', 'North East', 'Oti', 'Savannah', 'Western North'
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-[10px] uppercase tracking-[0.5em] text-gold animate-pulse">Initializing Checkout...</p>
        </div>
    );

    // Guard: Only show "empty" if we haven't placed an order yet and the cart is empty
    if (!order && (!cart || !cart.items || cart.items.length === 0)) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <p className="font-display text-3xl font-light text-espresso/30 italic text-center">Your ritual collection is empty.</p>
            <button onClick={() => navigate('/shop')} className="text-[10px] uppercase font-bold tracking-widest text-gold hover:text-espresso transition-colors">
                Continue Shopping
            </button>
        </div>
    );

    // Use order pricing if available, fallback to cart pricing, then fallback to manual calculation
    const subtotal = order?.pricing?.subtotal || cart?.pricing?.subtotal || (order?.items || cart?.items || []).reduce((s, i) => s + (i.price * i.quantity), 0);
    const shipping = order?.pricing?.shippingFee ?? (subtotal >= 500 ? 0 : 50);
    const discount = order?.pricing?.discount || cart?.pricing?.discount || 0;
    const total = order?.pricing?.total || (subtotal + shipping - discount);

    const itemsToShow = order?.items || cart?.items || [];

    return (
        <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex items-center justify-center gap-12 mb-16">
                {[
                    { n: 1, label: 'Delivery' },
                    { n: 2, label: 'Payment' },
                ].map(s => (
                    <div key={s.n} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border ${step >= s.n ? 'bg-espresso text-ivory border-espresso' : 'bg-transparent text-espresso/20 border-espresso/20'}`}>
                            {s.n}
                        </div>
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${step >= s.n ? 'text-espresso' : 'text-espresso/20'}`}>{s.label}</span>
                        {s.n === 1 && <div className={`w-20 h-px ${step > 1 ? 'bg-espresso' : 'bg-espresso/10'}`} />}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2">
                    {step === 1 ? (
                        <div className="space-y-10 animate-fade-in">
                            <h2 className="font-display text-4xl font-light">Delivery Ritual</h2>
                            {error && <p className="text-red-800 text-[10px] uppercase tracking-widest font-bold bg-red-50 p-4 border-l-4 border-red-800">{error}</p>}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">First Name *</label>
                                    <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border border-gold/30 px-5 py-4 text-sm focus:outline-none focus:border-espresso bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Last Name *</label>
                                    <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border border-gold/30 px-5 py-4 text-sm focus:outline-none focus:border-espresso bg-white" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Phone Number *</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="024XXXXXXX" className="w-full border border-gold/30 px-5 py-4 text-sm focus:outline-none focus:border-espresso bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Email *</label>
                                    <input name="email" value={form.email} onChange={handleChange} className="w-full border border-gold/30 px-5 py-4 text-sm focus:outline-none focus:border-espresso bg-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Delivery Address *</label>
                                <input name="address" value={form.address} onChange={handleChange} placeholder="House no, Street, Landmark" className="w-full border border-gold/30 px-5 py-4 text-sm focus:outline-none focus:border-espresso bg-white" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">City / Town *</label>
                                    <input name="city" value={form.city} onChange={handleChange} className="w-full border border-gold/30 px-5 py-4 text-sm focus:outline-none focus:border-espresso bg-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Region *</label>
                                    <select name="region" value={form.region} onChange={handleChange} className="w-full border border-gold/30 px-5 py-4 text-sm focus:outline-none focus:border-espresso bg-white">
                                        <option value="">Select Region</option>
                                        {ghanaRegions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={submitting}
                                className="w-full bg-espresso text-ivory py-5 uppercase text-[10px] font-bold tracking-[0.3em] hover:bg-espresso-medium transition-all disabled:opacity-50 mt-4"
                            >
                                {submitting ? 'Preparing Ritual...' : 'Review & Pay'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-fade-in">
                            <h2 className="font-display text-4xl font-light">Payment Authorization</h2>
                            <p className="text-sm text-espresso/60 leading-relaxed italic">Your order <span className="font-bold text-espresso">#{order?.orderNumber}</span> is ready for completion. We use Paystack for secure transactions across Ghana.</p>

                            {error && <p className="text-red-800 text-[10px] uppercase tracking-widest font-bold bg-red-50 p-4 border-l-4 border-red-800">{error}</p>}

                            <div className="bg-white border border-gold/10 p-8 space-y-8">
                                <div className="space-y-4">
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-espresso/40 text-center">Paystack Secure Checkout</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-ivory-dark p-6 rounded-sm text-center">
                                            <p className="text-[9px] uppercase tracking-widest text-espresso/40 mb-1">Total to Pay</p>
                                            <p className="font-display text-3xl text-gold">{formatPrice(total)}</p>
                                        </div>
                                        <div className="bg-ivory-dark p-6 rounded-sm flex flex-col items-center justify-center">
                                            <p className="text-[9px] uppercase tracking-widest text-espresso/40 mb-2">Accepted via Paystack</p>
                                            <div className="flex gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                                                <span className="text-[10px] font-bold">MoMo</span>
                                                <span className="text-[10px] font-bold">Cards</span>
                                                <span className="text-[10px] font-bold">QR</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 border border-espresso/20 py-5 uppercase text-[10px] font-bold tracking-[0.3em] hover:bg-ivory transition-all"
                                >
                                    Modify Details
                                </button>
                                <button
                                    onClick={handlePaystackPayment}
                                    disabled={submitting}
                                    className="flex-[2] bg-gold text-espresso py-5 uppercase text-[10px] font-bold tracking-[0.3em] hover:bg-gold-light transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Redirecting...' : 'Authorize Payment'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <h3 className="font-display text-2xl font-light">Ritual Summary</h3>
                    <div className="bg-white border border-gold/10 overflow-hidden">
                        <div className="max-h-[400px] overflow-auto divide-y divide-gold/10">
                            {itemsToShow.map((item, i) => (
                                <div key={i} className="flex gap-6 p-6 items-center">
                                    <div className="w-16 h-20 bg-ivory-dark flex-shrink-0">
                                        {(item.product?.images?.[0]?.url || item.image) && (
                                            <img src={item.product?.images?.[0]?.url || item.image} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold uppercase tracking-wider">{item.product?.name || item.name}</p>
                                        <p className="text-[10px] text-espresso/40 mt-1">Qty: {item.quantity}</p>
                                        <p className="text-[11px] font-medium text-gold mt-1">{formatPrice(item.price)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-8 bg-ivory/30 space-y-4 border-t border-gold/10">
                            <div className="flex justify-between text-[11px] uppercase tracking-widest text-espresso/60">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-[11px] uppercase tracking-widest text-espresso/60">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'Complimentary' : formatPrice(shipping)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-[11px] uppercase tracking-widest text-green-700">
                                    <span>Discount</span>
                                    <span>-{formatPrice(discount)}</span>
                                </div>
                            )}
                            <div className="pt-6 border-t border-gold/20 flex justify-between font-bold items-center">
                                <span className="text-[10px] uppercase tracking-[0.3em]">Total Expenditure</span>
                                <span className="font-display text-2xl text-espresso">{formatPrice(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;