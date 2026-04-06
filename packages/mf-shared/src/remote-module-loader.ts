export const DEFAULT_TIMEOUT_MS = 8000;

export function assertAllowedOrigin(url: string, allowedOrigins: Set<string>): void {
  const parsed = new URL(url, window.location.origin);

  if (!allowedOrigins.has(parsed.origin)) {
    throw new Error(
      `[RemoteLoader] Unauthorized origin: ${parsed.origin}. ` +
      `Allowed: ${Array.from(allowedOrigins).join(', ')}`
    );
  }
}

export async function loadRemoteModule<T = unknown>(
  url: string,
  options?: {
    timeout?: number;
    allowedOrigins?: Set<string>;
  }
): Promise<T> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS;

  if (options?.allowedOrigins && options.allowedOrigins.size > 0) {
    assertAllowedOrigin(url, options.allowedOrigins);
  }

  try {
    const module = await Promise.race<T>([
      import(/* @vite-ignore */ url) as Promise<T>,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`[RemoteLoader] Timeout loading: ${url}`)),
          timeout
        )
      ),
    ]);

    return module;
  } catch (error) {
    throw error;
  }
}

export function assertMountContract(module: Record<string, unknown>, methodName = 'mount'): void {
  if (typeof module[methodName] !== 'function') {
    throw new Error(
      `[RemoteLoader] Module does not expose method '${methodName}'`
    );
  }
}
