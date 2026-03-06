import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { flyToCart } from '../hooks/useEffects';

const formatPrice = (n) => `GH₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

const ProductCard = ({ product }) => {
    const { name, slug, brand, basePrice, compareAtPrice, images, averageRating, reviewCount, isNewArrival, isBestSeller, stock, totalStock } = product;
    const img = images?.[0]?.url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600';
    const discount = compareAtPrice ? Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100) : 0;
    const { addToCart } = useCart();
    const btnRef = useRef(null);

    const availableStock = totalStock ?? stock ?? 0;
    const isOutOfStock = availableStock === 0;

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        if (isOutOfStock) return;
        flyToCart(btnRef.current);
        try {
            await addToCart(product._id, 1);
        } catch (err) {
            console.error('Quick add failed', err);
        }
    };

    return (
        <Link to={`/product/${slug}`} className="group cursor-pointer no-underline text-inherit product-card block">
            <div className="relative aspect-[4/5] bg-ivory-dark overflow-hidden img-zoom">
                {/* Badges */}
                {isOutOfStock && (
                    <span className="absolute top-4 left-4 z-10 bg-espresso text-ivory text-[9px] font-bold uppercase tracking-widest px-2 py-1">
                        Sold Out
                    </span>
                )}
                {!isOutOfStock && discount > 0 && (
                    <span className="absolute top-4 left-4 z-10 bg-blush text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1">
                        -{discount}%
                    </span>
                )}
                {!isOutOfStock && !discount && isNewArrival && (
                    <span className="absolute top-4 left-4 z-10 bg-gold text-espresso text-[9px] font-bold uppercase tracking-widest px-2 py-1">
                        New
                    </span>
                )}
                {!isOutOfStock && isBestSeller && !isNewArrival && !discount && (
                    <span className="absolute top-4 left-4 z-10 bg-espresso/80 text-ivory text-[9px] font-bold uppercase tracking-widest px-2 py-1">
                        Best Seller
                    </span>
                )}

                <img src={img} alt={name} className="w-full h-full object-cover" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-espresso/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <button
                        ref={btnRef}
                        className="w-full bg-ivory text-espresso py-3 text-[10px] font-bold uppercase tracking-[0.2em] translate-y-4 group-hover:translate-y-0 transition-transform duration-500 btn-ripple disabled:opacity-50"
                        onClick={handleQuickAdd}
                        disabled={isOutOfStock}
                    >
                        {isOutOfStock ? 'Out of Stock' : 'Quick Add'}
                    </button>
                </div>
            </div>

            <div className="py-4 space-y-1">
                {brand && (
                    <p className="text-[10px] uppercase tracking-widest text-espresso/40">{brand.name}</p>
                )}
                <h3 className="text-sm font-medium text-espresso line-clamp-1 group-hover:text-gold transition-colors duration-300">{name}</h3>

                {averageRating > 0 && (
                    <div className="flex items-center gap-1">
                        <span className="text-gold text-xs">{'★'.repeat(Math.floor(averageRating))}{'☆'.repeat(5 - Math.floor(averageRating))}</span>
                        <span className="text-[10px] text-espresso/30">({reviewCount})</span>
                    </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                    <span className="text-sm font-semibold">{formatPrice(basePrice)}</span>
                    {compareAtPrice && (
                        <span className="text-xs text-espresso/30 line-through">{formatPrice(compareAtPrice)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
