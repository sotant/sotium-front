export async function fetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit,
  normalize: (payload: unknown) => T,
): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  return normalize(payload);
}
