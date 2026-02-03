export function resizeObserver<T extends Element>(
  element: T,
  callback: () => void,
) {
  const observer = new ResizeObserver(() => {
    callback()
  })

  observer.observe(element)
}
