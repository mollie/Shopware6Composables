<script setup lang="ts">
import { ref } from 'vue'
import NavigationBar from '~/components/NavigationBar.vue'
const show = ref(false)
const CreditCardError = ref()
const CreditCardToken = ref()
</script>

<template>
    <div>
        <NavigationBar />

        <h1>Load Mollie script lazily</h1>
        <div>On this page the scripts load lazily, if the button is clicked.</div>
        <div>To test this, the option <i>isIncludedGlobally: false</i> has to be set in nuxt config.</div>
        <br />
        <br />
        <div>
            <button @click="show = !show">{{ show ? 'Hide' : 'Show' }} payment components</button>
            <p v-if="show">
                <LazyShopwareFrontendsCreditCard
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
            </p>
        </div>
    </div>
</template>

<style scoped></style>
