<script setup lang="ts">
import { useMollieCreditCard, useMollie } from '#imports'
import { onMounted, ref } from 'vue'
import type { MollieConfig } from '../../types'

const emits = defineEmits<{
    (e: 'submit', token: string | undefined): void
    (e: 'error', error: string | undefined): void
    (e: 'save-card-change', value: boolean): void
    (e: 'mounted', value: boolean): void
}>()

const props = defineProps<{
    mollieConfig?: MollieConfig
    submitButtonLabel?: string
    submitDisabled?: boolean
    saveCardDetailsCheckboxLabel?: string
    hideSaveButton?: boolean
}>()

const { init, getToken } = useMollie()

const { mount } = useMollieCreditCard({
    elementId: 'mollie-credit-card-container',
})

const onCreditCardSubmit = async () => {
    try {
        const token = await getToken()
        emits('submit', token)
    } catch (error) {
        emits('error', error as string)
    }
}

const shouldSaveCardDetailsIsChecked = ref(false)
const onSaveCardChange = () => {
    emits('save-card-change', shouldSaveCardDetailsIsChecked.value)
}

onMounted(async () => {
    await init(props.mollieConfig)
    await mount()
    emits('mounted', true)
})
</script>

<template>
    <div class="mollie-credit-card">
        <div
            id="mollie-credit-card-container"
            class="mollie-credit-card-container"
        />

        <div
            v-if="mollieConfig && mollieConfig.oneClickPayments"
            class="mollie-credit-card__save-card-details-checkbox"
        >
            <input
                id="creditCardSaveCardDetails"
                v-model="shouldSaveCardDetailsIsChecked"
                class="mollie-credit-card__save-card-details-checkbox-input"
                type="checkbox"
                @change="onSaveCardChange"
            />
            <label
                for="creditCardSaveCardDetails"
                class="mollie-credit-card__save-card-details-checkbox-label"
            >
                <span
                    class="mollie-credit-card__save-card-details-checkbox-styled"
                    :class="{ 'is-checked': shouldSaveCardDetailsIsChecked }"
                />
                {{ saveCardDetailsCheckboxLabel ?? `Save card details` }}
            </label>
        </div>

        <button
            v-if="!hideSaveButton"
            :disabled="submitDisabled"
            class="mollie-credit-card__button"
            :class="{ 'button-disabled': submitDisabled }"
            @click="onCreditCardSubmit"
        >
            {{ submitButtonLabel ?? `Store credit card data` }}
        </button>
    </div>
</template>

<style>
@import '../assets/css/mollie-credit-card.css';
</style>
