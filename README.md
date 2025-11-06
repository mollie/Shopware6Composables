# Vue components for Mollie Payments (Nuxt module)

-   [📖 &nbsp;Documentation](https://frontends.shopware.com)

## Usage

1. Install with your package manager:

```bash
pnpm add nuxt-mollie-payments-components
```

2. Add the new nuxt module to the modules section of your nuxt.config.ts:

```bash
{
  modules: [
    'nuxt-mollie-payments-components',
  ],
}
```

## Features

<!-- Highlight some of the features your module provide here -->

-   `useMollie` & `useMollieCreditCard` composable function
-   `MollieCreditCardComponent.vue` component to use in a Vue project
-   `ShopwareFrontendsCreditCard.vue` component to use in a Nuxt Shopware Powered project
-   `ShopwareFrontendsIdeal.vue` component to use in a Nuxt Shopware Powered project
-   WIP: `ShopwareFrontendsPos.vue` component to use in a Nuxt Shopware Powered project

## Requirements

-   Nuxt 3
-   installed: @shopware/nuxt-module / @shopware/composables - optional if you want to use `ShopwareFrontendsCreditCard` component which sends additional request to Mollie's endpoint in order to store Credit Card token.

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm dev:prepare

# Develop with the playground
pnpm dev

# Build the playground
pnpm dev:build

# Run ESLint
pnpm lint

# Run Vitest
pnpm test
pnpm test:watch

# Release new version
pnpm release
```

## Integration in vue-demo-store checkout page

vue-demo-store checkout page:
https://github.com/shopware/frontends/blob/main/templates/vue-demo-store/pages/checkout/index.vue

### Credit card example:

Create a custom placeOrder function in your checkout page and react to the paymentUrl change:

```vue
<script setup lang="ts">
// ...

const mollieConfig = ref()
const creditCardError = ref()
const creditCardToken = ref()
const creditCardSaveCardChange = ref(false)
const creditCardActiveMandate = ref()
const creditCardFormMounted = ref(false)

const isMollieCreditCardPaymentMethod = computed(() => paymentMethod.value?.shortName === 'credit_card_payment')

const placeOrder = async () => {
    placeOrderTriggered.value = true
    if (!terms.tos) {
        termsBox.value.scrollIntoView()
        return
    }

    isLoading['placeOrder'] = true

    if (isMollieCreditCardPaymentMethod.value) {
        // save mandate id if needed
        if (creditCardActiveMandate.value) {
            try {
                await apiClient.invoke(
                    `saveMandateId post /mollie/creditcard/store-mandate-id/${user.value?.id}/${creditCardActiveMandate.value}`,
                )
            } catch (e) {
                throw new Error('Error: could not save credit card mandate')
            }
            // save credit card details if needed (this is not needed if the credit card form uses it's own save button)
        } else if (!creditCardToken.value) {
            try {
                const { getToken } = useMollie()
                creditCardToken.value = await getToken()

                await apiClient.invoke(
                    `saveCardToken post /mollie/creditcard/store-token/${user.value?.id}/${creditCardToken.value}`,
                    { shouldSaveCardDetail: creditCardSaveCardChange.value },
                )
            } catch (e) {
                throw new Error('Error: could not save credit card details')
            }
        }
    }

    if (userComment.text !== '') {
        order.value = await createOrder({ customerComment: userComment.text })
    } else {
        order.value = await createOrder()
    }

    if (!isMollieCreditCardPaymentMethod.value) {
        await push(localePath('/checkout/success/' + order.value.id))
        refreshCart()
    } else {
        const SUCCESS_PAYMENT_URL = `${window?.location?.origin}/checkout/success/${order.value.id}/paid`
        const FAILURE_PAYMENT_URL = `${window?.location?.origin}/checkout/success/${order.value.id}/unpaid`

        await handlePayment(SUCCESS_PAYMENT_URL, FAILURE_PAYMENT_URL)
    }

    isLoading['placeOrder'] = false
}

watchDebounced(
    paymentUrl,
    (paymentUrl) => {
        if (typeof paymentUrl !== 'string') {
            return
        }
        try {
            new URL(paymentUrl as string)
            window.location.href = paymentUrl
        } catch (error) {
            throw new Error('error, redirect')
        }
    },
    { debounce: 100 },
)

// ...
</script>

<template>
    <div
        v-for="paymentMethodItem in paymentMethods"
        v-else
        :key="paymentMethodItem.id"
        class="flex flex-col"
    >
        <!-- PAYMENT RADIO BUTTON -->

        <div
            v-if="paymentMethod?.id === paymentMethodItem.id && isMollieCreditCardPaymentMethod"
            class="pt-6 pb-3"
        >
            <!-- YOUR LOADER COMPONENT -->
            <SharedLoader v-if="!creditCardFormMounted" />

            <ShopwareFrontendsCreditCard
                submit-button-label="Save"
                :locale="'en_US'"
                :submit-disabled="!!creditCardToken"
                :hide-save-button="true"
                @should-save-card-details="
                    (value: boolean) => {
                        creditCardSaveCardChange = value
                    }
                "
                @config-loaded="
                    (config: MollieConfig) => {
                        mollieConfig = config
                    }
                "
                @error="
                    (message: string | undefined) => {
                        creditCardError = `${message}`
                    }
                "
                @store-mandate="
                    (mandateId: string | undefined) => {
                        creditCardActiveMandate = mandateId
                    }
                "
                @mounted="creditCardFormMounted = true"
            />

            <div class="demo-mollie-results-credit-card">
                <div v-if="creditCardError">Error: {{ creditCardError }}</div>
            </div>
        </div>
    </div>
</template>
```

### Ideal example:

Create a custom placeOrder function in your checkout page and react to the paymentUrl change:

```vue
<script setup lang="ts">
// ...

const idealError = ref()
const isMollieIdealPaymentMethod = computed(() => paymentMethod.value?.shortName === 'i_deal_payment')

const placeOrder = async () => {
    placeOrderTriggered.value = true
    if (!terms.tos) {
        termsBox.value.scrollIntoView()
        return
    }

    isLoading['placeOrder'] = true

    if (userComment.text !== '') {
        order.value = await createOrder({ customerComment: userComment.text })
    } else {
        order.value = await createOrder()
    }

    if (!isMollieIdealPaymentMethod.value) {
        await push(localePath('/checkout/success/' + order.value.id))
        refreshCart()
    } else {
        const SUCCESS_PAYMENT_URL = `${window?.location?.origin}/checkout/success/${order.value.id}/paid`
        const FAILURE_PAYMENT_URL = `${window?.location?.origin}/checkout/success/${order.value.id}/unpaid`

        await handlePayment(SUCCESS_PAYMENT_URL, FAILURE_PAYMENT_URL)
    }

    isLoading['placeOrder'] = false
}

watchDebounced(
    paymentUrl,
    (paymentUrl) => {
        if (typeof paymentUrl !== 'string') {
            return
        }
        try {
            new URL(paymentUrl as string)
            window.location.href = paymentUrl
        } catch (error) {
            throw new Error('error, redirect')
        }
    },
    { debounce: 100 },
)

// ...
</script>

<template>
    <div
        v-for="paymentMethodItem in paymentMethods"
        v-else
        :key="paymentMethodItem.id"
        class="flex flex-col"
    >
        <!-- PAYMENT RADIO BUTTON -->

        <div
            v-else-if="paymentMethod?.id === paymentMethodItem.id && isMollieIdealPaymentMethod"
            class="pt-6 pb-3"
        >
            <ShopwareFrontendsIdeal
                :locale="'en_US'"
                select-label="Please choose your bank:"
                select-disabled-option="Select your bank"
                @save-issuer-success="
                    () => {
                        idealError = null
                    }
                "
                @save-issuer-error="
                    (message: string | undefined) => {
                        idealError = `${message}`
                    }
                "
            />

            <div class="demo-mollie-results-ideal">
                <div v-if="idealError">Error: {{ idealError }}</div>
            </div>
        </div>
    </div>
</template>
```

### POS example:

Create a custom placeOrder function in your checkout page and react to the paymentUrl change:

```vue
<script setup lang="ts">
// ...

const posError = ref()
const isMolliePosPaymentMethod = computed(() => paymentMethod.value?.shortName === 'pos_payment')

const placeOrder = async () => {
    placeOrderTriggered.value = true
    if (!terms.tos) {
        termsBox.value.scrollIntoView()
        return
    }

    isLoading['placeOrder'] = true

    if (userComment.text !== '') {
        order.value = await createOrder({ customerComment: userComment.text })
    } else {
        order.value = await createOrder()
    }

    if (!isMolliePosPaymentMethod.value) {
        await push(localePath('/checkout/success/' + order.value.id))
        refreshCart()
    } else {
        const SUCCESS_PAYMENT_URL = `${window?.location?.origin}/checkout/success/${order.value.id}/paid`
        const FAILURE_PAYMENT_URL = `${window?.location?.origin}/checkout/success/${order.value.id}/unpaid`

        await handlePayment(SUCCESS_PAYMENT_URL, FAILURE_PAYMENT_URL)
    }

    isLoading['placeOrder'] = false
}

watchDebounced(
    paymentUrl,
    (paymentUrl) => {
        if (typeof paymentUrl !== 'string') {
            return
        }
        try {
            new URL(paymentUrl as string)
            window.location.href = paymentUrl
        } catch (error) {
            throw new Error('error, redirect')
        }
    },
    { debounce: 100 },
)

// ...
</script>

<template>
    <div
        v-for="paymentMethodItem in paymentMethods"
        v-else
        :key="paymentMethodItem.id"
        class="flex flex-col"
    >
        <!-- PAYMENT RADIO BUTTON -->

        <div
            v-else-if="paymentMethod?.id === paymentMethodItem.id && isMolliePosPaymentMethod"
            class="pt-6 pb-3"
        >
            <ShopwareFrontendsPos
                :locale="'en_US'"
                select-label="Please choose your terminal:"
                select-disabled-option="Select your terminal"
                @save-terminal-success="
                    () => {
                        posError = null
                    }
                "
                @save-terminal-error="
                    (message: string | undefined) => {
                        posError = `${message}`
                    }
                "
            />

            <div class="demo-mollie-results-pos">
                <div v-if="posError">Error: {{ posError }}</div>
            </div>
        </div>
    </div>
</template>
```
