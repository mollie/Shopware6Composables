import { useNuxtApp, ref } from '#imports'
import type { CreateLocaleInstanceArgs } from '../../types'

/**
 * Composable function to initialize mollie instance and get payment session token
 */
export function useMollie(args: CreateLocaleInstanceArgs = {}) {
    const { $mollie } = useNuxtApp()
    const isInitialized = ref(false)

    async function init() {
        // Wait for scripts to be loaded, then initialize the mollie instance.
        await $mollie.scriptLoadedPromise.then(() => {
            $mollie.createMollieInstance(args)
            isInitialized.value = true
        })
    }

    async function getToken(): Promise<string | undefined> {
        const mollieResponse = await $mollie.mollieInstance?.createToken()
        if (mollieResponse?.error) {
            console.error(`[useMollie][getToken]: ${mollieResponse.error?.message}`)
            throw mollieResponse.error?.message
        }
        return mollieResponse?.token
    }

    return {
        init,
        getToken,
        isInitialized,
    }
}
