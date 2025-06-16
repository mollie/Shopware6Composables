<script setup lang="ts">
import { useMollie, useAsyncData, useShopwareContext, useUser } from '#imports'
import { onMounted, ref, type Ref } from 'vue'
import type { MollieIdealIssuer, MollieLocale, ShopwareLocale } from '../../types'
import { ApiClientError } from '@shopware/api-client'
import { shopwareLocaleToMollieLocale } from '../utils/localeTransformer'

const emits = defineEmits<{
    (e: 'get-issuers-error', error: string | undefined): void
    (e: 'save-issuer-error', error: string | undefined): void
    (e: 'save-issuer-success'): void
}>()

const props = defineProps<{
    locale?: MollieLocale
    selectLabel?: string
    selectDisabledOption?: string
}>()

const { apiClient } = useShopwareContext()

const { data: mollieConfig } = await useAsyncData('mollieConfig', async () => {
    try {
        const config = await apiClient.invoke('getConfig get /mollie/config')
        // use the locale from the props if it exists, otherwise use the locale from the mollie config
        // the locale-code from Shopware is in another format than the one from Mollie, so those have to be aligned.
        if (config.data) {
            const localeFromShopware = config.data.locale as ShopwareLocale
            const mollieLocale = shopwareLocaleToMollieLocale(localeFromShopware)
            config.data.locale = props.locale ?? mollieLocale
        }
        return config
    } catch (error) {
        if (error instanceof ApiClientError) {
            console.error(error)
        } else {
            console.error('==>', error)
        }
    }
})

const { init } = useMollie(mollieConfig.value)
const { user } = useUser()

const issuers: Ref<MollieIdealIssuer[] | []> = ref([])
const activeIssuer = ref<string | undefined>(undefined)

const getIdealIssuers = async () => {
    try {
        const issuersResponse = await apiClient.invoke('getIssuers get /mollie/ideal/issuers')
        issuers.value = issuersResponse?.data.issuers
    } catch (error) {
        if (error instanceof ApiClientError) {
            console.error(error)
        } else {
            console.error('==>', error)
        }

        emits('get-issuers-error', error as string)
    }
}

const saveIdealIssuer = async () => {
    try {
        await apiClient.invoke('storeIssuer post /mollie/ideal/store-issuer/{userId}/{issuerId}', {
            userId: user.value?.id,
            issuerId: activeIssuer.value,
        })
        emits('save-issuer-success')
    } catch (error) {
        if (error instanceof ApiClientError) {
            console.error(error)
        } else {
            console.error('==>', error)
        }

        emits('save-issuer-error', error.messages[0].detail)
    }
}

onMounted(async () => {
    await init()
    await getIdealIssuers()
})
</script>

<template>
    <div class="mollie-ideal">
        <label for="mollieIdealSelect">
            {{ selectLabel ?? `Please choose your issuer:` }}
        </label>
        <select
            id="mollieIdealSelect"
            v-model="activeIssuer"
            class="mollie-select mollie-ideal-select"
            @change="saveIdealIssuer"
        >
            <option
                value=""
                disabled
                selected
            >
                {{ selectDisabledOption ?? `Select your issuer` }}
            </option>
            <option
                v-for="issuer in issuers"
                :key="issuer.id"
                :value="issuer.id"
            >
                {{ issuer.name }}
            </option>
        </select>
    </div>
</template>

<style scoped>
@import '../assets/css/mollie-select.css';
</style>
