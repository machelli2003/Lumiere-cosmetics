import React, { useState } from 'react';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        // No backend wired here — simply show a quick client-side acknowledgement
        alert('Thanks! Your message was noted.');
        setForm({ name: '', email: '', message: '' });
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-24">
            <div className="text-center mb-12">
                <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Get In Touch</p>
                <h1 className="font-display text-4xl lg:text-5xl font-light">Contact Us</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-ivory p-8 rounded-sm border border-gold/10">
                <div>
                    <label className="text-sm font-bold text-espresso/70">Name</label>
                    <input name="name" value={form.name} onChange={handleChange} required className="w-full mt-2 p-3 border border-ivory/30 bg-transparent" />
                </div>
                <div>
                    <label className="text-sm font-bold text-espresso/70">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full mt-2 p-3 border border-ivory/30 bg-transparent" />
                </div>
                <div>
                    <label className="text-sm font-bold text-espresso/70">Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={6} className="w-full mt-2 p-3 border border-ivory/30 bg-transparent" />
                </div>
                <div className="text-right">
                    <button type="submit" className="bg-gold text-espresso px-6 py-3 uppercase text-xs font-bold tracking-[0.2em]">Send Message</button>
                </div>
            </form>

            <div className="mt-12 text-center text-espresso/70">
                <p>Prefer email? Reach us at <a href="mailto:hello@lumiere.example" className="text-gold">hello@lumiere.example</a></p>
                <p className="mt-2">Or call <strong>+233 20 000 0000</strong></p>
            </div>
        </div>
    );
};

export default Contact;
