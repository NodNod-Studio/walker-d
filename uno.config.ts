import { defineConfig, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
  ],

  shortcuts: {
    'motion-base': 'transition-opacity,transform,colors duration-500 ease-custom-circ will-change-transform',
    'motion-snug': 'transition-opacity,transform,colors duration-300 ease-custom-circ will-change-transform',
    'motion-natural': 'transition-opacity,transform,colors duration-700 ease-custom-circ will-change-transform',
    'motion-relaxed': 'transition-opacity,transform,colors duration-1000 ease-custom-circ will-change-transform',
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
