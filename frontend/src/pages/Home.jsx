import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, brandsRes] = await Promise.all([
                    apiClient.get('/products?isBestSeller=true&limit=4'),
                    apiClient.get('/products/brands'),
                ]);
                setFeaturedProducts(productsRes.data.data || []);
                setBrands(brandsRes.data.data || []);
            } catch (e) {
                console.error('Home fetch error:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const categories = [
        { name: 'Skincare', slug: 'skincare', emoji: '✨', desc: 'Serums, moisturizers & more' },
        { name: 'Makeup', slug: 'makeup', emoji: '💄', desc: 'Foundation, lips & eyes' },
        { name: 'Serums', slug: 'serums', emoji: '💧', desc: 'Targeted treatments' },
        { name: 'Lip Color', slug: 'lip-color', emoji: '👄', desc: 'Bold & subtle shades' },
    ];

    // Duplicate brands for seamless marquee
    const marqueeItems = [...brands, ...brands];

    return (
        <div className="space-y-24 pb-24">
            {/* ── Hero ───────────────────────────────────── */}
            <section className="relative h-[90vh] flex items-center bg-espresso overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-espresso via-espresso to-espresso-medium opacity-90" />
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(201,169,110,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(201,169,110,0.08) 0%, transparent 50%)'
                    }} />
                </div>
                <div className="absolute right-[-5%] bottom-[-10%] font-display text-[22rem] font-light text-white/[0.03] leading-none select-none pointer-events-none">
                    LUMIÈRE
                </div>
                <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
                    <div className="max-w-2xl space-y-8">
                        <p className="text-gold text-[10px] font-bold uppercase tracking-[0.5em]" style={{ animation: 'heroSlide 0.9s cubic-bezier(0.22,1,0.36,1) 0.1s forwards', opacity: 0, transform: 'translateY(20px)' }}>
                            Curated Luxury Beauty
                        </p>
                        <div className="space-y-2">
                            <div className="hero-line">
                                <span style={{ '--delay': '0.25s' }} className="font-display text-6xl lg:text-8xl text-ivory font-light leading-tight">
                                    Elevate Your
                                </span>
                            </div>
                            <div className="hero-line">
                                <span style={{ '--delay': '0.4s' }} className="font-display text-6xl lg:text-8xl text-ivory font-light leading-tight italic">
                                    Beauty Ritual
                                </span>
                            </div>
                        </div>
                        <p className="text-ivory/50 text-lg max-w-md leading-relaxed" style={{ animation: 'heroSlide 0.9s cubic-bezier(0.22,1,0.36,1) 0.55s forwards', opacity: 0 }}>
                            Discover the world's most coveted cosmetics — from Parisian skincare to Korean beauty innovations.
                        </p>
                        <div className="flex gap-4 pt-2" style={{ animation: 'heroSlide 0.9s cubic-bezier(0.22,1,0.36,1) 0.7s forwards', opacity: 0 }}>
                            <button onClick={() => navigate('/shop')}
                                className="bg-gold hover:bg-gold-light text-espresso px-8 py-4 uppercase text-xs font-bold tracking-[0.2em] transition-all duration-300 btn-ripple">
                                Explore Collection
                            </button>
                            <button onClick={() => document.getElementById('brands-section')?.scrollIntoView({ behavior: 'smooth' })}
                                className="border border-ivory/30 hover:border-ivory text-ivory px-8 py-4 uppercase text-xs font-bold tracking-[0.2em] transition-all duration-300 btn-ripple">
                                Our Brands
                            </button>
                        </div>
                    </div>
                </div>
                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-ivory font-bold">Scroll</span>
                    <div className="w-px h-8 bg-gold animate-pulse" />
                </div>
            </section>

            {/* ── Best Sellers ────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16 space-y-4 reveal">
                    <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Curated Selection</p>
                    <h2 className="font-display text-4xl lg:text-5xl font-light">Best Sellers</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-[4/5] skeleton rounded-none" />
                                <div className="h-3 skeleton w-1/2" />
                                <div className="h-4 skeleton w-3/4" />
                                <div className="h-3 skeleton w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 grid-stagger">
                        {featuredProducts.length > 0 ? featuredProducts.map(p => (
                            <ProductCard key={p._id} product={p} />
                        )) : (
                            <p className="col-span-full text-center text-espresso/30 py-20 font-display text-2xl">No best sellers yet</p>
                        )}
                    </div>
                )}

                <div className="text-center mt-14 reveal reveal-delay-2">
                    <button onClick={() => navigate('/shop')}
                        className="border border-espresso text-espresso px-12 py-4 uppercase text-xs font-bold tracking-[0.2em] hover:bg-espresso hover:text-ivory transition-all duration-300 btn-ripple">
                        View All Products
                    </button>
                </div>
            </section>

            {/* ── Categories ─────────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16 space-y-4 reveal">
                    <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Shop By Category</p>
                    <h2 className="font-display text-4xl lg:text-5xl font-light">Discover Your Ritual</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 grid-stagger">
                    {categories.map(cat => (
                        <button key={cat.slug} onClick={() => navigate(`/shop?category=${cat.slug}`)}
                            className="group bg-ivory-dark hover:bg-espresso p-8 text-left transition-all duration-500 btn-ripple">
                            <p className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{cat.emoji}</p>
                            <p className="font-display text-xl font-light group-hover:text-ivory transition-colors duration-300">{cat.name}</p>
                            <p className="text-xs text-espresso/40 group-hover:text-ivory/60 mt-1 transition-colors duration-300">{cat.desc}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Brands Marquee ──────────────────────────── */}
            <section id="brands-section" className="py-12 border-y border-gold/10 overflow-hidden">
                <div className="flex overflow-hidden">
                    <div className="marquee-track">
                        {marqueeItems.map((brand, i) => (
                            <button key={i} onClick={() => navigate(`/shop?brand=${brand.slug}`)}
                                className="flex-shrink-0 px-12 py-4 font-display text-2xl font-light text-espresso/30 hover:text-gold transition-colors duration-300 uppercase tracking-[0.2em]">
                                {brand.name}
                            </button>
                        ))}
                        {/* Fallback if no brands */}
                        {brands.length === 0 && ['Charlotte Tilbury', 'La Mer', 'Sulwhasoo', 'NARS', 'Sisley Paris',
                            'Charlotte Tilbury', 'La Mer', 'Sulwhasoo', 'NARS', 'Sisley Paris'].map((name, i) => (
                                <button key={i} onClick={() => navigate('/shop')}
                                    className="flex-shrink-0 px-12 py-4 font-display text-2xl font-light text-espresso/30 hover:text-gold transition-colors duration-300 uppercase tracking-[0.2em]">
                                    {name}
                                </button>
                            ))}
                    </div>
                </div>
            </section>

            {/* ── Full Brands Grid ────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16 space-y-4 reveal">
                    <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">House of Beauty</p>
                    <h2 className="font-display text-4xl lg:text-5xl font-light">Our Brands</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 grid-stagger">
                    {(brands.length > 0 ? brands : ['Charlotte Tilbury', 'La Mer', 'Sulwhasoo', 'NARS', 'Sisley Paris'].map(name => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-'), _id: name }))).map(brand => (
                        <button key={brand._id} onClick={() => navigate(brand.slug ? `/shop?brand=${brand.slug}` : '/shop')}
                            className="group border border-gold/20 hover:border-gold hover:bg-espresso p-6 text-center transition-all duration-400 btn-ripple">
                            <p className="font-display text-sm font-light group-hover:text-ivory transition-colors duration-300 tracking-widest">{brand.name}</p>
                            {brand.origin && <p className="text-[9px] uppercase tracking-widest text-espresso/30 group-hover:text-ivory/40 mt-1 transition-colors duration-300">{brand.origin}</p>}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Editorial Banner ────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 reveal">
                <div className="bg-espresso p-12 lg:p-20 text-center space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(201,169,110,0.1) 0%, transparent 70%)' }} />
                    <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] relative z-10">The Lumière Promise</p>
                    <h2 className="font-display text-4xl lg:text-6xl font-light text-ivory relative z-10 leading-tight">
                        Authenticity.<br /><em className="italic">Guaranteed.</em>
                    </h2>
                    <p className="text-ivory/40 max-w-lg mx-auto text-sm leading-relaxed relative z-10">
                        Every product in our collection is 100% authentic, sourced directly from authorized distributors. Your luxury is our commitment.
                    </p>
                    <button onClick={() => navigate('/shop')} className="border border-gold text-gold hover:bg-gold hover:text-espresso px-10 py-4 uppercase text-xs font-bold tracking-[0.2em] transition-all duration-300 btn-ripple relative z-10">
                        Shop Now
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Home;