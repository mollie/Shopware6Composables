export default defineNuxtConfig({
    extends: ['@shopware-pwa/composables-next/nuxt-layer'],
    modules: ['../src/module', '@shopware-pwa/nuxt3-module'],
    runtimeConfig: {
        public: {
            shopware: {
                shopwareEndpoint: 'https://demo-frontends.shopware.store',
                shopwareAccessToken: 'SWSCBHFSNTVMAWNZDNFKSHLAYW',
            },
        },
    },
    /* config not needed with mollie > v4.4.0 */
    mollie: {
        defaultLocale: 'en_US',
        profileId: 'pfl_E5EmGZ98YT',
        testMode: true,
    },
    devtools: { enabled: true },
})
