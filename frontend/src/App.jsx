import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import Account from './pages/Account';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import PaymentResult from './pages/PaymentResult';
import About from './pages/About';
import Contact from './pages/Contact';
import { useScrollReveal, usePageTransition } from './hooks/useEffects';

const PageWrapper = ({ children }) => {
    const location = useLocation();
    usePageTransition();
    useScrollReveal();
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [location.pathname]);
    return children;
};

function AppContent() {
    return (
        <div className="min-h-screen bg-ivory text-espresso">
            <Navbar />
            <CartSidebar />
            <main>
                <PageWrapper>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/account" element={<Account />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/payment/result" element={<PaymentResult />} />
                        <Route path="*" element={
                            <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
                                <p className="font-display text-8xl font-light text-espresso/10">404</p>
                                <p className="font-display text-3xl font-light text-espresso/30 italic">Page Not Found</p>
                                <a href="/" className="text-[10px] uppercase tracking-widest font-bold text-gold hover:text-espresso transition-colors">Return Home</a>
                            </div>
                        } />
                    </Routes>
                </PageWrapper>
            </main>
            <footer className="bg-espresso text-ivory/40 py-16 mt-20 border-t border-gold/10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                        <div className="md:col-span-2 space-y-4">
                            <p className="font-display text-3xl tracking-[0.2em] text-shimmer">LUMIÈRE</p>
                            <p className="text-sm leading-relaxed max-w-xs">Curated luxury beauty from the world's most coveted brands, delivered to your door across Ghana.</p>
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-ivory/60">Shop</p>
                            {['Skincare', 'Makeup', 'Serums', 'Lip Color'].map(l => (
                                <a key={l} href={`/shop?category=${l.toLowerCase().replace(' ', '-')}`} className="block text-sm text-ivory/30 hover:text-ivory transition-colors no-underline">{l}</a>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-ivory/60">Account</p>
                            {[['My Account', '/account'], ['My Orders', '/orders'], ['Sign In', '/auth']].map(([l, to]) => (
                                <a key={l} href={to} className="block text-sm text-ivory/30 hover:text-ivory transition-colors no-underline">{l}</a>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-ivory/10 pt-8 text-center">
                        <p className="text-[10px] uppercase tracking-widest">© 2026 Lumière Cosmetics — Luxury Beauty Rituals · Ghana</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
