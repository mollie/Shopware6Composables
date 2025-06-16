import { defineNuxtModule, addPlugin, addImports, createResolver, addComponent } from '@nuxt/kit'

import type { MollieOptions } from './types'
import { defu } from 'defu'

export default defineNuxtModule<MollieOptions>({
    meta: {
        name: 'nuxt-mollie-payments-components',
        configKey: 'molliePaymentsComponents',
    },
    defaults: {
        profileId: '',
        defaultLocale: 'en_US',
        testMode: false,
        includeScriptGlobally: true,
    },
    async setup(options, nuxt) {
        const resolver = createResolver(import.meta.url)
        nuxt.options.runtimeConfig.public.molliePaymentsComponents = defu(
            nuxt.options.runtimeConfig.public.molliePaymentsComponents as MollieOptions,
            options,
        )

        addPlugin({
            src: resolver.resolve('./runtime/plugins/plugin.server'),
            mode: 'server',
        })

        addPlugin({
            src: resolver.resolve('./runtime/plugins/plugin.client'),
            mode: 'client',
        })

        addComponent({
            name: 'MollieCreditCardComponent',
            filePath: resolver.resolve('./runtime/components/MollieCreditCardComponent.vue'),
        })

        addComponent({
            name: 'MollieCreditCardMandates',
            filePath: resolver.resolve('./runtime/components/MollieCreditCardMandates.vue'),
        })

        addComponent({
            name: 'MollieCreditCardRemoveMandates',
            filePath: resolver.resolve('./runtime/components/MollieCreditCardRemoveMandates.vue'),
        })

        addImports([
            {
                name: 'useMollieCreditCard',
                as: 'useMollieCreditCard',
                from: resolver.resolve('./runtime/composables/useMollieCreditCard'),
            },
            {
                name: 'useMollie',
                as: 'useMollie',
                from: resolver.resolve('./runtime/composables/useMollie'),
            },
            {
                name: 'useShopwareMollie',
                as: 'useShopwareMollie',
                from: resolver.resolve('./runtime/composables/useShopwareMollie'),
            },
        ])

        addComponent({
            name: 'ShopwareFrontendsCreditCard',
            filePath: resolver.resolve('./runtime/components/ShopwareFrontendsCreditCard.vue'),
        })

        addComponent({
            name: 'ShopwareFrontendsCreditCardRemoveMandates',
            filePath: resolver.resolve('./runtime/components/ShopwareFrontendsCreditCardRemoveMandates.vue'),
        })

        addComponent({
            name: 'ShopwareFrontendsIdeal',
            filePath: resolver.resolve('./runtime/components/ShopwareFrontendsIdeal.vue'),
        })

        addComponent({
            name: 'ShopwareFrontendsPos',
            filePath: resolver.resolve('./runtime/components/ShopwareFrontendsPos.vue'),
        })
    },
})
