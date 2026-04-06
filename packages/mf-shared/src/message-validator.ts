export interface TabMessage {
  source: string
  count: number
  instanceId?: string
}

export interface MultiTabMessage extends TabMessage {
  tabId: string
}

const ALLOWED_SOURCES = new Set(['react', 'angular', 'astro'])
const MAX_COUNT = 1_000_000
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function validateTabMessage(payload: unknown): asserts payload is TabMessage {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[Validator] Invalid payload: must be an object')
  }

  const msg = payload as Record<string, unknown>

  if (typeof msg['source'] !== 'string' || !ALLOWED_SOURCES.has(msg['source'])) {
    throw new Error(
      `[Validator] Invalid source: "${msg['source']}". Allowed: ${[...ALLOWED_SOURCES].join(', ')}`
    )
  }

  if (typeof msg['count'] !== 'number' || !Number.isFinite(msg['count'])) {
    throw new Error(`[Validator] Invalid count: must be a finite number`)
  }

  if (msg['count'] < 0 || msg['count'] > MAX_COUNT) {
    throw new Error(`[Validator] Count out of range: ${msg['count']} (max: ${MAX_COUNT})`)
  }
}

export function validateMultiTabMessage(payload: unknown): asserts payload is MultiTabMessage {
  validateTabMessage(payload)

  const msg = payload as unknown as Record<string, unknown>

  if (typeof msg['tabId'] !== 'string' || !UUID_PATTERN.test(msg['tabId'])) {
    throw new Error(`[Validator] Invalid tabId format: "${msg['tabId']}"`)
  }
}

export function safeValidateTabMessage(payload: unknown): TabMessage | null {
  try {
    validateTabMessage(payload)
    return payload as TabMessage
  } catch {
    return null
  }
}

export function safeValidateMultiTabMessage(payload: unknown): MultiTabMessage | null {
  try {
    validateMultiTabMessage(payload)
    return payload as MultiTabMessage
  } catch {
    return null
  }
}

export function sanitizeDisplayString(str: string, maxLength = 100): string {
  return str
    .replace(/[<>"'&]/g, '')
    .slice(0, maxLength)
}
