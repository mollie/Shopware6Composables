export type MollieElement = {
    mount(htmlElement: HTMLElement | string): void
    unmount(): void
}
type Mollie = {
    (
        profileId: string,
        options: { locale: string; testmode: boolean },
    ): {
        createToken(): Promise<{ error: Error; token: string }>
        createComponent(
            type: 'card' | 'cardHolder' | 'cardNumber' | 'verificationCode' | 'expiryDate',
            options?: any,
        ): Promise<MollieElement>
    }
}

export type CreateLocaleInstanceArgs = {
    profileId?: string
    testMode?: boolean
    locale?: MollieLocale
}

declare global {
    interface Window {
        Mollie: Mollie
    }
}

export type MolliePlugin = {
    mollieInstance: ReturnType<Mollie> | null
    createMollieInstance(args: CreateLocaleInstanceArgs): void
}
declare module '#app' {
    interface NuxtApp {
        $mollie: MolliePlugin
    }
}

export type MollieLocale =
    | 'en_US'
    | 'nl_NL'
    | 'nl_BE'
    | 'fr_FR'
    | 'fr_BE'
    | 'de_DE'
    | 'de_AT'
    | 'de_CH'
    | 'es_ES'
    | 'ca_ES'
    | 'pt_PT'
    | 'it_IT'
    | 'nb_NO'
    | 'sv_SE'
    | 'fi_FI'
    | 'da_DK'
    | 'is_IS'
    | 'hu_HU'
    | 'pl_PL'
    | 'lv_LV'

export type MollieIdealIssuer = {
    id: string
    images: {
        '1x': string
        '2x': string
        svg: string
    }
    name: string
}

export type MolliePosTerminal = {
    id: string
    name: string
}

export type MollieOptions = {
    profileId: string
    defaultLocale: MollieLocale
    testMode: boolean
}

export type MollieConfig = {
    apiAlias: string
    locale: MollieLocale
    profileId: string
    testMode: boolean
    oneClickPayments: boolean
}

export type MollieCreditCardMandate = {
    apiAlias: string
    beingUsedForSubscription: boolean
    createdAt: string
    customerId: string
    details: {
        apiAlias: string
        cardExpiryDate: string
        cardFingerprint: string
        cardHolder: string
        cardNumber: string
        cardLabel: string
    }
    id: string
    mandateReference: string
    method: string
    mode: string
    resource: string
    signatureDate: string
    status: string
}

declare module 'nuxt/schema' {
    interface NuxtConfig {
        mollie?: MollieOptions
    }

    interface PublicRuntimeConfig {
        mollie: MollieOptions
    }
}

export {}
