<script setup lang="ts">
import type { MollieCreditCardMandate } from '../../types'
import { ref } from 'vue'

const emits = defineEmits<{
    (e: 'change-mandate', mandate: string | undefined): void
}>()

defineProps<{
    mandates: MollieCreditCardMandate[]
    newCardSelectValue: string
    selectDisabledOption?: string
    mandateOrNewText?: string
}>()

const activeMandate = ref<string | undefined>(undefined)

const changeMandate = async () => {
    emits('change-mandate', activeMandate.value)
}
</script>

<template>
    <div class="mollie-credit-card-mandates">
        <div
            v-for="mandate in mandates"
            :key="mandate.id"
            class="mollie-credit-card-mandates__radio"
        >
            <input
                :id="'mandate_' + mandate.id"
                v-model="activeMandate"
                class="mollie-credit-card-mandates__radio-input"
                type="radio"
                :value="mandate.id"
                :checked="mandate.id === activeMandate"
                @change="changeMandate"
            />
            <label
                :for="'mandate_' + mandate.id"
                class="mollie-credit-card-mandates__radio-label"
            >
                <span
                    class="mollie-credit-card-mandates__radio-styled"
                    :class="{ 'is-checked': activeMandate === mandate.id }"
                >
                    <span
                        v-if="activeMandate === mandate.id"
                        class="mollie-credit-card-mandates__radio-styled-checked"
                    />
                </span>
                {{
                    mandate.details.cardLabel && mandate.details.cardHolder && mandate.details.cardNumber
                        ? `${mandate.details.cardLabel} - ${mandate.details.cardHolder} - **** ${mandate.details.cardNumber}`
                        : 'Invalid'
                }}
            </label>
        </div>

        <div class="mollie-credit-card-mandates__radio">
            <input
                id="mollie-credit-card-new"
                v-model="activeMandate"
                class="mollie-credit-card-mandates__radio-input"
                type="radio"
                :value="newCardSelectValue"
                :checked="activeMandate === newCardSelectValue"
                @change="changeMandate"
            />
            <label
                for="mollie-credit-card-new"
                class="mollie-credit-card-mandates__radio-label"
            >
                <span
                    class="mollie-credit-card-mandates__radio-styled"
                    :class="{ 'is-checked': activeMandate === newCardSelectValue }"
                >
                    <span
                        v-if="activeMandate === newCardSelectValue"
                        class="mollie-credit-card-mandates__radio-styled-checked"
                    />
                </span>
                {{ mandateOrNewText ?? 'New Card' }}
            </label>
        </div>
    </div>
</template>
