import { defineNuxtPlugin } from '#app'
import { useServerHead, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
    name: 'mollie-register',
    enforce: 'pre',

    async setup() {
        const config = useRuntimeConfig().public.molliePaymentsComponents
        if (config.includeScriptGlobally) {
            useServerHead({
                script: [
                    {
                        src: 'https://js.mollie.com/v1/mollie.js',
                        defer: true,
                    },
                ],
            })
        }
    },
})
