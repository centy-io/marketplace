import { describe, it } from 'node:test'
import assert from 'node:assert'
import robots from './robots'

describe('robots', () => {
  it('returns robots metadata with rules and sitemap', () => {
    const result = robots()
    assert.ok(typeof result === 'object')
    assert.ok('rules' in result)
    assert.ok('sitemap' in result)
  })
})
