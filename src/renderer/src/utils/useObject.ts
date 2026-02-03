export function clearUndefined<T extends Record<PropertyKey, unknown>>(obj: T): T {
  const keys = Object.keys(obj) as Array<keyof T>
  keys.forEach((key) => {
    if (obj[key] === undefined) {
      delete obj[key]
    }
  })
  return obj
}
