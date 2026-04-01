const openNextCloudflareContextSymbol = Symbol.for('__cloudflare-context__');

type RuntimeProcess = {
  env?: Record<string, unknown>;
};

type RuntimeGlobal = typeof globalThis & {
  __PLAYGROUND_ENV__?: Partial<Env>;
  process?: RuntimeProcess;
};

export type CloudflareContext = {
  env: Env;
};

type CloudflareContextLike = {
  env?: Env | Partial<Env>;
};

function getOpenNextCloudflareContextFromSymbol(): CloudflareContext | null {
  const runtimeGlobal = globalThis as RuntimeGlobal & Record<PropertyKey, unknown>;
  const openNextContext = runtimeGlobal[openNextCloudflareContextSymbol] as CloudflareContextLike | undefined;
  if (!openNextContext?.env) {
    return null;
  }

  return { env: openNextContext.env as Env };
}

async function getOpenNextCloudflareContextFromApi(): Promise<CloudflareContext | null> {
  try {
    const mod = await import('@opennextjs/cloudflare');
    const context = await mod.getCloudflareContext({ async: true });
    if (!context?.env) {
      return null;
    }

    return { env: context.env as Env };
  } catch {
    return null;
  }
}

function getFallbackCloudflareContext(): CloudflareContext | null {
  const runtimeGlobal = globalThis as RuntimeGlobal;
  const runtimeEnv = runtimeGlobal.__PLAYGROUND_ENV__;
  const processEnv = runtimeGlobal.process?.env;

  if (!runtimeEnv && !processEnv) {
    return null;
  }

  return {
    env: {
      ...(processEnv ?? {}),
      ...(runtimeEnv ?? {}),
    } as Env,
  };
}

export async function getCloudflareContext(): Promise<CloudflareContext> {
  const openNextApiContext = await getOpenNextCloudflareContextFromApi();
  if (openNextApiContext) {
    return openNextApiContext;
  }

  const openNextSymbolContext = getOpenNextCloudflareContextFromSymbol();
  if (openNextSymbolContext) {
    return openNextSymbolContext;
  }

  const fallbackContext = getFallbackCloudflareContext();
  if (fallbackContext) {
    return fallbackContext;
  }

  throw new Error(
    'Cloudflare runtime context is not available. Make sure local OpenNext dev initializes its context and Playground preview exposes __PLAYGROUND_ENV__.',
  );
}

export function getCloudflareContextSync(): CloudflareContext {
  const openNextSymbolContext = getOpenNextCloudflareContextFromSymbol();
  if (openNextSymbolContext) {
    return openNextSymbolContext;
  }

  const fallbackContext = getFallbackCloudflareContext();
  if (fallbackContext) {
    return fallbackContext;
  }

  throw new Error(
    'Cloudflare runtime context is not available synchronously. Use await getCloudflareContext() during local OpenNext dev, and make sure Playground preview exposes __PLAYGROUND_ENV__.',
  );
}

export async function getRuntimeContext(): Promise<CloudflareContext> {
  return getCloudflareContext();
}

export function getRuntimeContextSync(): CloudflareContext {
  return getCloudflareContextSync();
}

export async function getRuntimeEnv(): Promise<Env> {
  return (await getRuntimeContext()).env;
}

export function getRuntimeEnvSync(): Env {
  return getRuntimeContextSync().env;
}

export const getContext = getRuntimeContext;
export const getContextSync = getRuntimeContextSync;
