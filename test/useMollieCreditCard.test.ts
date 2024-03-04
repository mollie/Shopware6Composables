import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useNuxtApp } from '#imports'
import { useMollieCreditCard } from './src/runtime/composables/useMollieCreditCard'

vi.mock('#imports', async () => ({
    ref: vi.fn((initialValue) => ({ value: initialValue })),
    useNuxtApp: vi.fn(),
}))

describe('useMollieCreditCard', () => {
    let mockApp
    let mockCreateComponent
    let mockMount
    let mockUnmount
    let mockConsoleError

    beforeEach(() => {
        mockMount = vi.fn()
        mockUnmount = vi.fn()
        mockConsoleError = vi.fn()

        mockCreateComponent = vi.fn().mockReturnValue({
            mount: mockMount,
            unmount: mockUnmount,
        })

        mockApp = {
            $mollie: {
                mollieInstance: {
                    createComponent: mockCreateComponent,
                },
            },
        }

        useNuxtApp.mockReturnValue(mockApp)

        // Redirect console.error to another function
        console.error = mockConsoleError
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should mount and unmount the Mollie Credit Card component', async () => {
        const elementId = 'mollie-credit-card-container'
        const { mount, unmount } = useMollieCreditCard({ elementId })

        await mount()

        expect(mockCreateComponent).toHaveBeenCalledWith('card')
        expect(mockMount).toHaveBeenCalledWith(`#${elementId}`)

        unmount()

        expect(mockUnmount).toHaveBeenCalled()
    })

    it('should handle errors during mount and throw an error', async () => {
        const elementId = 'mollie-credit-card-container'
        const errorMessage = 'Mount error'
        mockCreateComponent.mockRejectedValueOnce(errorMessage)

        const { mount } = useMollieCreditCard({ elementId })

        await expect(mount()).rejects.toThrow(errorMessage)
        expect(mockConsoleError).toHaveBeenCalledWith(`[useMollieCreditCard][mount]: ${errorMessage}`)
    })
})
