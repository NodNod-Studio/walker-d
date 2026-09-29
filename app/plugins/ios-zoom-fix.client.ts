const IOS_DEVICE_REGEX = /iPad|iPhone|iPod/
const LOCKED_VIEWPORT = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'

export default defineNuxtPlugin({
  name: 'ios-zoom-fix',
  parallel: true,
  hooks: {
    'app:mounted': () => {
      const isIOS = IOS_DEVICE_REGEX.test(navigator.userAgent)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

      if (!isIOS)
        return

      useHead({ meta: [{ name: 'viewport', content: LOCKED_VIEWPORT }] })
    },
  },
})
