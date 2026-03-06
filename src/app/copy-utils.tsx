const PM_KEY = 'pkg-manager'

export function getCommand(pkgName: string, pm: string): string {
  return pm === 'pnpm' ? `pnpm add ${pkgName}` : `npm install ${pkgName}`
}

export function subscribe(callback: () => void): () => void {
  window.addEventListener('pkg-manager-change', callback)
  return () => window.removeEventListener('pkg-manager-change', callback)
}

export function getSnapshot(): string {
  try {
    const stored = localStorage.getItem(PM_KEY)
    return stored !== null ? stored : 'npm'
  } catch {
    return 'npm'
  }
}

export function getServerSnapshot(): string {
  return 'npm'
}
