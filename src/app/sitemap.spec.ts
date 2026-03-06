import { describe, it } from 'node:test'
import assert from 'node:assert'
import sitemap from './sitemap'

describe('sitemap', () => {
  it('returns an array of sitemap entries with urls', () => {
    const entries = sitemap()
    assert.ok(Array.isArray(entries))
    assert.ok(entries.length > 0)
    assert.ok('url' in entries[0])
  })
})
