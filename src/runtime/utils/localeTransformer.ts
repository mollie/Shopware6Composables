import type { MollieLocale, ShopwareLocale } from '../../types'

export const shopwareLocaleToMollieLocale = (shopwareLocale: ShopwareLocale): MollieLocale =>
    shopwareLocale.replace('-', '_') as MollieLocale
