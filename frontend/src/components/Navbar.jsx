import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useNavbarScroll } from '../hooks/useEffects';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { cart, setIsOpen } = useCart();
    const navigate = useNavigate();
    useNavbarScroll();

    useEffect(() => {
        const updateAuth = () => {
            const stored = localStorage.getItem('lu');
            setUser(stored ? JSON.parse(stored) : null);
        };
        updateAuth();
        window.addEventListener('storage', updateAuth);
        return () => window.removeEventListener('storage', updateAuth);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery('');
            setMobileOpen(false);
        }
    };

    const navLinks = [
        { label: 'Shop', to: '/shop' },
        { label: 'Skincare', to: '/shop?category=skincare' },
        { label: 'Makeup', to: '/shop?category=makeup' },
        { label: 'Brands', to: '/shop' },
        { label: 'About', to: '/about' },
        { label: 'Contact', to: '/contact' },
    ];

    return (
        <nav id="navbar" className="w-full sticky top-0 z-50 bg-ivory/95 backdrop-blur-lg border-b border-gold/20 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <div className="flex-1 flex justify-center lg:justify-start">
                        <Link to="/" className="font-display text-2xl lg:text-3xl font-light tracking-[0.2em] text-espresso no-underline flex-shrink-0">
                            LUMIÈRE
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map(link => (
                            <Link key={link.label} to={link.to}
                                className="text-[10px] uppercase tracking-widest font-bold text-espresso-medium hover:text-gold transition-colors duration-300 no-underline relative group">
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
                            </Link>
                        ))}
                    </div>

                    {/* Icons */}
                    <div className="flex-1 flex items-center justify-end gap-1">
                        {/* Search */}
                        <button onClick={() => setSearchOpen(s => !s)} className="p-2 hover:text-gold transition-colors text-espresso">
                            <Search className="w-5 h-5" strokeWidth={1.5} />
                        </button>

                        {/* Admin Link - Only for Admins */}
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="p-2 text-gold hover:text-espresso transition-colors" title="Admin Rituals">
                                <div className="w-5 h-5 flex items-center justify-center border border-gold rounded-sm">
                                    <span className="text-[8px] font-bold">AD</span>
                                </div>
                            </Link>
                        )}

                        {/* Account */}
                        <Link to={user ? '/account' : '/auth'} className="p-2 hover:text-gold transition-colors text-espresso">
                            <User className="w-5 h-5" strokeWidth={1.5} />
                        </Link>

                        {/* Cart */}
                        <button data-cart-btn onClick={() => setIsOpen(true)} className="p-2 hover:text-gold transition-colors text-espresso relative">
                            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                            {cart.itemCount > 0 && (
                                <span data-cart-badge className="absolute top-1 right-1 bg-gold text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                                    {cart.itemCount}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button onClick={() => setMobileOpen(s => !s)} className="lg:hidden p-2 hover:text-gold transition-colors text-espresso">
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className={`overflow-hidden transition-all duration-300 ${searchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <form onSubmit={handleSearch} className="flex gap-3 border-t border-gold/20 py-3">
                        <input autoFocus={searchOpen} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search products, brands..." className="flex-1 bg-transparent border-b border-gold/30 pb-1 text-sm focus:outline-none focus:border-espresso italic placeholder:text-espresso/30 transition-colors" />
                        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-gold hover:text-espresso transition-colors">Go</button>
                        <button type="button" onClick={() => setSearchOpen(false)} className="text-espresso/30 hover:text-espresso transition-colors"><X className="w-4 h-4" /></button>
                    </form>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-ivory border-t border-gold/20 px-4 py-6 space-y-1">
                    {navLinks.map(link => (
                        <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)}
                            className="block py-3 text-[10px] uppercase tracking-widest font-bold text-espresso hover:text-gold transition-colors no-underline border-b border-gold/10">
                            {link.label}
                        </Link>
                    ))}
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-3 text-[10px] uppercase tracking-widest font-bold text-gold hover:text-espresso transition-colors no-underline border-b border-gold/10">
                                    Admin Dashboard
                                </Link>
                            )}
                            <Link to="/account" onClick={() => setMobileOpen(false)} className="block py-3 text-[10px] uppercase tracking-widest font-bold text-espresso hover:text-gold transition-colors no-underline border-b border-gold/10">My Account</Link>
                            <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-3 text-[10px] uppercase tracking-widest font-bold text-espresso hover:text-gold transition-colors no-underline">My Orders</Link>
                        </>
                    ) : (
                        <Link to="/auth" onClick={() => setMobileOpen(false)} className="block py-3 text-[10px] uppercase tracking-widest font-bold text-gold hover:text-espresso transition-colors no-underline">Sign In / Register</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
