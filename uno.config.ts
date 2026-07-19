import { defineConfig, presetWind4 } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
  ],

  theme: {
    colors: {
      ink: '#111111',
      linen: '#f5f5f3',
    },
    font: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      brand: '"ABCPelikan", Arial, sans-serif',
    },
  },
})
