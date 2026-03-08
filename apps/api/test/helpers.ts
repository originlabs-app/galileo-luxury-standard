/**
 * Parse Set-Cookie headers and return a map of cookie name → value.
 */
export function parseCookies(response: {
  headers: Record<string, string | string[] | undefined>;
}): Record<string, string> {
  const raw = response.headers["set-cookie"];
  if (!raw) return {};
  const arr = Array.isArray(raw) ? raw : [raw];
  const result: Record<string, string> = {};
  for (const header of arr) {
    const [pair] = header.split(";");
    const [name, ...rest] = pair!.split("=");
    result[name!.trim()] = rest.join("=").trim();
  }
  return result;
}
