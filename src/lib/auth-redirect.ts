const DEFAULT_REDIRECT_PATH = "/dashboard";

function toSafeSameOriginUrl(requestUrl: URL, value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    const candidate = new URL(value, requestUrl.origin);
    return candidate.origin === requestUrl.origin ? candidate : null;
  } catch {
    return null;
  }
}

export function getSafeRedirectUrl(
  requestUrl: URL,
  value: string | null | undefined,
  fallback = DEFAULT_REDIRECT_PATH
) {
  return (
    toSafeSameOriginUrl(requestUrl, value) ??
    toSafeSameOriginUrl(requestUrl, fallback) ??
    new URL(DEFAULT_REDIRECT_PATH, requestUrl.origin)
  );
}
