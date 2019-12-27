import isEmpty from './isEmpty'

describe('utils: isEmpty', () => {
  it('isEmpty', () => {
    expect(isEmpty('a')).toEqual(false)
    expect(isEmpty(0)).toEqual(false)
    expect(isEmpty(true)).toEqual(false)
    expect(isEmpty(false)).toEqual(false)
    expect(isEmpty('')).toEqual(true)
    expect(isEmpty('   ')).toEqual(true)
    expect(isEmpty({})).toEqual(true)
    expect(isEmpty([])).toEqual(true)
    expect(isEmpty(null)).toEqual(true)
    expect(isEmpty(undefined)).toEqual(true)
  })
})
