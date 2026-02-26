function normalizeOrigin(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getInternalBaseUrl(): string {
  const configuredOrigin = process.env.INTERNAL_BASE_URL;

  if (configuredOrigin) {
    return normalizeOrigin(configuredOrigin);
  }

  if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT ?? "3000";
    return `http://127.0.0.1:${port}`;
  }

  throw new Error("Missing INTERNAL_BASE_URL environment variable in production.");
}
