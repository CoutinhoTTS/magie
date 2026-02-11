export function mid(a: number, b: number, c: number) {
  return a + b + c - Math.max(a, b, c) - Math.min(a, b, c)
}
