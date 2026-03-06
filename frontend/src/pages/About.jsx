import React from 'react';
import { useNavigate } from 'react-router-dom';

const About = () => {
    const navigate = useNavigate();
    return (
        <div className="max-w-7xl mx-auto px-4 py-24">
            <div className="text-center mb-12">
                <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">Our Story</p>
                <h1 className="font-display text-4xl lg:text-5xl font-light">About Lumière Cosmetics</h1>
            </div>

            <div className="prose prose-invert max-w-3xl mx-auto text-espresso/90">
                <p>
                    Lumière Cosmetics curates luxury beauty from the world's most cherished brands. We bring
                    authentic skincare, makeup and ritual products to discerning customers in Ghana, backed by
                    a commitment to quality, authenticity and exceptional service.
                </p>

                <p>
                    Founded with a passion for elevating daily beauty rituals, our team sources products from
                    authorized distributors and partners to ensure every item is genuine and responsibly
                    handled. We believe in thoughtful curation, transparency, and the power of self-care.
                </p>

                <div className="text-center mt-8">
                    <button onClick={() => navigate('/shop')} className="border border-espresso text-espresso px-8 py-3 uppercase text-xs font-bold tracking-[0.2em] hover:bg-espresso hover:text-ivory transition-all duration-300">Shop Now</button>
                </div>
            </div>
        </div>
    );
};

export default About;
