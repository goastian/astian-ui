import { shouldCloseProductDrawer } from '@/utils/navigation'

describe('product navigation', () => {
  it('keeps persistent navigation open on desktop', () => {
    expect(shouldCloseProductDrawer(false)).toBe(false)
  })

  it('closes overlay navigation after a choice on mobile', () => {
    expect(shouldCloseProductDrawer(true)).toBe(true)
  })
})
