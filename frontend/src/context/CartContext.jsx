import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchCart = async () => {
        const token = localStorage.getItem('lt');
        if (!token) return;

        try {
            const { data } = await apiClient.get('/cart');
            setCart({
                items: data.data.cart.items || [],
                subtotal: data.data.cart.subtotal || 0,
                itemCount: data.data.cart.itemCount || 0
            });
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const addToCart = async (productId, quantity = 1, variantId = null) => {
        const token = localStorage.getItem('lt');
        if (!token) {
            window.location.href = '/auth';
            return;
        }

        setLoading(true);
        try {
            const payload = { productId, quantity };
            if (variantId) payload.variantId = variantId;
            await apiClient.post('/cart/add', payload);
            await fetchCart();
            setIsOpen(true); // Open sidebar after adding
        } catch (error) {
                const resp = error?.response?.data;
                if (resp) {
                    const details = resp.errors ? resp.errors.map(e => `${e.field}: ${e.message}`).join('\n') : '';
                    alert(`${resp.message}${details ? '\n' + details : ''}`);
                } else {
                    alert('Failed to add to cart');
                }
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        try {
            await apiClient.put(`/cart/update/${itemId}`, { quantity });
            await fetchCart();
        } catch (error) {
            console.error('Update qty error:', error);
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            await apiClient.delete(`/cart/remove/${itemId}`);
            await fetchCart();
        } catch (error) {
            console.error('Remove error:', error);
        }
    };

    const clearCartItems = async () => {
        try {
            await apiClient.delete('/cart/clear');
            setCart({ items: [], subtotal: 0, itemCount: 0 });
        } catch (error) {
            console.error('Clear cart error:', error);
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            isOpen,
            setIsOpen,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCartItems,
            loading,
            refreshCart: fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
