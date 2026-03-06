import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const { data } = await apiClient.post(endpoint, form);

            localStorage.setItem('lu', JSON.stringify(data.data.user));
            localStorage.setItem('lt', data.data.accessToken);
            window.dispatchEvent(new Event('storage'));

            navigate(data.data.user.role === 'admin' ? '/admin' : '/account');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.displayMessage || (err.response?.data?.message) || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                <div className="flex mb-12 border-b border-gold/20">
                    <button
                        className={`flex-1 pb-4 text-[10px] font-bold uppercase tracking-widest transition-all ${isLogin ? 'text-espresso border-b-2 border-espresso' : 'text-espresso/30 border-b-2 border-transparent'}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`flex-1 pb-4 text-[10px] font-bold uppercase tracking-widest transition-all ${!isLogin ? 'text-espresso border-b-2 border-espresso' : 'text-espresso/30 border-b-2 border-transparent'}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>

                <div className="space-y-2 mb-10">
                    <h2 className="font-display text-4xl font-light">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-espresso/40 text-sm">{isLogin ? 'Sign in to your Lumière account' : 'Join Lumière for exclusive benefits'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-espresso/40">First Name</label>
                                <input name="firstName" required type="text" placeholder="Sophie" className="w-full bg-ivory-dark border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gold" onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-espresso/40">Last Name</label>
                                <input name="lastName" required type="text" placeholder="Nguyen" className="w-full bg-ivory-dark border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gold" onChange={handleChange} />
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-espresso/40">Email</label>
                        <input name="email" required type="email" placeholder="your@email.com" className="w-full bg-ivory-dark border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gold" onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-espresso/40">Password</label>
                        <input name="password" required type="password" placeholder="••••••••" className="w-full bg-ivory-dark border-none px-4 py-3 text-sm focus:ring-1 focus:ring-gold" onChange={handleChange} />
                    </div>

                    {error && <p className="text-xs text-red-800 uppercase tracking-widest font-bold">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-espresso text-ivory py-4 uppercase text-xs font-bold tracking-[0.2em] hover:bg-espresso-medium transition-all"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Auth;
