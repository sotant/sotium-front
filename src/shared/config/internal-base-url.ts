export function getInternalBaseUrl(): string {
  const explicitBaseUrl = process.env.INTERNAL_BASE_URL;

  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }

  const port = process.env.PORT ?? "3000";
  return `http://127.0.0.1:${port}`;
}
