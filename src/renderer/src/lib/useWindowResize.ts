export default function (fn: () => void) {
  window.addEventListener('resize', fn)
}
