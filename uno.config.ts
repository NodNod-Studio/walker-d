import { defineConfig, presetIcons, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
    presetIcons({
      // The auto loader fails to import the icons JSON on recent Node versions, so register the sets explicitly
      collections: {
        'logos': () => import('@iconify-json/logos').then(i => i.icons),
        'ph': () => import('@iconify-json/ph').then(i => i.icons),
        'vscode-icons': () => import('@iconify-json/vscode-icons').then(i => i.icons),
      },
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
        'flex-shrink': '0',
      },
    }),
  ],

  shortcuts: {
    'motion-base': 'transition-opacity,transform,colors duration-500 ease-custom-circ will-change-transform',
    'motion-snug': 'transition-opacity,transform,colors duration-300 ease-custom-circ will-change-transform',
    'motion-natural': 'transition-opacity,transform,colors duration-700 ease-custom-circ will-change-transform',
    'motion-relaxed': 'transition-opacity,transform,colors duration-1000 ease-custom-circ will-change-transform',

    // Building blocks for the documentation guides (components/docs)
    'docs-steps': 'mt-6 pl-5 list-decimal flex flex-col gap-2.4 text-3.6 leading-normal',
    'docs-note': 'mt-4 p-3 rounded-1.5 bg-linen text-3.4 text-ink/70',
    'docs-link': 'block mt-4 px-3.2 py-2.4 rounded-1.5 bg-linen text-ink text-3.6 no-underline',
    'docs-kbd': 'font-inherit text-[0.8em] px-[0.4em] py-[0.1em] rounded-1 bg-linen border border-[#e5e5e3]',
  },

  theme: {
    colors: {
      ink: '#111111',
      linen: '#f5f5f3',
    },
    font: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      brand: '"ABCPelikan", Arial, sans-serif',
    },
    ease: {
      'custom-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      'custom-power': 'cubic-bezier(0.76, 0, 0.24, 1)',
      'custom-expo2': 'cubic-bezier(0.83, 0, 0.17, 1)',
      'custom-circ': 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  },
})
