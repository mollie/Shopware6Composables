<script setup lang="ts">
import type { MollieCreditCardMandate } from '../../types'

const emits = defineEmits<{
    (e: 'remove-mandate', id: string | undefined): void
}>()

defineProps<{
    mandates: MollieCreditCardMandate[]
    removeMandateButtonText?: string
}>()

const removeMandate = async (id: string) => {
    emits('remove-mandate', id)
}
</script>

<template>
    <div class="mollie-credit-card-mandates-remove">
        <div
            v-for="mandate in mandates"
            :key="mandate.id"
            class="mollie-credit-card-mandates-remove__item"
        >
            <div class="mollie-credit-card-mandates-remove__item-text">
                {{ mandate.details.cardLabel }} - {{ mandate.details.cardHolder }} - ****
                {{ mandate.details.cardNumber }}
            </div>

            <button
                class="mollie-credit-card__button"
                title="removeMandateButtonText ?? 'Remove'"
                @click="removeMandate(mandate.id)"
            >
                {{ removeMandateButtonText ?? 'Remove' }}
            </button>
        </div>
    </div>
</template>

<style>
@import '../assets/css/mollie-credit-card.css';
</style>
