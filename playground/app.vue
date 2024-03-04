<script setup>
import { ref } from 'vue'
const CreditCardError = ref()
const CreditCardToken = ref()

const IdealError = ref()
</script>
<template>
    <h1>Nuxt mollie payments components</h1>

    <h2>Credit Card</h2>

    <ShopwareFrontendsCreditCard
        submit-button-label="Save"
        locale="en_US"
        :submit-disabled="!!CreditCardToken"
        @submit="
            (token) => {
                CreditCardToken = `${token} ✔️`
                CreditCardError = null
            }
        "
        @error="
            (message) => {
                CreditCardError = `${message} ❌`
            }
        "
    />

    <div class="demo-mollie-results">
        <div>
            Test Credit Number:
            <pre>2223 0000 1047 9399</pre>
        </div>
        <hr />
        <div v-if="CreditCardError">Error: {{ CreditCardError }}</div>
        <div v-if="CreditCardToken">Token: {{ CreditCardToken }}</div>
    </div>

    <h2>Ideal</h2>

    <ShopwareFrontendsIdeal
        locale="en_US"
        select-label="Please choose your bank:"
        select-disabled-option="Select your bank"
        @save-issuer-success="
            () => {
                IdealError = null
            }
        "
        @save-issuer-error="
            (message) => {
                IdealError = `${message} ❌`
            }
        "
    />
</template>
<style scoped>
.demo-mollie-results {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.9em;
    padding: 5px;
}

pre {
    font-size: 1.2em;
}
</style>
