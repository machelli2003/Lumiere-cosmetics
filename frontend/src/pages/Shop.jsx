import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import ProductCard from '../components/ProductCard';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [page, setPage] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const selectedCategory = searchParams.get('category') || '';
    const selectedBrand = searchParams.get('brand') || '';

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [catsRes, brandsRes] = await Promise.all([
                    apiClient.get('/products/categories'),
                    apiClient.get('/products/brands'),
                ]);
                setCategories(catsRes.data.data || []);
                setBrands(brandsRes.data.data || []);
            } catch (e) {
                console.error('Filter fetch error:', e);
            }
        };
        fetchFilters();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = { sort, page, limit: 12 };
                if (search) params.search = search;
                if (selectedCategory) params.category = selectedCategory;
                if (selectedBrand) params.brand = selectedBrand;

                const response = await apiClient.get('/products', { params });
                setProducts(response.data.data || []);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [search, sort, page, selectedCategory, selectedBrand]);

    const setCategory = (slug) => {
        const params = new URLSearchParams(searchParams);
        if (slug) params.set('category', slug);
        else params.delete('category');
        params.delete('brand');
        setSearchParams(params);
    };

    const setBrand = (slug) => {
        const params = new URLSearchParams(searchParams);
        if (slug) params.set('brand', slug);
        else params.delete('brand');
        params.delete('category');
        setSearchParams(params);
    };

    const clearFilters = () => {
        setSearchParams({});
        setSearch('');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 lg:py-16">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sidebar */}
                <aside className="w-full lg:w-64 space-y-10">
                    <div className="space-y-4">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-espresso">Search</h3>
                        <div className="relative border-b border-gold/30 pb-2">
                            <input
                                type="text"
                                placeholder="Product name..."
                                className="w-full bg-transparent border-none focus:ring-0 text-sm italic"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-espresso">Sort By</h3>
                        <select
                            className="w-full bg-transparent border-none focus:ring-0 text-sm cursor-pointer"
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                        >
                            <option value="-createdAt">Newest First</option>
                            <option value="basePrice">Price: Low to High</option>
                            <option value="-basePrice">Price: High to Low</option>
                            <option value="-averageRating">Best Rated</option>
                        </select>
                    </div>

                    {categories.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-espresso">Category</h3>
                            <button
                                onClick={() => setCategory('')}
                                className={`block w-full text-left text-sm py-1 transition-colors ${!selectedCategory ? 'text-espresso font-bold' : 'text-espresso/40 hover:text-espresso'}`}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat._id}
                                    onClick={() => setCategory(cat.slug)}
                                    className={`block w-full text-left text-sm py-1 transition-colors ${selectedCategory === cat.slug ? 'text-espresso font-bold' : 'text-espresso/40 hover:text-espresso'}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {brands.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-espresso">Brand</h3>
                            <button
                                onClick={() => setBrand('')}
                                className={`block w-full text-left text-sm py-1 transition-colors ${!selectedBrand ? 'text-espresso font-bold' : 'text-espresso/40 hover:text-espresso'}`}
                            >
                                All Brands
                            </button>
                            {brands.map(brand => (
                                <button
                                    key={brand._id}
                                    onClick={() => setBrand(brand.slug)}
                                    className={`block w-full text-left text-sm py-1 transition-colors ${selectedBrand === brand.slug ? 'text-espresso font-bold' : 'text-espresso/40 hover:text-espresso'}`}
                                >
                                    {brand.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {(selectedCategory || selectedBrand || search) && (
                        <button
                            onClick={clearFilters}
                            className="text-[10px] uppercase font-bold tracking-widest text-gold hover:text-espresso transition-colors"
                        >
                            Clear All Filters
                        </button>
                    )}
                </aside>

                {/* Content */}
                <div className="flex-1 space-y-6">
                    {(selectedCategory || selectedBrand) && (
                        <div className="border-b border-gold/20 pb-4">
                            <p className="text-[10px] uppercase tracking-widest text-espresso/40">
                                {selectedCategory && `Category: ${selectedCategory}`}
                                {selectedBrand && `Brand: ${selectedBrand}`}
                            </p>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="space-y-3">
                                    <div className="aspect-[4/5] skeleton rounded-none" />
                                    <div className="h-3 skeleton w-1/2" />
                                    <div className="h-4 skeleton w-3/4" />
                                    <div className="h-3 skeleton w-1/3" />
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 grid-stagger">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center space-y-4 text-center">
                            <p className="font-display text-4xl font-light italic text-espresso/20 uppercase tracking-widest">No products found</p>
                            <button
                                onClick={clearFilters}
                                className="text-[10px] uppercase font-bold tracking-widest text-gold hover:text-espresso transition-colors"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;