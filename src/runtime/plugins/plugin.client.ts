import { defineNuxtPlugin } from '#app'
import { useHead, useRuntimeConfig } from '#imports'
import type { CreateLocaleInstanceArgs, MollieOptions, MolliePlugin } from '../../types'

/**
 * Get a promise with its resolvers.
 * This can be replaced by native JS when browser support is better
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers
 */
function getPromiseWithResolvers<T>() {
    let resolve: (value: T | PromiseLike<T>) => void = () => {}
    let reject: (value: T | PromiseLike<T>) => void = () => {}
    const promise = new Promise<T>((res, rej) => {
        resolve = res
        reject = rej
    })

    return { promise, resolve, reject }
}

export default defineNuxtPlugin({
    name: 'mollie-instance',
    enforce: 'pre',

    async setup(nuxtApp) {
        /**
         * Register mollie-script client-side for client-side rendering.
         * If SSR is used, this will NOT register a second script, because it was already registered server side (see server-plugin)
         */
        function loadMollieScript() {
            const { promise, resolve } = getPromiseWithResolvers<boolean>()
            if (window.Mollie) {
                resolve(true)
            } else {
                useHead({
                    script: [
                        {
                            src: 'https://js.mollie.com/v1/mollie.js',
                            defer: true,
                            onload() {
                                resolve(true)
                            },
                        },
                    ],
                })
            }

            return promise
        }

        const runtimeConfig = useRuntimeConfig()
        const mollieOptions = runtimeConfig?.public?.mollie as MollieOptions

        function createLocaleInstance(args: CreateLocaleInstanceArgs) {
            if (!window.Mollie) {
                console.error(
                    "mollie-register plugin didn't register required scripts, thus mollie instance cannot be created.",
                )
            }
            if (!args) {
                args = {
                    profileId: mollieOptions.profileId,
                    testMode: mollieOptions.testMode,
                    locale: mollieOptions.defaultLocale,
                }
            }

            const { profileId, testMode, locale } = args

            return profileId && window.Mollie
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
            loadMollieScript,
        }

        nuxtApp.provide('mollie', Mollie)
    },
})
