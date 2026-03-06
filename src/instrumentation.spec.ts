import { describe, it } from 'node:test'
import assert from 'node:assert'
import { register } from './instrumentation'

describe('register', () => {
  it('is an async function', () => {
    assert.strictEqual(typeof register, 'function')
    assert.strictEqual(register.constructor.name, 'AsyncFunction')
  })
})
