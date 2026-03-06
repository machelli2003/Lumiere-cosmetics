import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('pending'); // pending, success, failed
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Paystack returns 'reference' in the URL after redirect
    const reference = searchParams.get('reference');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference) {
                setLoading(false);
                setStatus('failed');
                return;
            }

            try {
                // Verify with our backend (which internally checks Paystack)
                const { data } = await apiClient.get(`/payment/paystack/verify/${reference}`);
                const result = data.data;

                if (result.paymentStatus === 'completed' || result.status === 'paid') {
                    setStatus('success');
                } else {
                    setStatus('failed');
                }

                // Fetch full order details manually to show on screen
                const orderRes = await apiClient.get('/orders');
                const latestOrder = orderRes.data.data?.find(o => o.orderNumber === reference);
                setOrder(latestOrder);

            } catch (e) {
                console.error('Verification error:', e);
                setStatus('failed');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [reference]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-ivory">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] uppercase tracking-[0.5em] text-gold">Finalizing Ritual...</p>
            </div>
        </div>
    );

    const isSuccess = status === 'success';

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-ivory">
            <div className="max-w-lg w-full text-center space-y-12 animate-fade-in">
                {/* Status Icon */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border ${isSuccess ? 'border-gold bg-gold/5 text-gold' : 'border-red-200 bg-red-50 text-red-800'}`}>
                    <span className="text-4xl font-light">{isSuccess ? '✓' : '✕'}</span>
                </div>

                {/* Main Message */}
                <div className="space-y-4">
                    <h1 className="font-display text-5xl font-light tracking-tight">
                        {isSuccess ? 'Sacred Confirmation' : 'Transaction Interrupted'}
                    </h1>
                    <p className="text-espresso/60 text-sm leading-relaxed max-w-sm mx-auto italic">
                        {isSuccess
                            ? 'Your order has been received. Our artisans are now preparing your curated selection.'
                            : 'We were unable to verify your payment. Please ensure your account has sufficient funds and try again.'}
                    </p>
                </div>

                {/* Order Summary Card */}
                {order && (
                    <div className="bg-white border border-gold/10 p-8 text-left space-y-4 shadow-sm">
                        <div className="flex justify-between items-center pb-4 border-b border-gold/5">
                            <span className="text-espresso/40 uppercase tracking-[0.2em] text-[10px] font-bold">Reference</span>
                            <span className="font-bold text-xs">#{order.orderNumber}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-espresso/40 uppercase tracking-[0.2em] text-[10px] font-bold">Status</span>
                            <span className={`uppercase text-[10px] font-bold tracking-widest ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                                {isSuccess ? 'Paid' : 'Unverified'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-espresso/40 uppercase tracking-[0.2em] text-[10px] font-bold">Total Investment</span>
                            <span className="font-display text-xl text-espresso">
                                GH₵ {Number(order.pricing?.total || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                )}

                {/* Navigation Actions */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                    {isSuccess ? (
                        <>
                            <Link
                                to="/orders"
                                className="bg-espresso text-ivory px-10 py-5 uppercase text-[10px] font-bold tracking-[0.3em] hover:bg-espresso-medium transition-all no-underline"
                            >
                                Track My Ritual
                            </Link>
                            <Link
                                to="/shop"
                                className="border border-gold text-gold px-10 py-5 uppercase text-[10px] font-bold tracking-[0.3em] hover:bg-gold hover:text-white transition-all no-underline"
                            >
                                Revisit Gallery
                            </Link>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/checkout')}
                                className="bg-espresso text-ivory px-10 py-5 uppercase text-[10px] font-bold tracking-[0.3em] hover:bg-espresso-medium transition-all"
                            >
                                Retry Checkout
                            </button>
                            <Link
                                to="/shop"
                                className="border border-espresso/20 text-espresso px-10 py-5 uppercase text-[10px] font-bold tracking-[0.3em] hover:bg-ivory transition-all no-underline"
                            >
                                Return to Shop
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;
