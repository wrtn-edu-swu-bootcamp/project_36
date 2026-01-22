import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7FA99B',
          50: '#F5F9F8',
          100: '#E6F1EE',
          200: '#C2DDD4',
          300: '#9EC9BA',
          400: '#7FA99B',
          500: '#6A9184',
          600: '#55796D',
          700: '#406156',
          800: '#2B493F',
          900: '#163128',
        },
        success: {
          DEFAULT: '#9CAF88',
          light: '#E8F0E1',
          dark: '#7A8F6A',
        },
        warning: {
          DEFAULT: '#E8A87C',
          light: '#FEF8E7',
          dark: '#D68F5E',
        },
        danger: {
          DEFAULT: '#D48A88',
          light: '#FCE8E8',
          dark: '#B96F6D',
        },
        neutral: {
          cream: '#F8F9F6',
          gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          },
        },
      },
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        'display-1': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-2': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        h1: ['2rem', { lineHeight: '1.3', fontWeight: '700' }],
        h2: ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
        h4: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        small: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        modal: '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
};

export default config;
