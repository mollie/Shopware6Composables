import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useNuxtApp } from '#imports'
import { useMollie } from './src/runtime/composables/useMollie'

vi.mock('#imports', () => ({
    useNuxtApp: vi.fn(),
}))

describe('useMollie', () => {
    let mockApp
    let mockCreateMollieInstance
    let mockCreateToken
    let mockConsoleError

    beforeEach(() => {
        mockCreateMollieInstance = vi.fn()
        mockCreateToken = vi.fn()
        mockConsoleError = vi.fn()

        mockApp = {
            $mollie: {
                createMollieInstance: mockCreateMollieInstance,
                mollieInstance: {
                    createToken: mockCreateToken,
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

    it('should call createMollieInstance on init', async () => {
        const { init } = useMollie()
        await init()

        expect(mockCreateMollieInstance).toHaveBeenCalledWith({})
    })

    it('should call createToken and return the token on getToken', async () => {
        const mockToken = 'mockToken'
        mockCreateToken.mockResolvedValueOnce({ token: mockToken })

        const { getToken } = useMollie()
        const result = await getToken()

        expect(mockCreateToken).toHaveBeenCalled()
        expect(result).toEqual(mockToken)
    })

    it('should handle error and throw on getToken if mollieInstance.createToken returns an error', async () => {
        const mockError = 'Mock error message'
        mockCreateToken.mockResolvedValueOnce({ error: { message: mockError } })

        const { getToken } = useMollie()

        await expect(getToken()).rejects.toThrow(mockError)
        expect(mockConsoleError).toHaveBeenCalledWith(`[useMollie][getToken]: ${mockError}`)
    })
})
