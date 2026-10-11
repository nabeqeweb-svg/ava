export function getEnv(key: string, fallback?: string): string {
  const v = process.env[key] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing env: ${key}`);
  }
  return v;
}

export function getOptionalEnv(key: string): string | undefined {
  return process.env[key];
}
