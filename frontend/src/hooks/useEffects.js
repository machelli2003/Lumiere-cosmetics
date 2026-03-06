import { useEffect } from 'react';

// ── Custom Cursor ───────────────────────────────────────────
export const useCursor = () => {
    useEffect(() => {
        const dot = document.getElementById('cursor-dot');
        const ring = document.getElementById('cursor-ring');
        if (!dot || !ring) return;

        let ringX = 0, ringY = 0;
        let dotX = 0, dotY = 0;
        let animFrame;

        const onMove = (e) => {
            dotX = e.clientX;
            dotY = e.clientY;
        };

        const animate = () => {
            // Dot follows instantly
            dot.style.left = dotX + 'px';
            dot.style.top = dotY + 'px';

            // Ring follows with lag
            ringX += (dotX - ringX) * 0.15;
            ringY += (dotY - ringY) * 0.15;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';

            animFrame = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', onMove);
        animate();

        return () => {
            window.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(animFrame);
        };
    }, []);
};

// ── Scroll Reveal ───────────────────────────────────────────
export const useScrollReveal = () => {
    useEffect(() => {
        const elements = document.querySelectorAll('.reveal');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        elements.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    });
};

// ── Navbar scroll effect ────────────────────────────────────
export const useNavbarScroll = () => {
    useEffect(() => {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        const onScroll = () => {
            if (window.scrollY > 40) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
};

// ── Page transition ─────────────────────────────────────────
export const usePageTransition = () => {
    useEffect(() => {
        const main = document.querySelector('main');
        if (!main) return;
        main.classList.add('page-enter');
        const t = setTimeout(() => main.classList.remove('page-enter'), 600);
        return () => clearTimeout(t);
    });
};

// ── Flying cart animation ───────────────────────────────────
export const flyToCart = (fromElement) => {
    if (!fromElement) return;

    const cartBtn = document.querySelector('[data-cart-btn]');
    if (!cartBtn) return;

    const fromRect = fromElement.getBoundingClientRect();
    const toRect = cartBtn.getBoundingClientRect();

    const particle = document.createElement('div');
    particle.className = 'fly-to-cart';
    particle.style.left = fromRect.left + fromRect.width / 2 + 'px';
    particle.style.top = fromRect.top + fromRect.height / 2 + 'px';
    particle.style.setProperty('--tx', (toRect.left - fromRect.left) + 'px');
    particle.style.setProperty('--ty', (toRect.top - fromRect.top) + 'px');
    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
        // Bounce cart badge
        const badge = document.querySelector('[data-cart-badge]');
        if (badge) {
            badge.classList.remove('cart-badge-bump');
            void badge.offsetWidth; // Force reflow for re-triggering
            badge.classList.add('cart-badge-bump');
        }
    }, 700);
};