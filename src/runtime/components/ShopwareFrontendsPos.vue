<script setup lang="ts">
import { useMollie, useAsyncData, useShopwareContext, useUser } from '#imports'
import { onMounted, ref, type Ref } from 'vue'
import type { MolliePosTerminal, MollieLocale, ShopwareLocale } from '../../types'
import { ApiClientError } from '@shopware/api-client'
import { shopwareLocaleToMollieLocale } from '../utils/localeTransformer'

const emits = defineEmits<{
    (e: 'get-terminals-error', error: string | undefined): void
    (e: 'save-terminal-error', error: string | undefined): void
    (e: 'save-terminal-success'): void
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

const terminals: Ref<MolliePosTerminal[] | []> = ref([])
const selectedTerminal = ref<string | undefined>(undefined)

const getPosTerminals = async () => {
    try {
        const terminalsResponse = await apiClient.invoke('getIssuers get /mollie/pos/terminals')

        terminals.value = terminalsResponse?.data.terminals
    } catch (error) {
        if (error instanceof ApiClientError) {
            console.error(error)
        } else {
            console.error('==>', error)
        }
        emits('get-terminals-error', error as string)
    }
}

const savePosTerminal = async () => {
    try {
        await apiClient.invoke('storeTerminal post /mollie/pos/store-terminal/{userId}/{terminalId}', {
            userId: user.value?.id,
            terminalId: selectedTerminal.value,
        })
        emits('save-terminal-success')
    } catch (error) {
        if (error instanceof ApiClientError) {
            console.error(error)
        } else {
            console.error('==>', error)
        }
        emits('save-terminal-error', error.messages[0].detail)
    }
}

onMounted(async () => {
    await init()
    await getPosTerminals()
})
</script>

<template>
    <div class="mollie-pos">
        <label for="molliePosSelect">
            {{ selectLabel ?? `Please choose your terminal:` }}
        </label>
        <select
            id="molliePosSelect"
            v-model="selectedTerminal"
            class="mollie-select mollie-pos-select"
            @change="savePosTerminal"
        >
            <option
                value=""
                disabled
                selected
            >
                {{ selectDisabledOption ?? `Select your terminal` }}
            </option>
            <option
                v-for="terminal in terminals"
                :key="terminal.id"
                :value="terminal.id"
            >
                {{ terminal.name }}
            </option>
        </select>
    </div>
</template>

<style scoped>
@import '../assets/css/mollie-select.css';
</style>
