export async function register() {
  const { NEXT_RUNTIME, API_MOCKING } = process.env
  if (NEXT_RUNTIME !== 'nodejs' || API_MOCKING !== 'enabled') {
    return
  }
  const { server } = await import('./mocks/node')
  server.listen({ onUnhandledRequest: 'bypass' })
}
