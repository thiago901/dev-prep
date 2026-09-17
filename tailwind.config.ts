import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/theme';

/**
 * Colours are declared as space-separated RGB channels in src/styles/index.css
 * so the same token name resolves differently per theme while keeping
 * Tailwind's opacity modifiers working (`text-legend/60`).
 */
const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Booth: the acoustically dead room the study position sits in.
        booth: channel('lab-booth'),
        felt: channel('lab-felt'),
        // Chassis and plate: the deck itself and its raised faceplate.
        chassis: channel('lab-chassis'),
        plate: channel('lab-plate'),
        rule: channel('lab-rule'),
        'rule-strong': channel('lab-rule-strong'),
        // Legend: the silkscreen printed on the faceplate.
        legend: channel('lab-legend'),
        'legend-2': channel('lab-legend-2'),
        'legend-3': channel('lab-legend-3'),
        // Brass: VU illumination. Brand accent and the caution state.
        brass: channel('lab-brass'),
        'brass-dim': channel('lab-brass-dim'),
        // Monitor green: level is good, the rating is current.
        monitor: channel('lab-green'),
        'monitor-dim': channel('lab-green-dim'),
        // Record red: armed or rolling, and genuine failure.
        record: channel('lab-red'),
        'record-ink': channel('lab-red-ink'),
        'record-dim': channel('lab-red-dim'),
        // Channel two: the model track, cool and inert until unlocked.
        channel2: channel('lab-cool'),
        'channel2-dim': channel('lab-cool-dim'),
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        legend: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // A measured scale. Display tops out well below the 6rem ceiling
        // because this is an Operate surface, not a poster.
        micro: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.08em' }],
        meta: ['0.75rem', { lineHeight: '1.125rem', letterSpacing: '0.02em' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.65' }],
        prompt: ['1.375rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'prompt-lg': ['1.75rem', { lineHeight: '1.32', letterSpacing: '-0.018em' }],
        deck: ['2.25rem', { lineHeight: '1.16', letterSpacing: '-0.025em' }],
      },
      borderRadius: {
        // Equipment is machined, not pillowed.
        panel: '5px',
        control: '3px',
        lamp: '999px',
      },
      boxShadow: {
        // Real offset plus blur. No zero-offset haloes.
        panel: '0 1px 2px rgb(0 0 0 / 0.35), 0 8px 24px -12px rgb(0 0 0 / 0.55)',
        raised: '0 1px 0 rgb(var(--lab-highlight) / 0.06) inset, 0 2px 6px rgb(0 0 0 / 0.4)',
        pressed: '0 1px 3px rgb(0 0 0 / 0.5) inset',
        lamp: '0 0 0 1px rgb(var(--lab-rule) / 1)',
      },
      transitionTimingFunction: {
        // Transport mechanics: fast engage, settled release.
        engage: 'cubic-bezier(0.22, 1, 0.36, 1)',
        detent: 'cubic-bezier(0.32, 0, 0.67, 0)',
      },
      spacing: {
        rail: '13.5rem',
        transport: '4.5rem',
      },
      maxWidth: {
        // Body measure held inside the 65-75ch band.
        read: '68ch',
        deck: '78rem',
      },
      keyframes: {
        'lamp-roll': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
        'needle-settle': {
          '0%': { transform: 'translateY(2px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'tape-engage': {
          '0%': { transform: 'scaleY(0.82)', opacity: '0' },
          '100%': { transform: 'scaleY(1)', opacity: '1' },
        },
      },
      animation: {
        'lamp-roll': 'lamp-roll 1.6s ease-in-out infinite',
        'needle-settle': 'needle-settle 240ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'tape-engage': 'tape-engage 260ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [
    heroui({
      // HeroUI primitives inherit the lab world rather than arriving as
      // stock components inside a committed form.
      layout: {
        radius: { small: '3px', medium: '5px', large: '6px' },
        borderWidth: { small: '1px', medium: '1px', large: '2px' },
        fontSize: { tiny: '0.6875rem', small: '0.8125rem', medium: '0.9375rem', large: '1.0625rem' },
      },
      themes: {
        dark: {
          colors: {
            background: '#110D0A',
            foreground: '#EDE8DE',
            divider: '#362E27',
            focus: '#C9913D',
            content1: '#1F1914',
            content2: '#29221C',
            content3: '#362E27',
            content4: '#483F37',
            default: {
              50: '#17120E',
              100: '#1F1914',
              200: '#29221C',
              300: '#362E27',
              400: '#483F37',
              500: '#8A847A',
              600: '#B4ADA1',
              700: '#D3CDC1',
              800: '#EDE8DE',
              900: '#F7F4EE',
              foreground: '#EDE8DE',
              DEFAULT: '#29221C',
            },
            primary: {
              50: '#2A1F0E',
              100: '#3E2E14',
              200: '#6B4E20',
              300: '#96702E',
              400: '#B5843A',
              500: '#C9913D',
              600: '#D6A559',
              700: '#E2BC81',
              800: '#EDD3AC',
              900: '#F6E9D6',
              foreground: '#17140D',
              DEFAULT: '#C9913D',
            },
            success: { DEFAULT: '#79A98A', foreground: '#110D0A' },
            warning: { DEFAULT: '#C9913D', foreground: '#17140D' },
            danger: { DEFAULT: '#D6483B', foreground: '#FFF4F2' },
            secondary: { DEFAULT: '#8496A6', foreground: '#110D0A' },
          },
        },
        light: {
          colors: {
            background: '#E8E3D9',
            foreground: '#17150F',
            divider: '#CFC8B9',
            focus: '#8A5B12',
            content1: '#F4F1EA',
            content2: '#FFFFFF',
            content3: '#DED8CC',
            content4: '#CFC8B9',
            default: {
              50: '#FFFFFF',
              100: '#F4F1EA',
              200: '#DED8CC',
              300: '#CFC8B9',
              400: '#B3AB9A',
              500: '#6B655A',
              600: '#4B463C',
              700: '#2E2A22',
              800: '#17150F',
              900: '#0C0B08',
              foreground: '#17150F',
              DEFAULT: '#DED8CC',
            },
            primary: {
              500: '#8A5B12',
              foreground: '#FFFBF4',
              DEFAULT: '#8A5B12',
            },
            success: { DEFAULT: '#2C6543', foreground: '#FFFFFF' },
            warning: { DEFAULT: '#8A5B12', foreground: '#FFFBF4' },
            danger: { DEFAULT: '#A8291D', foreground: '#FFF4F2' },
            secondary: { DEFAULT: '#3C4F61', foreground: '#FFFFFF' },
          },
        },
      },
    }),
  ],
} satisfies Config;
