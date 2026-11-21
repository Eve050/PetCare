export function wait(ms = 420) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
