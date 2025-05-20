function toCamelCase(str: string) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function keysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamelCase(k), keysToCamelCase(v)])
    );
  }
  return obj;
}
