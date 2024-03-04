import { defineNuxtModule, addPlugin, addImports, createResolver, addComponent } from '@nuxt/kit'

import type { MollieOptions } from './types'
import { resolveOwnDependency } from './utils'

export default defineNuxtModule<MollieOptions>({
    meta: {
        name: 'mollie',
        configKey: 'mollie',
    },
    async setup(options, nuxt) {
        const resolver = createResolver(import.meta.url)
        nuxt.options.runtimeConfig.public.mollie ||= options

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
        ])

        const composablesDependency = await resolveOwnDependency('@shopware-pwa/composables-next', nuxt)

        const apiClientDependency = await resolveOwnDependency('@shopware/api-client', nuxt)

        if (composablesDependency && apiClientDependency) {
            nuxt.options.alias['@shopware-pwa/composables-next'] = composablesDependency

            nuxt.options.alias['@shopware/api-client'] = apiClientDependency

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
        } else {
            console.warn(
                '@shopware-pwa/composables-next or @shopware/api-client package is missing. ShopwareFrontendsCreditCard, ShopwareFrontendsIdeal and ShopwareFrontendsPos components were not registered.',
            )
        }
    },
})
