/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    hover: '#4f46e5',
                },
                accent: '#f43f5e',
                dim: '#94a3b8',
                glass: {
                    bg: 'rgba(30, 41, 59, 0.7)',
                    border: 'rgba(255, 255, 255, 0.1)',
                },
                panel: {
                    bg: 'rgba(15, 23, 42, 0.5)',
                },
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease forwards',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            backdropBlur: {
                glass: '12px',
            },
        },
    },
    plugins: [],
}
