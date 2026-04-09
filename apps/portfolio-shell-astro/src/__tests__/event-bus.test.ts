import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EventBus } from '@mf/shared'

type TestEvents = {
  'test-event': { message: string }
  'count-event': { count: number }
}

describe('EventBus', () => {
  let bus: EventBus<TestEvents>

  beforeEach(() => {
    bus = new EventBus<TestEvents>()
  })

  describe('on()', () => {
    it('should register a handler and return unsubscribe function', () => {
      const handler = vi.fn()
      const unsubscribe = bus.on('test-event', handler)

      expect(typeof unsubscribe).toBe('function')
      expect(bus.listenerCount('test-event')).toBe(1)
    })

    it('should throw if handler is not a function', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        bus.on('test-event', 'not-a-function')
      }).toThrow('Handler must be a function')
    })

    it('should throw if max handlers exceeded', () => {
      const smallBus = new EventBus<TestEvents>({ maxHandlersPerEvent: 2 })

      smallBus.on('test-event', () => {})
      smallBus.on('test-event', () => {})

      expect(() => {
        smallBus.on('test-event', () => {})
      }).toThrow('Max handlers')
    })

    it('should allow multiple handlers for same event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      bus.on('test-event', handler1)
      bus.on('test-event', handler2)

      expect(bus.listenerCount('test-event')).toBe(2)
    })
  })

  describe('emit()', () => {
    it('should call all registered handlers', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      bus.on('test-event', handler1)
      bus.on('test-event', handler2)

      bus.emit('test-event', { message: 'hello' })

      expect(handler1).toHaveBeenCalledWith({ message: 'hello' })
      expect(handler2).toHaveBeenCalledWith({ message: 'hello' })
    })

    it('should not throw if no handlers registered', () => {
      expect(() => {
        bus.emit('test-event', { message: 'test' })
      }).not.toThrow()
    })

    it('should catch and log handler errors', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const throwingHandler = vi.fn(() => {
        throw new Error('Handler error')
      })

      bus.on('test-event', throwingHandler)

      expect(() => {
        bus.emit('test-event', { message: 'test' })
      }).not.toThrow()

      expect(consoleError).toHaveBeenCalled()
      consoleError.mockRestore()
    })
  })

  describe('off()', () => {
    it('should remove a specific handler', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      bus.on('test-event', handler1)
      bus.on('test-event', handler2)

      bus.off('test-event', handler1)

      expect(bus.listenerCount('test-event')).toBe(1)

      bus.emit('test-event', { message: 'test' })
      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })

    it('should handle removing non-existent handler gracefully', () => {
      const handler = vi.fn()

      expect(() => {
        bus.off('test-event', handler)
      }).not.toThrow()
    })
  })

  describe('unsubscribe function', () => {
    it('should remove handler when called', () => {
      const handler = vi.fn()
      const unsubscribe = bus.on('test-event', handler)

      unsubscribe()

      expect(bus.listenerCount('test-event')).toBe(0)

      bus.emit('test-event', { message: 'test' })
      expect(handler).not.toHaveBeenCalled()
    })

    it('should be idempotent', () => {
      const handler = vi.fn()
      const unsubscribe = bus.on('test-event', handler)

      unsubscribe()
      unsubscribe()

      expect(bus.listenerCount('test-event')).toBe(0)
    })
  })

  describe('clear()', () => {
    it('should remove all handlers for a specific event', () => {
      bus.on('test-event', vi.fn())
      bus.on('test-event', vi.fn())
      bus.on('count-event', vi.fn())

      bus.clear('test-event')

      expect(bus.listenerCount('test-event')).toBe(0)
      expect(bus.listenerCount('count-event')).toBe(1)
    })

    it('should remove all handlers for all events', () => {
      bus.on('test-event', vi.fn())
      bus.on('count-event', vi.fn())

      bus.clear()

      expect(bus.listenerCount('test-event')).toBe(0)
      expect(bus.listenerCount('count-event')).toBe(0)
    })
  })

  describe('listenerCount()', () => {
    it('should return correct count', () => {
      expect(bus.listenerCount('test-event')).toBe(0)

      bus.on('test-event', vi.fn())
      expect(bus.listenerCount('test-event')).toBe(1)

      bus.on('test-event', vi.fn())
      expect(bus.listenerCount('test-event')).toBe(2)
    })
  })

  describe('debug mode', () => {
    it('should log when debug is enabled', () => {
      const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugBus = new EventBus<TestEvents>({ debug: true })

      debugBus.on('test-event', vi.fn())
      debugBus.emit('test-event', { message: 'test' })

      expect(consoleLog).toHaveBeenCalled()
      consoleLog.mockRestore()
    })
  })
})
