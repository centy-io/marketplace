import { describe, it } from 'node:test'
import assert from 'node:assert'
import { handlers } from './handlers'

describe('handlers', () => {
  it('exports an array of request handlers', () => {
    assert.ok(Array.isArray(handlers))
    assert.ok(handlers.length > 0)
  })
})
