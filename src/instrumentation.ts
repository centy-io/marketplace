export async function register() {
  if (
    process.env.NEXT_RUNTIME !== 'nodejs' ||
    process.env.API_MOCKING !== 'enabled'
  ) {
    return
  }
  const { server } = await import('./mocks/node')
  server.listen({ onUnhandledRequest: 'bypass' })
}
