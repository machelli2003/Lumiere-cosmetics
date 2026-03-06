import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartSidebar = () => {
    const { cart, isOpen, setIsOpen, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    const formatGHS = (n) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(n);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-espresso/40 backdrop-blur-[2px] z-[199] transition-opacity duration-350 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-ivory z-[200] shadow-2xl transition-transform duration-350 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gold/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="w-5 h-5 text-gold" />
                            <h2 className="font-display text-2xl font-light">Your Ritual</h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-ivory-dark transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                <ShoppingBag className="w-12 h-12 stroke-[1]" />
                                <p className="font-display text-2xl lg:text-3xl font-light italic">Your bag is empty</p>
                                <button
                                    onClick={() => { setIsOpen(false); navigate('/shop'); }}
                                    className="text-[10px] uppercase font-bold tracking-widest hover:text-gold transition-colors"
                                >
                                    Browse Collection
                                </button>
                            </div>
                        ) : (
                            cart.items.map((item) => (
                                <div key={item._id} className="flex gap-4 group">
                                    <div className="w-20 h-24 bg-ivory-dark overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/80x100/f0e9df/2c1810?text=✦'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-espresso leading-tight">
                                                {item.name}
                                            </h3>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-espresso/20 hover:text-red-800 transition-colors p-1"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                        {item.variantLabel && (
                                            <p className="text-[10px] text-espresso/40 italic">{item.variantLabel}</p>
                                        )}
                                        <p className="text-xs font-semibold text-gold py-1">
                                            {formatGHS(item.price)}
                                        </p>
                                        <div className="flex items-center border border-gold/20 w-max">
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                className="px-2 py-1 hover:bg-ivory-dark transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-8 text-center text-[10px] font-bold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                className="px-2 py-1 hover:bg-ivory-dark transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cart.items.length > 0 && (
                        <div className="p-6 border-t border-gold/10 space-y-6 bg-ivory-dark/30">
                            <div className="flex justify-between items-baseline">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-espresso/40">Subtotal</span>
                                <span className="font-display text-2xl">{formatGHS(cart.subtotal)}</span>
                            </div>
                            <button
                                onClick={() => { setIsOpen(false); navigate('/checkout'); }}
                                className="w-full bg-espresso text-ivory py-4 uppercase text-xs font-bold tracking-[0.3em] hover:bg-espresso-medium transition-all"
                            >
                                Checkout
                            </button>
                            <p className="text-[9px] text-center text-espresso/30 uppercase tracking-widest">
                                Taxes and shipping calculated at checkout
                            </p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default CartSidebar;
