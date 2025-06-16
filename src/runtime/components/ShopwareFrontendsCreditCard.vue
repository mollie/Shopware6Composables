<script setup lang="ts">
import type { MollieConfig, MollieLocale, ShopwareLocale } from '../../types'
import { computed, ref } from 'vue'
import { useShopwareContext, useUser, useAsyncData, watch } from '#imports'
import { ApiClientError } from '@shopware/api-client'
import { shopwareLocaleToMollieLocale } from '../utils/localeTransformer'
import { useShopwareMollie } from '../composables/useShopwareMollie'

const emits = defineEmits<{
    (e: 'submit', token: string | undefined): void
    (e: 'error', error: string | undefined): void
    (e: 'store-mandate', mandateId: string | undefined): void
    (e: 'should-save-card-details', shouldSave: boolean): void
    (e: 'mounted', value: boolean): void
    (e: 'config-loaded', config: MollieConfig): void
}>()

const props = defineProps<{
    locale?: MollieLocale
    submitButtonLabel?: string
    submitDisabled?: boolean
    saveCardDetailsCheckboxLabel?: string
    mandatesSelectDisabledOption?: string
    mandateOrNewText?: string
    hideSaveButton?: boolean
}>()

const { apiClient } = useShopwareContext()

const { mollieConfig } = useShopwareMollie({ locale: props.locale })
watch(mollieConfig, () => {
    if (mollieConfig.value) {
        emits('config-loaded', mollieConfig.value)
    }
})

const { user } = useUser()

// determines if one click payments are actived in the mollie plugin
const oneClickPaymentsActive = computed(() => mollieConfig.value?.oneClickPayments)
// determines if credit card details should be saved
const shouldSaveCardDetail = ref(false)

// get the mandates for the user if one click payments are active
const { data: mandates } = await useAsyncData('mollieMandates', async () => {
    if (!oneClickPaymentsActive.value || !user.value?.id) return []

    try {
        const response = await apiClient.invoke('getMandates get /mollie/mandates/{userId}', {
            userId: user.value?.id,
        })
        return response?.data.mandates
    } catch (error) {
        if (error instanceof ApiClientError) {
            console.error(error)
        } else {
            console.error('==>', error)
        }
    }
})

const onCreditCardSubmit = async (token: string | undefined) => {
    try {
        await apiClient.invoke('saveCardToken post /mollie/creditcard/store-token/{userId}/{token}', {
            userId: user.value?.id,
            token: token,
            shouldSaveCardDetail: shouldSaveCardDetail.value,
        })
    } catch (error) {
        if (error instanceof ApiClientError) {
            console.error(error)
        } else {
            console.error('==>', error)
        }
    }

    emits('submit', token)
}

const onCreditCardError = async (error: string | undefined) => {
    emits('error', error)
}

// called when the user changes the save card details checkbox
const onSaveCardChange = (value: boolean) => {
    shouldSaveCardDetail.value = value
    emits('should-save-card-details', value)
}

const newCardSelectValue = 'NEW'
const currentMandateId = ref()
const showNewCardForm = computed(
    () =>
        currentMandateId.value === newCardSelectValue ||
        !oneClickPaymentsActive.value ||
        !mandates?.value ||
        mandates?.value?.length === 0,
)

const onMandateChange = async (mandateId: string | undefined) => {
    currentMandateId.value = mandateId
    if (currentMandateId.value === newCardSelectValue) {
        emits('store-mandate', null)
    } else {
        emits('store-mandate', currentMandateId.value)
    }
}
</script>

<template>
    <div class="shopware-frontends-credit-card">
        <MollieCreditCardMandates
            v-if="oneClickPaymentsActive && mandates && mandates.length > 0"
            :mandates="mandates"
            :select-disable-option="mandatesSelectDisabledOption"
            :mandate-or-new-text="mandateOrNewText"
            :new-card-select-value="newCardSelectValue"
            @change-mandate="onMandateChange"
        />

        <MollieCreditCardComponent
            v-show="showNewCardForm"
            :mollie-config="mollieConfig"
            :submit-button-label="submitButtonLabel"
            :submit-disabled="submitDisabled"
            :save-card-details-checkbox-label="saveCardDetailsCheckboxLabel"
            :hide-save-button="hideSaveButton"
            @submit="onCreditCardSubmit"
            @error="onCreditCardError"
            @save-card-change="onSaveCardChange"
            @mounted="emits('mounted', true)"
        />
    </div>
</template>
