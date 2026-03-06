import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const formatPrice = (n) => `GH₵ ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

const StarRating = ({ value, onChange, size = 'md' }) => {
    const [hovered, setHovered] = useState(0);
    const s = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onChange && onChange(i)}
                    onMouseEnter={() => onChange && setHovered(i)}
                    onMouseLeave={() => onChange && setHovered(0)}
                    className={onChange ? 'cursor-pointer' : 'cursor-default'}
                >
                    <Star className={`${s} ${i <= (hovered || value) ? 'fill-gold text-gold' : 'text-espresso/20'}`} />
                </button>
            ))}
        </div>
    );
};

const ProductDetail = () => {
    const { slug } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const { addToCart, loading: cartLoading } = useCart();

    const user = JSON.parse(localStorage.getItem('lu') || '{}');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/products/${slug}`);
                setData(response.data.data);
                setSelectedVariant(null);
                setActiveImage(0);
            } catch (err) {
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user?.id) { setReviewError('Please login to submit a review.'); return; }
        if (!reviewForm.comment) { setReviewError('Please write a comment.'); return; }
        setReviewSubmitting(true);
        setReviewError('');
        try {
            await apiClient.post(`/products/${data.product._id}/reviews`, reviewForm);
            setReviewSuccess(true);
            setReviewForm({ rating: 5, title: '', comment: '' });
            // Refresh product to show new review
            const res = await apiClient.get(`/products/${slug}`);
            setData(res.data.data);
        } catch (err) {
            setReviewError(err?.response?.data?.message || 'Failed to submit review.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center uppercase tracking-[0.4em] text-gold animate-pulse">
            Revealing Beauty...
        </div>
    );
    if (!data) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center font-display text-4xl font-light italic text-espresso/20 uppercase tracking-widest">
            Ritual Not Found
        </div>
    );

    const { product, related } = data;
    const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

    const images = product.images?.length > 0
        ? product.images.map(i => i.url)
        : ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800'];

    if (selectedVariant?.image) images[0] = selectedVariant.image;

    const isOutOfStock = currentStock === 0;
    const isLowStock = currentStock > 0 && currentStock <= 5;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            {/* Breadcrumb */}
            <nav className="text-[10px] uppercase tracking-[0.3em] text-espresso/40 flex gap-2 mb-12 font-bold">
                <Link to="/" className="hover:text-gold transition-colors no-underline">Home</Link>
                <span>/</span>
                <Link to="/shop" className="hover:text-gold transition-colors no-underline">Collection</Link>
                <span>/</span>
                <span className="text-espresso/70">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-[4/5] bg-ivory-dark overflow-hidden group">
                        <img
                            src={images[activeImage]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Stock badge */}
                        {isOutOfStock && (
                            <div className="absolute top-4 left-4 bg-espresso text-ivory text-[9px] uppercase tracking-widest font-bold px-3 py-1">
                                Out of Stock
                            </div>
                        )}
                        {isLowStock && (
                            <div className="absolute top-4 left-4 bg-red-800 text-ivory text-[9px] uppercase tracking-widest font-bold px-3 py-1">
                                Only {currentStock} Left
                            </div>
                        )}
                        {product.isNewArrival && (
                            <div className="absolute top-4 right-4 bg-gold text-espresso text-[9px] uppercase tracking-widest font-bold px-3 py-1">
                                New
                            </div>
                        )}
                        {/* Nav arrows if multiple images */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setActiveImage(i => (i + 1) % images.length)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-1">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`w-16 h-20 flex-shrink-0 overflow-hidden border-2 transition-all ${activeImage === i ? 'border-espresso' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                    <div className="space-y-3">
                        {product.brand && <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">{product.brand.name}</p>}
                        <h1 className="font-display text-4xl lg:text-5xl font-light tracking-tight">{product.name}</h1>
                        <div className="flex items-center gap-4">
                            <StarRating value={Math.round(product.averageRating || 0)} size="sm" />
                            <span className="text-[9px] uppercase tracking-widest font-bold text-espresso/40">
                                {product.reviewCount || 0} Ritual Reports
                            </span>
                        </div>
                    </div>

                    <div className="flex items-baseline gap-4">
                        <span className="font-display text-4xl">{formatPrice(currentPrice)}</span>
                        {product.compareAtPrice && (
                            <span className="text-lg text-espresso/30 line-through">{formatPrice(product.compareAtPrice)}</span>
                        )}
                        {product.compareAtPrice && (
                            <span className="text-[9px] uppercase tracking-widest font-bold text-gold bg-gold/10 px-2 py-1">
                                Save {Math.round((1 - currentPrice / product.compareAtPrice) * 100)}%
                            </span>
                        )}
                    </div>

                    <p className="text-espresso/60 leading-relaxed text-sm italic">{product.shortDescription}</p>

                    {/* Variants */}
                    {product.hasVariants && product.variants?.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-espresso/40">
                                Select Ritual: <span className="text-gold ml-2">{selectedVariant ? selectedVariant.value : 'Choose an option'}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map(v => (
                                    <button
                                        key={v._id}
                                        onClick={() => setSelectedVariant(selectedVariant?._id === v._id ? null : v)}
                                        disabled={v.stock === 0}
                                        className={`px-5 py-2 text-[10px] uppercase tracking-widest border transition-all font-bold disabled:opacity-30 disabled:line-through ${selectedVariant?._id === v._id ? 'bg-espresso text-ivory border-espresso' : 'border-gold/20 hover:border-gold text-espresso/60'}`}
                                    >
                                        {v.value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stock + Add to Cart */}
                    <div className="space-y-6 pt-4 border-t border-gold/10">
                        <p className={`text-[10px] uppercase tracking-widest font-bold ${isOutOfStock ? 'text-red-800' : isLowStock ? 'text-amber-600' : 'text-green-700'}`}>
                            {isOutOfStock ? '✕ Currently Unavailable' : isLowStock ? `⚠ Only ${currentStock} Rituals Left` : `✓ In Stock`}
                        </p>

                        <div className="flex gap-4">
                            <div className="flex border border-gold/20 h-14 items-center bg-white">
                                <button className="px-5 hover:text-gold transition-colors" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                                <button className="px-5 hover:text-gold transition-colors" onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}>
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                className="flex-1 bg-espresso text-ivory h-14 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-espresso-medium transition-all disabled:opacity-40"
                                disabled={isOutOfStock || cartLoading}
                                onClick={() => addToCart(product._id, quantity, selectedVariant?._id)}
                            >
                                {cartLoading ? 'Preparing...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    {product.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {product.tags.map(tag => (
                                <span key={tag} className="text-[9px] uppercase tracking-widest border border-gold/20 px-3 py-1 text-espresso/40">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs: Description / How to Use / Reviews */}
            <div className="mb-20">
                <div className="flex border-b border-gold/20 mb-10">
                    {['description', 'howToUse', 'reviews'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-4 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-espresso text-espresso' : 'border-transparent text-espresso/30 hover:text-espresso/60'}`}
                        >
                            {tab === 'howToUse' ? 'The Ritual' : tab === 'reviews' ? `Ritual Reports (${product.reviews?.length || 0})` : 'Description'}
                        </button>
                    ))}
                </div>

                {activeTab === 'description' && (
                    <div className="max-w-2xl space-y-4">
                        <p className="text-espresso/70 leading-relaxed">{product.description}</p>
                        {product.ingredients && (
                            <div className="mt-6">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-espresso/40 mb-2">Key Ingredients</p>
                                <p className="text-sm text-espresso/60 leading-relaxed">{product.ingredients}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'howToUse' && (
                    <div className="max-w-2xl">
                        {product.howToUse ? (
                            <p className="text-espresso/70 leading-relaxed">{product.howToUse}</p>
                        ) : (
                            <p className="text-espresso/30 italic">Application instructions not available.</p>
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="max-w-2xl space-y-10">
                        {/* Review Summary */}
                        {product.reviews?.length > 0 && (
                            <div className="flex items-center gap-6 p-6 bg-ivory-dark">
                                <div className="text-center">
                                    <p className="font-display text-5xl font-light">{(product.averageRating || 0).toFixed(1)}</p>
                                    <StarRating value={Math.round(product.averageRating || 0)} size="sm" />
                                    <p className="text-[9px] uppercase tracking-widest text-espresso/40 mt-1">{product.reviewCount} Reports</p>
                                </div>
                            </div>
                        )}

                        {/* Review List */}
                        <div className="space-y-6">
                            {product.reviews?.length === 0 ? (
                                <p className="text-espresso/30 italic text-sm">No ritual reports yet. Be the first to share your experience!</p>
                            ) : (
                                product.reviews.map((review, i) => (
                                    <div key={i} className="border-b border-gold/10 pb-6 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-sm">{review.user?.firstName} {review.user?.lastName}</p>
                                                <StarRating value={review.rating} size="sm" />
                                            </div>
                                            <p className="text-[10px] text-espresso/30 uppercase tracking-widest">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {review.title && <p className="font-bold text-sm">{review.title}</p>}
                                        <p className="text-sm text-espresso/60 leading-relaxed">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Review Form */}
                        {user?.id ? (
                            <div className="border-t border-gold/10 pt-8 space-y-4">
                                <h3 className="font-display text-xl font-light">Share Your Experience</h3>
                                {reviewSuccess && (
                                    <p className="text-green-700 text-xs uppercase tracking-widest font-bold">Report submitted successfully!</p>
                                )}
                                {reviewError && (
                                    <p className="text-red-800 text-xs uppercase tracking-widest font-bold">{reviewError}</p>
                                )}
                                {!reviewSuccess && (
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Your Rating</label>
                                            <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm(f => ({ ...f, rating: v }))} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Title (Optional)</label>
                                            <input
                                                value={reviewForm.title}
                                                onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                                                placeholder="Summarize your experience"
                                                className="w-full border border-gold/30 px-4 py-3 text-sm focus:outline-none focus:border-espresso bg-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-espresso/40 font-bold">Your Review *</label>
                                            <textarea
                                                value={reviewForm.comment}
                                                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                                rows={4}
                                                placeholder="Tell others about your experience with this ritual..."
                                                className="w-full border border-gold/30 px-4 py-3 text-sm focus:outline-none focus:border-espresso bg-white resize-none"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={reviewSubmitting}
                                            className="bg-espresso text-ivory px-8 py-3 uppercase text-[10px] font-bold tracking-widest hover:bg-espresso-medium transition-all disabled:opacity-50"
                                        >
                                            {reviewSubmitting ? 'Submitting...' : 'Submit Report'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        ) : (
                            <div className="border-t border-gold/10 pt-6 text-center">
                                <p className="text-sm text-espresso/40">
                                    <Link to="/auth" className="text-gold hover:text-espresso transition-colors font-bold">Sign in</Link> to leave a report
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Related Products */}
            {related?.length > 0 && (
                <section className="space-y-12">
                    <div className="text-center space-y-3">
                        <p className="text-gold text-[10px] uppercase tracking-[0.4em] font-bold">Divine Pairings</p>
                        <h2 className="font-display text-4xl font-light">Complete the Ritual</h2>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {related.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetail;
