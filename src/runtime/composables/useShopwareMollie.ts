import { useAsyncData, useShopwareContext } from '#imports'
import type { MollieLocale, ShopwareLocale } from '../../types'
import { shopwareLocaleToMollieLocale } from '../utils/localeTransformer'
import { ApiClientError } from '@shopware/api-client'

export const useShopwareMollie = (options?: { locale?: MollieLocale }) => {
    const { apiClient } = useShopwareContext()

    // get the mollie config
    const { data: mollieConfig } = useAsyncData('mollieConfig', async () => {
        try {
            const config = await apiClient.invoke('getConfig get /mollie/config')

            // use the locale from the props if it exists, otherwise use the locale from the mollie config
            // the locale-code from Shopware is in another format than the one from Mollie, so those have to be aligned.
            if (config.data) {
                const localeFromShopware = config.data.locale as ShopwareLocale
                const mollieLocale = shopwareLocaleToMollieLocale(localeFromShopware)
                config.data.locale = options?.locale ?? mollieLocale
            }

            return config.data
        } catch (error) {
            if (error instanceof ApiClientError) {
                console.error(error)
            } else {
                console.error('==>', error)
            }
        }
    })

    return {
        mollieConfig,
    }
}
