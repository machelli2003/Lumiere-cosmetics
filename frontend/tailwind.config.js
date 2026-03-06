export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['Cormorant Garamond', 'serif'],
                sans: ['Jost', 'sans-serif'],
                display: ['Cormorant Garamond', 'serif']
            },
            colors: {
                ivory: { DEFAULT: '#F9F5F0', dark: '#F0E9DF' },
                blush: { DEFAULT: '#D4A5A5', light: '#EDD5D5', dark: '#B08080' },
                espresso: { DEFAULT: '#2C1810', medium: '#5C3D2E', light: '#8B6355' },
                gold: { DEFAULT: '#C9A96E', light: '#E8D5B0', dark: '#A07C3D' },
                sage: { DEFAULT: '#8B9B7A', light: '#C5D0B5' }
            },
            letterSpacing: {
                widest: '.2em',
                ultra: '.4em',
            }
        },
    },
    plugins: [],
}
