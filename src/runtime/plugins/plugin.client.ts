import { defineNuxtPlugin } from '#app'
import { useRuntimeConfig } from '#imports'
import type { CreateLocaleInstanceArgs, MolliePlugin, MollieOptions } from '../../types'

export default defineNuxtPlugin({
    name: 'mollie-instance',
    enforce: 'pre',

    async setup(nuxtApp) {
        if (!window.Mollie) {
            console.error(
                "mollie-register plugin didn't register required scripts, thus mollie instance cannot be created.",
            )
        }
        const runtimeConfig = useRuntimeConfig()

        const mollieOptions = runtimeConfig?.public?.mollie as MollieOptions

        function createLocaleInstance(args: CreateLocaleInstanceArgs) {
            if (!args) {
                args = {
                    profileId: mollieOptions.profileId,
                    testMode: mollieOptions.testMode,
                    locale: mollieOptions.defaultLocale,
                }
            }

            const { profileId, testMode, locale } = args

            return profileId
                ? window.Mollie(profileId, {
                      locale: locale ?? 'en_US',
                      testmode: typeof testMode === 'boolean' ? testMode : true,
                  })
                : null
        }

        const Mollie: MolliePlugin = {
            mollieInstance: null,
            createMollieInstance: function (args: CreateLocaleInstanceArgs) {
                this.mollieInstance = this.mollieInstance || createLocaleInstance(args)
                return this.mollieInstance
            },
        }

        nuxtApp.provide('mollie', Mollie)
    },
})
