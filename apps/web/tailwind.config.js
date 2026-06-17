/**
 * Tailwind config — design system "Luminous Industrial".
 * Token diselaraskan dengan reference/frontend/Reference/luminous_industrial_1/DESIGN.md.
 * @type {import('tailwindcss').Config}
 */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#006c47',
				'on-primary': '#ffffff',
				'primary-container': '#00885a',
				'on-primary-container': '#000703',
				'primary-fixed': '#7efabd',
				'primary-fixed-dim': '#60dda2',
				secondary: '#994700',
				'on-secondary': '#ffffff',
				'secondary-container': '#fe852b',
				'on-secondary-container': '#632c00',
				tertiary: '#555e5b',
				'tertiary-container': '#6e7673',
				background: '#fbf9f7',
				'on-background': '#1b1c1b',
				surface: '#fbf9f7',
				'on-surface': '#1b1c1b',
				'surface-variant': '#e4e2e0',
				'on-surface-variant': '#414942',
				'surface-container-lowest': '#ffffff',
				'surface-container-low': '#f5f3f1',
				'surface-container': '#efeeeb',
				'surface-container-high': '#e9e8e6',
				'surface-container-highest': '#e4e2e0',
				'surface-dim': '#dbdad8',
				outline: '#717972',
				'outline-variant': '#c0c9c0',
				error: '#ba1a1a',
				'on-error': '#ffffff',
				'error-container': '#ffdad6',
				'on-error-container': '#93000a'
			},
			borderRadius: {
				DEFAULT: '0.25rem',
				lg: '0.5rem',
				xl: '0.75rem',
				'2xl': '1.5rem',
				full: '9999px'
			},
			spacing: {
				base: '4px',
				xs: '8px',
				sm: '16px',
				md: '24px',
				lg: '32px',
				xl: '48px',
				gutter: '24px',
				'container-margin': '32px'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif']
			},
			fontSize: {
				'headline-xl': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
				'headline-lg': ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
				'headline-md': ['20px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '600' }],
				'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
				'body-md': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
				'label-sm': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '600' }]
			}
		}
	},
	plugins: []
};
