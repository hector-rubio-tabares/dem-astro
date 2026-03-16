import { describe, it, expect } from 'vitest'
import {
  validateTabMessage,
  validateMultiTabMessage,
  safeValidateTabMessage,
  safeValidateMultiTabMessage,
  sanitizeDisplayString,
} from '@mf/shared'

describe('Message Validator', () => {
  describe('validateTabMessage()', () => {
    it('should accept valid tab message', () => {
      const validPayload = { source: 'react', count: 42 }

      expect(() => {
        validateTabMessage(validPayload)
      }).not.toThrow()
    })

    it('should accept all allowed sources', () => {
      const sources = ['react', 'angular', 'astro']

      sources.forEach(source => {
        expect(() => {
          validateTabMessage({ source, count: 0 })
        }).not.toThrow()
      })
    })

    it('should reject invalid source', () => {
      expect(() => {
        validateTabMessage({ source: 'malicious', count: 0 })
      }).toThrow('Invalid source')
    })

    it('should reject non-object payload', () => {
      expect(() => {
        validateTabMessage(null)
      }).toThrow('must be an object')

      expect(() => {
        validateTabMessage('string')
      }).toThrow('must be an object')

      expect(() => {
        validateTabMessage(123)
      }).toThrow('must be an object')
    })

    it('should reject non-number count', () => {
      expect(() => {
        validateTabMessage({ source: 'react', count: '42' })
      }).toThrow('must be a finite number')
    })

    it('should reject infinite count', () => {
      expect(() => {
        validateTabMessage({ source: 'react', count: Infinity })
      }).toThrow('must be a finite number')

      expect(() => {
        validateTabMessage({ source: 'react', count: NaN })
      }).toThrow('must be a finite number')
    })

    it('should reject negative count', () => {
      expect(() => {
        validateTabMessage({ source: 'react', count: -1 })
      }).toThrow('out of range')
    })

    it('should reject count exceeding max', () => {
      expect(() => {
        validateTabMessage({ source: 'react', count: 2_000_000 })
      }).toThrow('out of range')
    })
  })

  describe('validateMultiTabMessage()', () => {
    it('should accept valid multi-tab message', () => {
      const validPayload = {
        source: 'react',
        count: 42,
        tabId: 'abc1234'
      }

      expect(() => {
        validateMultiTabMessage(validPayload)
      }).not.toThrow()
    })

    it('should reject invalid tabId format', () => {
      expect(() => {
        validateMultiTabMessage({
          source: 'react',
          count: 0,
          tabId: 'invalid-format'
        })
      }).toThrow('Invalid tabId format')

      expect(() => {
        validateMultiTabMessage({
          source: 'react',
          count: 0,
          tabId: '123' // too short
        })
      }).toThrow('Invalid tabId format')
    })

    it('should reject missing tabId', () => {
      expect(() => {
        validateMultiTabMessage({
          source: 'react',
          count: 0
        })
      }).toThrow('Invalid tabId format')
    })

    it('should inherit tab message validations', () => {
      expect(() => {
        validateMultiTabMessage({
          source: 'malicious',
          count: 0,
          tabId: 'abc1234'
        })
      }).toThrow('Invalid source')
    })
  })

  describe('safeValidateTabMessage()', () => {
    it('should return parsed message on valid input', () => {
      const valid = { source: 'react', count: 42 }
      const result = safeValidateTabMessage(valid)

      expect(result).toEqual(valid)
    })

    it('should return null on invalid input', () => {
      const invalid = { source: 'malicious', count: 0 }
      const result = safeValidateTabMessage(invalid)

      expect(result).toBeNull()
    })

    it('should not throw on invalid input', () => {
      expect(() => {
        safeValidateTabMessage({ invalid: true })
      }).not.toThrow()
    })
  })

  describe('safeValidateMultiTabMessage()', () => {
    it('should return parsed message on valid input', () => {
      const valid = { source: 'react', count: 42, tabId: 'abc1234' }
      const result = safeValidateMultiTabMessage(valid)

      expect(result).toEqual(valid)
    })

    it('should return null on invalid input', () => {
      const invalid = { source: 'react', count: 0, tabId: 'bad' }
      const result = safeValidateMultiTabMessage(invalid)

      expect(result).toBeNull()
    })
  })

  describe('sanitizeDisplayString()', () => {
    it('should remove HTML/script characters', () => {
      expect(sanitizeDisplayString('<script>')).toBe('script')
      expect(sanitizeDisplayString('test&test')).toBe('testtest')
      expect(sanitizeDisplayString('"quoted"')).toBe('quoted')
      expect(sanitizeDisplayString("'single'")).toBe('single')
    })

    it('should truncate to max length', () => {
      const longString = 'a'.repeat(200)
      const result = sanitizeDisplayString(longString, 50)

      expect(result.length).toBe(50)
    })

    it('should preserve safe characters', () => {
      const safe = 'react-component_123'
      expect(sanitizeDisplayString(safe)).toBe(safe)
    })

    it('should use default max length of 100', () => {
      const longString = 'a'.repeat(200)
      const result = sanitizeDisplayString(longString)

      expect(result.length).toBe(100)
    })
  })
})
