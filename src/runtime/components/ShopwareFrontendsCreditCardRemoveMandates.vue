<script setup lang="ts">
import { useShopwareContext, useUser } from '@shopware-pwa/composables-next'
import type { MollieLocale } from '../../types'
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { ApiClientError } from '@shopware/api-client'

const emits = defineEmits<{
    (e: 'remove-mandate', mandateId: string | undefined): void
}>()

const props = defineProps<{
    locale?: MollieLocale
    removeMandateButtonText?: string
}>()

const { apiClient } = useShopwareContext()

// get the mollie config
const { data: mollieConfig } = await useAsyncData('mollieConfig', async () => {
    try {
        return await apiClient.invoke('getConfig get /mollie/config')
    } catch (error) {
        if (error instanceof ApiClientError) {
            console.error(error)
        } else {
            console.error('==>', error)
        }
    }
})

// use the locale from the props if it exists, otherwise use the locale from the mollie config
if (mollieConfig.value && props.locale) mollieConfig.value.locale = props.locale

const { user } = useUser()

// determines if one click payments are actived in the mollie plugin
const oneClickPaymentsActive = computed(() => mollieConfig.value?.oneClickPayments)

const getMandates = async () => {
    if (!oneClickPaymentsActive.value || !user.value?.id) return []

    try {
        const response = await apiClient.invoke(`getMandates get /mollie/mandates/${user.value?.id}`)
        return response?.mandates
    } catch (error) {
        if (error instanceof ApiClientError) {
            console.error(error)
        } else {
            console.error('==>', error)
        }
    }
}

// get the mandates for the user if one click payments are active
const { data: mandates } = await useAsyncData('mollieMandates', async () => getMandates())

const onRemoveMandate = async (mandateId: string | undefined) => {
    try {
        await apiClient.invoke(`revokeMandate post /mollie/mandate/revoke/${user.value?.id}/${mandateId}`)

        // reload mandates
        mandates.value = await getMandates()
    } catch (error) {
        if (error instanceof ApiClientError) {
            console.error(error)
        } else {
            console.error('==>', error)
        }
    }

    emits('remove-mandate', mandateId)
}
</script>

<template>
    <div class="shopware-frontends-credit-card-remove-mandates">
        <MollieCreditCardRemoveMandates
            :mandates="mandates"
            :remove-mandate-button-text="removeMandateButtonText"
            @remove-mandate="onRemoveMandate"
        />
    </div>
</template>
