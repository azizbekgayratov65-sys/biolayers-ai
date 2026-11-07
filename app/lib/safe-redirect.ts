/*
  Returns `value` only when it is a same-site relative path such as
  "/settings" or "/mindmap/abc?x=1". Anything else (absolute URLs,
  protocol-relative "//host", backslash tricks, "javascript:" and
  other schemes, control characters) falls back to `fallback`, so a
  crafted ?next= link cannot redirect users off-site or run script.
*/
export function safeNextPath(
  value: string | null | undefined,
  fallback = "/settings",
): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\u0000-\u001f\u007f\\]/.test(value)
  ) {
    return fallback;
  }

  return value;
}
